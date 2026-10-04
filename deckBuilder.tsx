import { Box, Button, Divider, MenuItem, Select, Stack, TextField, Typography } from "@mui/material"
import { RuleProperties, TopLevelCondition } from "json-rules-engine"
import { App, MarkdownView, Modal, Notice } from "obsidian"
import React, { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { createRoot, Root } from "react-dom/client"

import { AosrAPI } from "api"
import { ParseRule } from "deck"
import { Pattern } from "Pattern"

interface Condition {
    fact: string
    path: string
    operator: string
    value: string
}

interface Option {
    value: string
    // 下拉框的文案走 i18n，这里只存 key，实际文字在 language.ts 里
    key: string
}

// value 必须与 deck.tsx 里 convertToFact() 产出的 fact 一致
const FACTS: Option[] = [
    { value: "card", key: "DeckBuilderFactCard" },
    { value: "file", key: "DeckBuilderFactFile" },
]

const PATHS: Record<string, Option[]> = {
    card: [
        { value: "$.path", key: "DeckBuilderPathFilePath" },
        { value: "$.tags", key: "DeckBuilderPathCardTags" },
        { value: "$.text", key: "DeckBuilderPathCardText" },
        { value: "$.outline", key: "DeckBuilderPathHeadings" },
    ],
    file: [
        { value: "$.tags", key: "DeckBuilderPathFrontmatterTags" },
    ],
}

const OPERATORS: Option[] = [
    { value: "regexMatch", key: "DeckBuilderOpRegexMatch" },
    { value: "contains", key: "DeckBuilderOpContains" },
    { value: "equal", key: "DeckBuilderOpEqual" },
]

// 对应 json-rules-engine 的 all / any / not
const MODES: Option[] = [
    { value: "all", key: "DeckBuilderModeAll" },
    { value: "any", key: "DeckBuilderModeAny" },
    { value: "not", key: "DeckBuilderModeNot" },
]

const MODE_HINTS: Record<string, string> = {
    all: "DeckBuilderHintAll",
    any: "DeckBuilderHintAny",
    not: "DeckBuilderHintNot",
}

const SELECT_WIDTH = {fact: 110, path: 105, operator: 150, mode: 190}

// MUI 的默认主题是浅色的：text.primary / text.secondary / divider / action.disabled
// 全是写死的黑色系，Obsidian 切到暗色主题后这些字就看不见了。本仓库没有配 MUI 主题，
// view.tsx 的做法是在组件上直接写 Obsidian 的 CSS 变量，这里沿用同一套。
const FIELD_SX = {
    // InputBase 把 color 直接声明在 .MuiInputBase-input 上，父级设 color 赢不过它
    '& .MuiInputBase-input': { color: 'var(--text-normal)' },
    // 描边默认是 rgba(0,0,0,0.23)（MUI 默认主题按 light 算），黑底上等于没有；
    // hover 时更会变成近黑的 text.primary，所以三个状态都得显式指定
    '& .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--background-modifier-border)' },
    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--background-modifier-border-hover)' },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--interactive-accent)' },
}

// Select 的下拉菜单是 Portal 到 document.body 的，不在组件树里，得用 MenuProps 单独给
const MENU_PROPS = {
    PaperProps: { sx: { bgcolor: 'var(--background-primary)' } },
}

const MENU_ITEM_SX = {
    color: 'var(--text-normal)',
    '&:hover': { bgcolor: 'var(--background-modifier-hover)' },
}

const DIVIDER_SX = {
    my: 2,
    borderColor: 'var(--background-modifier-border)',
}

const HINT_SX = {
    color: 'var(--text-muted)',
}

const BUTTON_SX = {
    color: 'var(--text-normal)',
    '&.Mui-disabled': { color: 'var(--text-faint)' },
}

function keyOf(options: Option[], value: string): string {
    for (const o of options) {
        if (o.value == value) {
            return o.key
        }
    }
    return value
}

// $.tags 的 fact 是数组，equal 拿数组和字符串比较永远不成立，不提供
function operatorsFor(path: string): Option[] {
    if (path == "$.tags") {
        return OPERATORS.filter((o) => o.value != "equal")
    }
    return OPERATORS
}

// 换了 path 后，当前 operator 不再可用就退回默认的 regexMatch
function withPath(c: Condition, fact: string, path: string): Partial<Condition> {
    const allowed = operatorsFor(path).some((o) => o.value == c.operator)
    return { fact: fact, path: path, operator: allowed ? c.operator : "regexMatch" }
}

function newCondition(): Condition {
    return { fact: "card", path: PATHS["card"][0].value, operator: "regexMatch", value: "" }
}

function buildRule(mode: string, conditions: Condition[]): RuleProperties {
    const list = conditions.map((c) => {
        return { fact: c.fact, path: c.path, operator: c.operator, value: c.value }
    })
    let conditionsPart: TopLevelCondition
    if (mode == "any") {
        conditionsPart = { any: list }
    } else if (mode == "not") {
        conditionsPart = { not: { any: list } }
    } else {
        conditionsPart = { all: list }
    }
    return { conditions: conditionsPart, event: { type: "match" } } as RuleProperties
}

function regexError(conditions: Condition[]): string {
    for (const c of conditions) {
        if (c.operator != "regexMatch") {
            continue
        }
        try {
            new RegExp(c.value)
        } catch (error) {
            return String(error)
        }
    }
    return ""
}

interface BuilderProps {
    patterns: Pattern[]
    insertIntoNote: (text: string) => void
}

function DeckBuilder({ patterns, insertIntoNote }: BuilderProps) {
    const { t } = useTranslation()
    const [conditions, setConditions] = useState<Condition[]>([newCondition()])
    const [mode, setMode] = useState<string>("all")
    const [count, setCount] = useState<number | null>(null)

    const error = regexError(conditions)
    const json = JSON.stringify({ rule: buildRule(mode, conditions) }, null, "\t")
    const codeBlock = "```aosr-deck-config\n" + json + "\n```"

    useEffect(() => {
        let cancelled = false
        if (error) {
            setCount(null)
            return
        }
        setCount(null)
        ParseRule(buildRule(mode, conditions), patterns).then((matched) => {
            if (!cancelled) {
                setCount(matched.length)
            }
        })
        return () => {
            cancelled = true
        }
    }, [json, patterns, error])

    function update(index: number, patch: Partial<Condition>) {
        setConditions((prev) => prev.map((c, i) => (i == index ? { ...c, ...patch } : c)))
    }

    function setFact(index: number, fact: string) {
        update(index, withPath(conditions[index], fact, PATHS[fact][0].value))
    }

    function setPath(index: number, path: string) {
        update(index, withPath(conditions[index], conditions[index].fact, path))
    }

    function addCondition() {
        setConditions((prev) => [...prev, newCondition()])
    }

    function removeCondition(index: number) {
        setConditions((prev) => prev.filter((c, i) => i != index))
    }

    async function copyCodeBlock() {
        await navigator.clipboard.writeText(codeBlock)
        new Notice(t('DeckBuilderNoticeCopied') || "")
    }

    function insertCodeBlock() {
        insertIntoNote(codeBlock + "\n")
        new Notice(t('DeckBuilderNoticeInserted') || "")
    }

    return (
        <Box>
            <Typography variant="h6">{t('DeckBuilderTitle')}</Typography>
            <Typography variant="body2" sx={HINT_SX}>
                {t('DeckBuilderDesc')}
            </Typography>
            <Divider sx={DIVIDER_SX} />

            <Typography variant="body2" sx={{ ...HINT_SX, mb: 1 }}>
                {t(MODE_HINTS[mode])}
            </Typography>

            <Stack spacing={1}>
                {conditions.map((c, i) => (
                    <Stack key={i} direction="row" spacing={1} alignItems="center" useFlexGap flexWrap="wrap">
                        <Select
                            size="small"
                            sx={{ width: SELECT_WIDTH.fact, flexShrink: 0, ...FIELD_SX }}
                            value={c.fact}
                            renderValue={(v) => t(keyOf(FACTS, String(v)))}
                            onChange={(e) => setFact(i, e.target.value)}
                            MenuProps={MENU_PROPS}
                        >
                            {FACTS.map((f) => (
                                <MenuItem key={f.value} value={f.value} sx={MENU_ITEM_SX}>{t(f.key)}</MenuItem>
                            ))}
                        </Select>
                        <Select
                            size="small"
                            sx={{ width: SELECT_WIDTH.path, flexShrink: 0, ...FIELD_SX }}
                            value={c.path}
                            renderValue={(v) => t(keyOf(PATHS[c.fact], String(v)))}
                            onChange={(e) => setPath(i, e.target.value)}
                            MenuProps={MENU_PROPS}
                        >
                            {PATHS[c.fact].map((p) => (
                                <MenuItem key={p.value} value={p.value} sx={MENU_ITEM_SX}>{t(p.key)}</MenuItem>
                            ))}
                        </Select>
                        <Select
                            size="small"
                            sx={{ width: SELECT_WIDTH.operator, flexShrink: 0, ...FIELD_SX }}
                            value={c.operator}
                            renderValue={(v) => t(keyOf(OPERATORS, String(v)))}
                            onChange={(e) => update(i, { operator: e.target.value })}
                            MenuProps={MENU_PROPS}
                        >
                            {operatorsFor(c.path).map((o) => (
                                <MenuItem key={o.value} value={o.value} sx={MENU_ITEM_SX}>{t(o.key)}</MenuItem>
                            ))}
                        </Select>
                        <TextField
                            size="small"
                            placeholder={t('DeckBuilderValuePlaceholder') || ""}
                            sx={{ flex: 1, minWidth: 120, ...FIELD_SX }}
                            value={c.value}
                            onChange={(e) => update(i, { value: e.target.value })}
                        />
                        <Button
                            sx={{ ...BUTTON_SX, minWidth: 0, flexShrink: 0, px: 2 }}
                            disabled={conditions.length <= 1}
                            onClick={() => removeCondition(i)}
                        >
                            ✕
                        </Button>
                    </Stack>
                ))}
            </Stack>

            <Button sx={{ ...BUTTON_SX, mt: 1 }} onClick={addCondition}>{t('DeckBuilderAddCondition')}</Button>

            <Divider sx={DIVIDER_SX} />

            <Stack direction="row" spacing={1} alignItems="center" useFlexGap flexWrap="wrap" sx={{ mb: 1 }}>
                <Typography variant="body2" sx={HINT_SX}>{t('DeckBuilderMatch')}</Typography>
                <Select
                    size="small"
                    sx={{ width: SELECT_WIDTH.mode, flexShrink: 0, ...FIELD_SX }}
                    value={mode}
                    renderValue={(v) => t(keyOf(MODES, String(v)))}
                    onChange={(e) => setMode(e.target.value)}
                    MenuProps={MENU_PROPS}
                >
                    {MODES.map((m) => (
                        <MenuItem key={m.value} value={m.value} sx={MENU_ITEM_SX}>{t(m.key)}</MenuItem>
                    ))}
                </Select>
            </Stack>

            {error
                ? <Typography variant="body2" sx={{ color: 'var(--text-error)' }}>{t('DeckBuilderInvalidRegex', { error: error })}</Typography>
                : <Typography variant="body2">
                    {t('DeckBuilderMatches', { matched: count === null ? "..." : count, total: patterns.length })}
                </Typography>}

            <TextField
                sx={{ mt: 2, fontFamily: "monospace", ...FIELD_SX }}
                multiline
                fullWidth
                minRows={8}
                value={codeBlock}
                InputProps={{ readOnly: true }}
            />

            <Stack
                direction="row"
                spacing={1}
                sx={{
                    position: "sticky",
                    bottom: 0,
                    zIndex: 1,
                    mt: 2,
                    pt: 2,
                    pb: 1,
                    bgcolor: "var(--background-primary)",
                    borderTop: "1px solid var(--background-modifier-border)",
                }}
            >
                <Button variant="contained" onClick={copyCodeBlock}>{t('DeckBuilderCopy')}</Button>
                <Button sx={BUTTON_SX} onClick={insertCodeBlock}>{t('DeckBuilderInsert')}</Button>
            </Stack>
        </Box>
    )
}

function DeckBuilderHost({ app }: { app: App }) {
    const { t } = useTranslation()
    const [patterns, setPatterns] = useState<Pattern[] | null>(null)

    useEffect(() => {
        new AosrAPI().getAllPattern().then(setPatterns)
    }, [])

    function insertIntoNote(text: string) {
        const view = app.workspace.getActiveViewOfType(MarkdownView)
        if (!view) {
            new Notice(t('DeckBuilderNoticeNoNote') || "")
            return
        }
        view.editor.replaceSelection(text)
    }

    if (patterns === null) {
        return <Typography>{t('DeckBuilderLoading')}</Typography>
    }
    return <DeckBuilder patterns={patterns} insertIntoNote={insertIntoNote} />
}

export class DeckBuilderModal extends Modal {
    root: Root | null = null

    onOpen() {
        // .modal 自带宽度，只调里面控件的宽度会溢出，得显式撑开容器
        this.modalEl.style.width = "780px"
        this.modalEl.style.maxWidth = "92vw"
        this.root = createRoot(this.contentEl)
        this.root.render(<DeckBuilderHost app={this.app} />)
    }

    onClose() {
        this.root?.unmount()
        this.root = null
        this.contentEl.empty()
    }
}

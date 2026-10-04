import { Box, Button, Divider, MenuItem, Select, Stack, TextField, Typography } from "@mui/material"
import { RuleProperties, TopLevelCondition } from "json-rules-engine"
import { App, MarkdownView, Modal, Notice } from "obsidian"
import React, { useEffect, useState } from "react"
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
    label: string
}

// value 必须与 deck.tsx 里 convertToFact() 产出的 fact 一致，label 只是给人看的
const FACTS: Option[] = [
    { value: "card", label: "Card" },
    { value: "file", label: "File" },
]

const PATHS: Record<string, Option[]> = {
    card: [
        { value: "$.path", label: "file path" },
        { value: "$.tags", label: "card tags" },
        { value: "$.text", label: "card text" },
        { value: "$.outline", label: "headings" },
    ],
    file: [
        { value: "$.tags", label: "frontmatter tags" },
    ],
}

const OPERATORS: Option[] = [
    { value: "regexMatch", label: "matches regex" },
    { value: "contains", label: "contains" },
    { value: "equal", label: "equals" },
]

// 对应 json-rules-engine 的 all / any / not
const MODES: Option[] = [
    { value: "all", label: "all (whitelist)" },
    { value: "any", label: "any (whitelist)" },
    { value: "not", label: "none (blacklist)" },
]

const MODE_HINTS: Record<string, string> = {
    all: "Keep cards that match every condition below.",
    any: "Keep cards that match at least one condition below.",
    not: "Keep cards that match none of the conditions below.",
}

const SELECT_WIDTH = {fact: 110, path: 105, operator: 150, mode: 190}

function labelOf(options: Option[], value: string): string {
    for (const o of options) {
        if (o.value == value) {
            return o.label
        }
    }
    return value
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
        update(index, { fact: fact, path: PATHS[fact][0].value })
    }

    function addCondition() {
        setConditions((prev) => [...prev, newCondition()])
    }

    function removeCondition(index: number) {
        setConditions((prev) => prev.filter((c, i) => i != index))
    }

    async function copyCodeBlock() {
        await navigator.clipboard.writeText(codeBlock)
        new Notice("Aosr: deck rule copied")
    }

    function insertCodeBlock() {
        insertIntoNote(codeBlock + "\n")
        new Notice("Aosr: deck rule inserted")
    }

    return (
        <Box>
            <Typography variant="h6">Deck Rule Builder</Typography>
            <Typography variant="body2" color="text.secondary">
                Build an aosr-deck-config rule and see how many cards it matches.
            </Typography>
            <Divider sx={{ my: 2 }} />

            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                {MODE_HINTS[mode]}
            </Typography>

            <Stack spacing={1}>
                {conditions.map((c, i) => (
                    <Stack key={i} direction="row" spacing={1} alignItems="center" useFlexGap flexWrap="wrap">
                        <Select
                            size="small"
                            sx={{ width: SELECT_WIDTH.fact, flexShrink: 0 }}
                            value={c.fact}
                            renderValue={(v) => labelOf(FACTS, String(v))}
                            onChange={(e) => setFact(i, e.target.value)}
                        >
                            {FACTS.map((f) => (
                                <MenuItem key={f.value} value={f.value}>{f.label}</MenuItem>
                            ))}
                        </Select>
                        <Select
                            size="small"
                            sx={{ width: SELECT_WIDTH.path, flexShrink: 0 }}
                            value={c.path}
                            renderValue={(v) => labelOf(PATHS[c.fact], String(v))}
                            onChange={(e) => update(i, { path: e.target.value })}
                        >
                            {PATHS[c.fact].map((p) => (
                                <MenuItem key={p.value} value={p.value}>{p.label}</MenuItem>
                            ))}
                        </Select>
                        <Select
                            size="small"
                            sx={{ width: SELECT_WIDTH.operator, flexShrink: 0 }}
                            value={c.operator}
                            renderValue={(v) => labelOf(OPERATORS, String(v))}
                            onChange={(e) => update(i, { operator: e.target.value })}
                        >
                            {OPERATORS.map((o) => (
                                <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
                            ))}
                        </Select>
                        <TextField
                            size="small"
                            placeholder="value"
                            sx={{ flex: 1, minWidth: 120 }}
                            value={c.value}
                            onChange={(e) => update(i, { value: e.target.value })}
                        />
                        <Button
                            sx={{ minWidth: 0, flexShrink: 0, px: 2 }}
                            disabled={conditions.length <= 1}
                            onClick={() => removeCondition(i)}
                        >
                            x
                        </Button>
                    </Stack>
                ))}
            </Stack>

            <Button sx={{ mt: 1 }} onClick={addCondition}>+ condition</Button>

            <Divider sx={{ my: 2 }} />

            <Stack direction="row" spacing={1} alignItems="center" useFlexGap flexWrap="wrap" sx={{ mb: 1 }}>
                <Typography variant="body2" color="text.secondary">Match</Typography>
                <Select
                    size="small"
                    sx={{ width: SELECT_WIDTH.mode, flexShrink: 0 }}
                    value={mode}
                    renderValue={(v) => labelOf(MODES, String(v))}
                    onChange={(e) => setMode(e.target.value)}
                >
                    {MODES.map((m) => (
                        <MenuItem key={m.value} value={m.value}>{m.label}</MenuItem>
                    ))}
                </Select>
            </Stack>

            {error
                ? <Typography color="error" variant="body2">Invalid regex: {error}</Typography>
                : <Typography variant="body2">
                    Matches <b>{count === null ? "..." : count}</b> of {patterns.length} card(s)
                </Typography>}

            <TextField
                sx={{ mt: 2, fontFamily: "monospace" }}
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
                <Button variant="contained" onClick={copyCodeBlock}>Copy code block</Button>
                <Button onClick={insertCodeBlock}>Insert into note</Button>
            </Stack>
        </Box>
    )
}

function DeckBuilderHost({ app }: { app: App }) {
    const [patterns, setPatterns] = useState<Pattern[] | null>(null)

    useEffect(() => {
        new AosrAPI().getAllPattern().then(setPatterns)
    }, [])

    function insertIntoNote(text: string) {
        const view = app.workspace.getActiveViewOfType(MarkdownView)
        if (!view) {
            new Notice("Aosr: no active markdown note")
            return
        }
        view.editor.replaceSelection(text)
    }

    if (patterns === null) {
        return <Typography>Loading cards...</Typography>
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

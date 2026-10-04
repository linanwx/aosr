import { Box, Button, Divider, Stack, Typography } from "@mui/material"
import { Component, ItemView, MarkdownView } from "obsidian"
import React from "react"
import { createRoot, Root } from "react-dom/client"

import { Arrangement } from "arrangement"
import { getAppInstance } from "main"
import { MarkdownRenderComponent } from "markdown"
import { Pattern, prettyText } from "Pattern"

export const VIEW_TYPE_DECK_PREVIEW = "aosr-deck-preview"

const PAGE_SIZE = 20

// 悬停多久才出答案。鼠标扫过一排卡片时不应该挨个渲染
const HOVER_DELAY = 350

// 悬浮翻页按钮：竖排定宽，别被 MUI 的默认 padding 撑变形
const PAGE_BTN_SX = {
	minWidth: 64,
	textTransform: 'none',
	boxSizing: 'border-box',
}

// 新建视图时的一次性交接。setViewState 的 state 会被序列化进工作区文件，
// 塞不下 Arrangement 实例，所以数据只能从这儿递进去
let pendingDeck: { arrangement: Arrangement, tagName: string, title: string } | null = null

// 打开预览 tab；已经有一个就复用（和 main.ts 的 openView() 一个套路）
//
// 牌组数据必须跟着这次点击一起传进来。tagName 是全局枚举（"new"/"review"...），
// 不同卡包的 "new" 是两批完全不同的卡 —— 之前用模块级变量存「最近一次 sync 的
// Arrangement」，多开一个卡包就互相覆盖，预览永远显示最后 sync 的那个卡包。
export async function openDeckPreview(arrangement: Arrangement, tagName: string, title: string): Promise<void> {
	const app = getAppInstance()
	const existing = app.workspace.getLeavesOfType(VIEW_TYPE_DECK_PREVIEW)
	if (existing.length > 0 && existing[0].view instanceof DeckPreviewView) {
		// 已经开着就直接换数据重画。不能只靠 setViewState：tagName/title 和上次
		// 一模一样时，视图层未必会再走一次 setState，页面会停在旧卡包的数据上
		;(existing[0].view as DeckPreviewView).showDeck(arrangement, tagName, title)
		app.workspace.revealLeaf(existing[0])
		return
	}
	pendingDeck = { arrangement: arrangement, tagName: tagName, title: title }
	const leaf = app.workspace.getLeaf('tab')
	await leaf.setViewState({
		type: VIEW_TYPE_DECK_PREVIEW,
		active: true,
		state: { tagName: tagName, title: title },
	})
	app.workspace.revealLeaf(leaf)
}

// 跳到某张卡在笔记里的位置。逻辑搬自 view.tsx 的 openPatternFile
export async function openPatternAt(pattern: Pattern | undefined): Promise<void> {
	if (!pattern) {
		return
	}
	try {
		const app = getAppInstance()
		// 优先复用已经打开、且没有钉住的 markdown 标签页；都没有才开新 tab
		let leaf = app.workspace.getLeavesOfType("markdown").find((l) => l.getViewState()?.pinned != true)
		if (!leaf) {
			leaf = app.workspace.getLeaf('tab')
		}
		await leaf.openFile(pattern.card.note)
		app.workspace.revealLeaf(leaf)
		if (!(leaf.view instanceof MarkdownView)) {
			console.error("[Aosr] jump failed: leaf is not a MarkdownView")
			return
		}
		const view = leaf.view
		// 用卡片在文件里的偏移定位。找 TagID 不行 —— tag 写在 "?" 那一行，不是问题行
		let line = view.editor.offsetToPos(pattern.card.indexBuff).line
		// "#Q" 是卡片标记行，跳过它指向真正的问题行
		if (line < view.editor.lastLine() && view.editor.getLine(line).trim().startsWith("#Q")) {
			line = line + 1
		}
		if (view.getMode() == "preview") {
			// 阅读模式没有编辑器选区，只能滚动定位
			view.currentMode.applyScroll(line)
		} else {
			// 选中整行 —— 比只选几个字符显眼得多
			const from = { line: line, ch: 0 }
			const to = { line: line, ch: view.editor.getLine(line).length }
			const flash = () => {
				view.editor.setSelection(from, to)
				view.editor.scrollIntoView({ from: from, to: to }, true)
			}
			view.editor.focus()
			flash()
			// 避免某些情况仍然没有正确定位
			setTimeout(flash, 300)
		}
	} catch (error) {
		console.error("[Aosr] jump to card failed:", error)
	}
}

// 单张预览卡：默认只渲染正面，悬停一小会儿后才把答案挂进 DOM
function PreviewCard({ pattern, index, view }: { pattern: Pattern, index: number, view: Component }) {
	const [hovered, setHovered] = React.useState(false)
	const timer = React.useRef<number | null>(null)

	const cancel = () => {
		if (timer.current != null) {
			window.clearTimeout(timer.current)
			timer.current = null
		}
	}
	const onEnter = () => {
		cancel()
		timer.current = window.setTimeout(() => setHovered(true), HOVER_DELAY)
	}
	const onLeave = () => {
		cancel()
		setHovered(false)
	}
	// 翻页/切牌组时把还没触发的定时器清掉
	React.useEffect(() => {
		return cancel
	}, [])

	return (
		<Box
			onMouseEnter={onEnter}
			onMouseLeave={onLeave}
			onClick={() => openPatternAt(pattern)}
			sx={{
				// 悬停的卡片抬到同层卡片之上，答案浮层才能盖住下面的卡
				position: 'relative',
				zIndex: hovered ? 1 : 'auto',
				display: 'flex',
				alignItems: 'flex-start',
				gap: 2,
				padding: 1,
				marginBottom: 1,
				border: '1px solid var(--background-modifier-border)',
				borderRadius: 1,
				boxSizing: 'border-box',
				cursor: 'pointer',
			}}
		>
			<Typography variant="body2" sx={{ color: 'var(--text-muted)', flexShrink: 0 }}>
				{index}
			</Typography>
			<Box sx={{ flex: 1, minWidth: 0 }}>
				<MarkdownRenderComponent
					markdown={prettyText(pattern.FrontText)}
					sourcePath={pattern.card.note.path}
					component={view}
				/>
			</Box>
			{
				hovered &&
				<Box sx={{
					// 浮层：盖在下面几张卡上面，不撑开布局
					position: 'absolute',
					top: '100%',
					left: 0,
					right: 0,
					marginTop: 0.5,
					padding: 1,
					border: '1px solid var(--background-modifier-border)',
					borderRadius: 1,
					boxSizing: 'border-box',
					backgroundColor: 'var(--background-primary)',
					boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)',
				}}>
					<MarkdownRenderComponent
						markdown={prettyText(pattern.BackText)}
						sourcePath={pattern.card.note.path}
						component={view}
					/>
				</Box>
			}
		</Box>
	)
}

function DeckPreview({ arrangement, tagName, title, view }: { arrangement: Arrangement | null, tagName: string | undefined, title: string | undefined, view: Component }) {
	const [page, setPage] = React.useState(0)
	const patterns = (arrangement && tagName) ? arrangement.patternsFor(tagName) : []
	const pageCount = Math.max(1, Math.ceil(patterns.length / PAGE_SIZE))
	const current = Math.min(page, pageCount - 1)
	const slice = patterns.slice(current * PAGE_SIZE, (current + 1) * PAGE_SIZE)

	return (
		<Box sx={{ padding: 2, boxSizing: 'border-box' }}>
			<Typography variant="h6">{title}</Typography>
			<Typography variant="body2" sx={{ color: 'var(--text-muted)' }}>
				{patterns.length} card(s) · page {current + 1} / {pageCount} · tag: {String(tagName)}
			</Typography>
			<Divider sx={{ my: 2 }} />
			{
				arrangement == null &&
				<Typography variant="body2" sx={{ color: 'var(--text-error)' }}>
					No arrangement data. Open the Aosr review view first, then click a count button.
				</Typography>
			}
			{
				arrangement != null && patterns.length == 0 &&
				<Typography variant="body2" sx={{ color: 'var(--text-muted)' }}>
					No cards for tag {String(tagName)}
				</Typography>
			}
			{
				slice.map((pattern, i) => (
					<PreviewCard
						key={pattern.TagID}
						pattern={pattern}
						index={current * PAGE_SIZE + i + 1}
						view={view}
					/>
				))
			}
			{
				/* 悬浮在右侧的翻页按钮：不出现在文档流里，滚动时也一直可见 */
				<Stack
					spacing={0.5}
					sx={{
						position: 'fixed',
						right: 16,
						top: '50%',
						transform: 'translateY(-50%)',
						zIndex: 20,
						padding: 0.5,
						border: '1px solid var(--background-modifier-border)',
						borderRadius: 2,
						boxSizing: 'border-box',
						backgroundColor: 'var(--background-primary)',
						boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)',
					}}
				>
					<Button size="small" sx={PAGE_BTN_SX} disabled={current <= 0} onClick={() => setPage(current - 1)}>Prev</Button>
					<Button size="small" sx={PAGE_BTN_SX} disabled={current >= pageCount - 1} onClick={() => setPage(current + 1)}>Next</Button>
				</Stack>
			}
		</Box>
	)
}

export class DeckPreviewView extends ItemView {
	root: Root | null = null
	// 这个 tab 绑定的牌组数据。跟点击一起进来，不再从模块级变量里读
	private arrangement: Arrangement | null = null
	private tagName: string | undefined
	private title: string | undefined

	getViewType(): string {
		return VIEW_TYPE_DECK_PREVIEW
	}

	getDisplayText(): string {
		return "Aosr preview"
	}

	// 复用已开的 tab：换掉数据源重画，不依赖 Obsidian 会不会再走一次 setState
	showDeck(arrangement: Arrangement, tagName: string, title: string): void {
		this.arrangement = arrangement
		this.tagName = tagName
		this.title = title
		this.draw()
	}

	// 恢复工作区时 Obsidian 会调 setState
	async setState(state: any, result: any): Promise<void> {
		await super.setState(state, result)
		// 已经绑好牌组了就别被恢复的状态覆盖
		if (this.arrangement == null) {
			this.tagName = state?.tagName
			this.title = state?.title
		}
		if (this.root) {
			this.draw()
		}
	}

	async onOpen(): Promise<void> {
		if (pendingDeck) {
			this.arrangement = pendingDeck.arrangement
			this.tagName = pendingDeck.tagName
			this.title = pendingDeck.title
			pendingDeck = null
		} else {
			// 工作区恢复：只有 tagName/title，拿不到牌组数据
			const state = this.getState() || {}
			if (this.tagName == null) {
				this.tagName = state.tagName
			}
			if (this.title == null) {
				this.title = state.title
			}
		}
		this.draw()
	}

	private draw(): void {
		const content = this.containerEl.children[1]
		if (this.root) {
			this.root.unmount()
			this.root = null
		}
		content.empty()
		this.root = createRoot(content.createDiv())
		this.root.render(
			<DeckPreview arrangement={this.arrangement} tagName={this.tagName} title={this.title} view={this} />
		)
	}

	async onClose(): Promise<void> {
		if (this.root) {
			this.root.unmount()
			this.root = null
		}
	}
}

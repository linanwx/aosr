import SaveIcon from '@mui/icons-material/Save';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import LoadingButton from '@mui/lab/LoadingButton';
import { Box, Chip, List, ListItem, ListItemButton, ListItemText, Paper, Stack } from "@mui/material";
import Button from "@mui/material/Button";
import CircularProgress from '@mui/material/CircularProgress';
import LinearProgress from '@mui/material/LinearProgress';
import Typography from '@mui/material/Typography';
import { Pattern } from "Pattern";
import { Arrangement, PatternIter } from 'arrangement';
import { MarkdownComponent } from 'markdown';
import { EditorPosition, ItemView, MarkdownView, TFile } from 'obsidian';
import * as React from "react";
import { Root, createRoot } from "react-dom/client";
import { LearnEnum, LearnOpt, Operation, ReviewEnum, ReviewOpt } from "schedule";
import { GlobalSettings } from 'setting';

function LinearProgressWithLabel(props: { value1: number, value2: number }) {
	const value = (props.value1 / props.value2) * 100;
	return (
		<Box sx={{ display: 'flex', alignItems: 'center' }}>
			<Box sx={{ width: '100%', mr: 1 }}>
				<LinearProgress variant="determinate" value={value} />
			</Box>
			<Box sx={{ minWidth: 'min-content' }}>
				<Typography variant="body2" color="var(--text-normal)">{`${props.value1}/${props.value2}`}</Typography>
			</Box>
		</Box>
	);
}

export const VIEW_TYPE_REVIEW = "aosr-review-view"

type ReviewingProps = {
	arrangement: Arrangement
	goStage: (stage: ReviewStage) => void
	view: ItemView
	arrangeName: string
}

// 未看到答案时大脑状态标记
enum markEnum {
	NOTSURE,
	KNOWN,
	FORGET,
}

type ReviewingState = {
	nowPattern: Pattern | undefined
	showAns: boolean
	mark: markEnum
	patternIter: AsyncGenerator<PatternIter, boolean, unknown>
	index: number
	total: number
	heading: string
	fileName: string
}


type DelayButtonState = {
	leftTime: number
	loading: boolean
}

type DelayButtonProps = {
	initTime: number
	onClick: React.MouseEventHandler<HTMLButtonElement>
	color: "inherit" | "primary" | "secondary" | "success" | "error" | "info" | "warning" | undefined
	size: "small" | "medium" | "large" | undefined
	children?: React.ReactNode;
}

class DelayButton extends React.Component<DelayButtonProps, DelayButtonState> {
	timeID: NodeJS.Timer
	tick = () => {
		if (this.state.leftTime <= 0) {
			this.setState({
				loading: false,
			})
			return
		}
		this.setState({
			leftTime: this.state.leftTime - 0.1,
		})
	}
	componentDidMount(): void {
		this.timeID = setInterval(this.tick, 100)
	}
	componentWillUnmount(): void {
		clearInterval(this.timeID)
	}
	constructor(props: DelayButtonProps) {
		super(props)
		this.state = {
			leftTime: this.props.initTime,
			loading: true,
		}
	}
	render(): React.ReactNode {
		return <LoadingButton loading={this.state.loading} loadingPosition="start" startIcon={<SaveIcon />}
			color={this.props.color}
			size={this.props.size}
			sx={{
				":disabled": {
					color: "rgba(128,128,128,0.5)"
				}
			}}
			loadingIndicator={<CircularProgress size={16} variant="determinate" value={100 - this.state.leftTime / this.props.initTime * 100} />}
			onClick={this.props.onClick}>{this.props.children}</LoadingButton>
	}
}

const DURATION_CHECK = 0.3
const DURATION_FORGET = 1.25
const DURATION_HARD = 1.5
const DURATION_WRONG = 1.75

function removeMdExtension(str: string) {
	if (str.endsWith('.md')) {
		return str.slice(0, -3);
	}
	return str;
}

function replaceSlashWithArrow(str: string) {
	return str.replace(/\//g, ' > ');
}

function findOutline(file: TFile, offset: number): string {
	let cache = app.metadataCache.getFileCache(file)
	if (!cache) {
		return ""
	}
	if (!cache.headings || cache.headings.length == 0) {
		return ""
	}
	// Find the position of the heading in the array.
	let position = -1
	for (let i = 0; i < cache.headings.length; i++) {
		if (cache.headings[i].position.start.offset <= offset) {
			position = i
		} else {
			break
		}
	}
	if (position == -1) {
		return ""
	}
	let currentOutline: string[] = []
	let currentLevel = cache.headings[position].level
	// Add the current heading to the outline.
	currentOutline.push(cache.headings[position].heading)
	// Iterate backwards through the headings.
	for (let i = position - 1; i >= 0; i--) {
		let heading = cache.headings[i]

		// If the level is less than the current level, add it to the outline.
		if (heading.level < currentLevel) {
			currentOutline.unshift(heading.heading)
			currentLevel = heading.level
		}

		// If we have reached the top level, stop searching.
		if (currentLevel === 1) {
			break
		}
	}

	return currentOutline.join(" > ")
}

class Reviewing extends React.Component<ReviewingProps, ReviewingState> {
	initFlag: boolean
	lastPattern: Pattern | undefined
	constructor(props: ReviewingProps) {
		super(props)
		this.state = {
			nowPattern: undefined,
			showAns: false,
			patternIter: this.props.arrangement.PatternSequence(this.props.arrangeName),
			mark: markEnum.NOTSURE,
			index: 0,
			total: 1,
			heading: "",
			fileName: "",
		}
		this.initFlag = false
	}
	async componentDidMount() {
		if (!this.initFlag) {
			this.initFlag = true
			await this.next()
		}
	}
	next = async () => {
		this.lastPattern = this.state.nowPattern
		let result = await this.state.patternIter.next()
		if (result.done) {
			this.props.goStage(ReviewStage.Loading)
			return
		}
		let heading = findOutline(result.value.pattern.card.note, result.value.pattern.card.indexBuff)
		await result.value.pattern.InitAosrID();
		this.setState({
			nowPattern: result.value.pattern,
			index: result.value.index,
			total: result.value.total,
			heading: heading,
			fileName: replaceSlashWithArrow(removeMdExtension(result.value.pattern.card.note.path)),
		})
	}
	openPatternFile = async (pattern: Pattern | undefined) => {
		if (!pattern) {
			return
		}
		let leaf = app.workspace.getLeavesOfType("markdown").at(0)
		if (!leaf || leaf.getViewState()?.pinned == true) {
			leaf = app.workspace.getLeaf(true)
		}
		await leaf.openFile(pattern.card.note)
		let view = app.workspace.getActiveViewOfType(MarkdownView)
		if (!view) {
			return
		}
		// 优先使用Tag的位置，如果tag不存在，则使用卡片缓存的位置
		let noteText = await app.vault.read(pattern.card.note)
		let index = noteText.indexOf(pattern.TagID)
		let offset = 0
		let length = 0
		if (index >= 0) {
			offset = index
			length = pattern.TagID.length
		} else {
			offset = pattern.card.indexBuff
			length = pattern.card.cardText.length
		}
		let range1 = view.editor.offsetToPos(offset)
		let range2 = view.editor.offsetToPos(offset + length)
		let range2next: EditorPosition = {
			line: range2.line + 1,
			ch: 0,
		}
		let range3: EditorPosition
		if (index >= 0) {
			range3 = range2
		} else {
			range3 = range2next
		}
		view.currentMode.applyScroll(range1.line);
		view.editor.setSelection(range3, range1)
		await new Promise(resolve => setTimeout(resolve, 100));
		view.editor.scrollIntoView({
			from: range1,
			to: range3,
		}, true)
	}
	PatternComponent = () => {
		if (this.state.nowPattern) {
			return <this.state.nowPattern.Component view={this.props.view} showAns={this.state.showAns}></this.state.nowPattern.Component>
		}
		return <div></div>
	}
	async submit(opt: Operation) {
		await this.state.nowPattern?.SubmitOpt(opt)
		await this.next()
		this.setState({
			showAns: false
		})
	}
	getOptDate = (opt: ReviewEnum): string => {
		let date = this.state.nowPattern?.schedule.CalcNextTime(opt)
		return date?.fromNow() || ""
	}
	getOptRate = (opt: LearnEnum): string => {
		if (!this.state.nowPattern) {
			return ""
		}
		let rate = this.state.nowPattern.schedule.CalcLearnRate(opt)
		rate = rate * 100
		return `${rate.toFixed(0)}%`
	}
	getLastTime = (): string => {
		if (this.state.nowPattern?.schedule?.LearnInfo.IsNew) {
			return ""
		}
		let date = this.state.nowPattern?.schedule.LastTime
		return date?.fromNow() || ""
	}
	markAs = (mark: markEnum) => {
		this.setState({
			showAns: true,
			mark: mark,
		})
	}
	render() {
		return <Box>
			<LinearProgressWithLabel value1={this.state.index} value2={this.state.total} />
			<Stack spacing={2} direction={{ xs: 'column', sm: 'row' }} sx={{ marginTop: 2, marginBottom: 2 }}>
				<Button size="large" onClick={() => this.openPatternFile(this.state.nowPattern)}>Open File</Button>
				<Button size="large" onClick={() => this.openPatternFile(this.lastPattern)}>Open Last</Button>
				<Stack spacing={2} direction='row'>
					{
						this.getLastTime() &&
						<Chip sx={{
							color: 'var(--text-normal)',
						}} label={this.getLastTime()} />
					}
					{
						this.state.nowPattern &&
						<Chip sx={{
							color: 'var(--text-normal)',
						}} label={`ease: ${this.state.nowPattern?.schedule.Ease.toFixed(0)}`} />
					}
				</Stack>
				<Button size="medium" onClick={this.next} startIcon={<SkipNextIcon />}>Skip</Button>
			</Stack>
			<Box sx={{ marginTop: 2, marginBottom: 2 }}>
				<Typography variant="h3">
					{this.state.fileName}
				</Typography>
			</Box>
			<Box sx={{ marginTop: 2, marginBottom: 2 }}>
				<Typography variant="h6"><MarkdownComponent markdown={this.state.heading} sourcePath={''} component={this.props.view} /></Typography>
			</Box>
			<Box sx={{ minHeight: 135, marginTop: 2, marginBottom: 2 }}>
				<this.PatternComponent></this.PatternComponent>
			</Box>
			<Box sx={{ marginTop: 2, marginBottom: 2 }}>
				{
					!this.state.showAns &&
					<Stack spacing={2} direction={{ xs: 'column', sm: 'row' }}>
						<DelayButton initTime={GlobalSettings.WaitingTimeoutBase} color="error" size="large" onClick={() => this.markAs(markEnum.FORGET)}>Forget</DelayButton>
						<DelayButton initTime={GlobalSettings.WaitingTimeoutBase * DURATION_CHECK} color="info" size="large" onClick={() => this.markAs(markEnum.NOTSURE)}>Not Sure</DelayButton>
						<Button color="success" size="large" onClick={() => this.markAs(markEnum.KNOWN)}>Known</Button>
					</Stack>
				}
				{
					this.state.showAns && this.props.arrangeName != "learn" &&
					<Stack spacing={2} direction={{ xs: 'column', sm: 'row' }}>
						{
							this.state.mark == markEnum.FORGET &&
							<DelayButton initTime={GlobalSettings.WaitingTimeoutBase * DURATION_FORGET} color="error" size="large" onClick={() => this.submit(new ReviewOpt(ReviewEnum.FORGET))}>Forget {this.getOptDate(ReviewEnum.FORGET)}</DelayButton>
						}
						{
							this.state.mark == markEnum.NOTSURE &&
							<DelayButton initTime={GlobalSettings.WaitingTimeoutBase * DURATION_HARD} onClick={() => this.submit(new ReviewOpt(ReviewEnum.HARD))} color="error" size="large">Hard {this.getOptDate(ReviewEnum.HARD)}</DelayButton>

						}
						{
							this.state.mark == markEnum.NOTSURE &&
							<DelayButton initTime={GlobalSettings.WaitingTimeoutBase * DURATION_CHECK} color="info" size="large" onClick={() => this.submit(new ReviewOpt(ReviewEnum.FAIR))}>Fair {this.getOptDate(ReviewEnum.FAIR)}</DelayButton>
						}
						{
							this.state.mark == markEnum.KNOWN &&
							<DelayButton initTime={GlobalSettings.WaitingTimeoutBase * DURATION_WRONG} onClick={() => this.submit(new ReviewOpt(ReviewEnum.FORGET))} color="error" size="large">Wrong {this.getOptDate(ReviewEnum.FORGET)}</DelayButton>
						}
						{
							this.state.mark == markEnum.KNOWN &&
							<Button color="success" size="large" onClick={() => this.submit(new ReviewOpt(ReviewEnum.EASY))}>Easy {this.getOptDate(ReviewEnum.EASY)}</Button>
						}
					</Stack>
				}
				{
					this.state.showAns && this.props.arrangeName == "learn" &&
					<Stack spacing={2} direction={{ xs: 'column', sm: 'row' }}>
						{
							this.state.mark == markEnum.FORGET &&
							<DelayButton initTime={GlobalSettings.WaitingTimeoutBase * DURATION_FORGET} color="error" size="large" onClick={() => this.submit(new LearnOpt(LearnEnum.FORGET))}>Forget {this.getOptRate(LearnEnum.FORGET)}</DelayButton>
						}
						{
							this.state.mark == markEnum.NOTSURE &&
							<DelayButton initTime={GlobalSettings.WaitingTimeoutBase * DURATION_HARD} color="error" size="large" onClick={() => this.submit(new LearnOpt(LearnEnum.HARD))}>Hard {this.getOptRate(LearnEnum.HARD)}</DelayButton>
						}
						{
							this.state.mark == markEnum.NOTSURE &&
							<DelayButton initTime={GlobalSettings.WaitingTimeoutBase * DURATION_CHECK} color="info" size="large" onClick={() => this.submit(new LearnOpt(LearnEnum.FAIR))}>Fair {this.getOptRate(LearnEnum.FAIR)}</DelayButton>

						}
						{
							this.state.mark == markEnum.KNOWN &&
							<DelayButton initTime={GlobalSettings.WaitingTimeoutBase * DURATION_WRONG} color="error" size="large" onClick={() => this.submit(new LearnOpt(LearnEnum.FORGET))}>Wrong {this.getOptRate(LearnEnum.FORGET)}</DelayButton>
						}
						{
							this.state.mark == markEnum.KNOWN &&
							<Button color="info" size="large" onClick={() => this.submit(new LearnOpt(LearnEnum.EASY))}>Easy {this.getOptRate(LearnEnum.EASY)}</Button>

						}
					</Stack>
				}
			</Box>
		</Box>
	}
}


class LoadingComponent extends React.Component<any, any> {
	render() {
		return <p>Loading...</p>
	}
}

type MaindeskProps = {
	arrangement: Arrangement
	goStage: (stage: ReviewStage) => void
	setArrangement: (arrangeName: string) => void
}

type MaindeskState = {

}

class MaindeskComponent extends React.Component<MaindeskProps, MaindeskState> {
	constructor(props: any) {
		super(props)
	}
	render(): React.ReactNode {
		return <Box>
			<Paper sx={{
				color: 'var(--text-normal)',
				bgcolor: 'var(--background-primary)',
			}}>
				{this.props.arrangement.ArrangementList().length != 0 &&
					<List>
						{
							this.props.arrangement.ArrangementList().map((value) => (
								<ListItem disablePadding key={value.Name}>
									<ListItemButton onClick={() => {
										this.props.setArrangement(value.Name);
										this.props.goStage(ReviewStage.Reviewing);
									}}>
										<ListItemText primary={`${value.Name} : ${value.Count}`} />
									</ListItemButton>
								</ListItem>
							))
						}
					</List>
				}
				{
					this.props.arrangement.ArrangementList().length == 0 &&
					<p>All Done.</p>
				}
			</Paper>
		</Box>
	}
}

type ReviewProps = {
	view: ItemView
}

enum ReviewStage {
	Loading,
	Maindesk,
	Reviewing,
}

type ReviewState = {
	stage: ReviewStage
	arrangement: Arrangement
	arrangeName: string
}

class ReviewComponent extends React.Component<ReviewProps, ReviewState> {
	private syncFlag: boolean;
	async sync() {
		if (this.syncFlag) {
			return
		}
		this.syncFlag = true
		let arrangement = this.state.arrangement
		await arrangement.init()
		this.setState({
			arrangement: arrangement
		})
		this.setState({
			stage: ReviewStage.Maindesk
		})
		this.syncFlag = false
	}
	componentDidMount() {
		this.sync()
	}
	constructor(props: ReviewProps) {
		super(props)
		this.syncFlag = false
		this.state = {
			stage: ReviewStage.Loading,
			arrangement: new Arrangement(),
			arrangeName: "",
		}
	}
	goStage = (stage: ReviewStage) => {
		this.setState({
			stage: stage
		})
		if (stage == ReviewStage.Loading) {
			this.sync()
		}
	}
	setArrangement = (arrangeName: string) => {
		this.setState({
			arrangeName: arrangeName
		})
	}
	render(): React.ReactNode {
		if (this.state.stage == ReviewStage.Loading) {
			return <LoadingComponent></LoadingComponent>
		}
		if (this.state.stage == ReviewStage.Maindesk) {
			return <MaindeskComponent
				setArrangement={this.setArrangement}
				goStage={this.goStage}
				arrangement={this.state.arrangement}
			></MaindeskComponent>
		}
		if (this.state.stage == ReviewStage.Reviewing) {
			return <Reviewing
				arrangeName={this.state.arrangeName}
				arrangement={this.state.arrangement}
				goStage={this.goStage}
				view={this.props.view}
			></Reviewing>
		}
	}
}


type props = {
	view: ItemView
}

function App(props: props) {
	let halfPageHeight = window.innerHeight / 2
	return (
		<div className="markdown-preview-view markdown-rendered is-readable-line-width allow-fold-headings">
			<div className="markdown-preview-sizer markdown-preview-section" style={{ paddingBottom: `${halfPageHeight}px` }}>
				<ReviewComponent view={props.view} ></ReviewComponent>
			</div>
		</div>
	);
}

// 卡片复习视图
export class ReviewView extends ItemView {
	root: Root
	getViewType(): string {
		return VIEW_TYPE_REVIEW
	}
	getDisplayText(): string {
		return "Aosr"
	}
	async onload() {
		let rootDiv = this.containerEl.children[1].createDiv()
		this.root = createRoot(rootDiv);
		this.root.render(
			<App view={this}></App>
		)
	}
	onunload(): void {
		this.root.unmount()
	}
}

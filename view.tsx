import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import HourglassBottomIcon from '@mui/icons-material/HourglassBottom';
import RefreshIcon from '@mui/icons-material/Refresh';
import SaveIcon from '@mui/icons-material/Save';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import LoadingButton from '@mui/lab/LoadingButton';
import { Box, Chip, Hidden, List, ListItem, ListItemButton, ListItemText, Paper, Stack } from "@mui/material";
import Button from "@mui/material/Button";
import CircularProgress from '@mui/material/CircularProgress';
import LinearProgress from '@mui/material/LinearProgress';
import Typography from '@mui/material/Typography';
import { Pattern } from "Pattern";
import { Arrangement, PatternIter } from 'arrangement';
import i18n from 'i18next';
import { RuleProperties } from 'json-rules-engine';
import { MarkdownRenderComponent } from 'markdown';
import { Component, EditorPosition, ItemView, MarkdownRenderChild, MarkdownView, TFile } from 'obsidian';
import * as React from "react";
import { Root, createRoot } from "react-dom/client";
import { I18nextProvider, Trans } from 'react-i18next';
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
	view: Component
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
	timer: NodeJS.Timeout | null = null;
	openUnpinnedFile = async (note: TFile) => {
		if (this.props.view instanceof MarkdownRenderChild) {
			let leaf = app.workspace.getLeaf(true)
			leaf.openFile(note)
			return leaf
		}
		let leaf = app.workspace.getLeavesOfType("markdown").at(0)
		if (!leaf || leaf.getViewState()?.pinned == true) {
			leaf = app.workspace.getLeaf(true)
		}
		await leaf.openFile(note)
		return leaf
	}
	openPatternFile = async (pattern: Pattern | undefined) => {
		if (!pattern) {
			return
		}
		// 打开文件
		let leaf = await this.openUnpinnedFile(pattern.card.note)
		if (!(leaf.view instanceof MarkdownView)) {
			return
		}
		let view = leaf.view
		// 读取文件找到tag
		let noteText = view.data
		let index = noteText.indexOf(pattern.TagID)
		let length = pattern.TagID.length
		// 处理Tag不存在的情况
		if (index < 0) {
			index = pattern.card.indexBuff
			length = 0
		}
		// 换算位置
		let tagpos = view.editor.offsetToPos(index)
		let tagposEnd: EditorPosition = {
			line: tagpos.line,
			ch: tagpos.ch + length
		}
		// 滚动
		if (view.getMode() == "preview") {
			view.currentMode.applyScroll(tagpos.line)
		} else {
			view.editor.setSelection(tagpos, tagposEnd)
			view.editor.scrollIntoView({ from: tagpos, to: tagposEnd }, true)
			view.editor.setSelection(tagpos, tagposEnd)
			view.editor.scrollIntoView({ from: tagpos, to: tagposEnd }, true)

			// 避免某些情况仍然没有正确定位
			setTimeout(function () {
				view.editor.setSelection(tagpos, tagposEnd)
				view.editor.scrollIntoView({ from: tagpos, to: tagposEnd }, true)
			}, 800)
		}
	}
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
	checkHeading = () => {
		if (!this.state.nowPattern) {
			return
		}
		let heading = findOutline(this.state.nowPattern.card.note, this.state.nowPattern.card.indexBuff)
		this.setState({
			heading: heading,
		})
	}
	componentWillUnmount() {
		if (this.timer) {
			clearTimeout(this.timer); // 清理定时器
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
		if (heading == "") {
			// 通过cache可能查不到缓存, 等一会再查
			this.timer = setTimeout(this.checkHeading, 500);
		}
		await result.value.pattern.InitAosrID();
		this.setState({
			nowPattern: result.value.pattern,
			index: result.value.index,
			total: result.value.total,
			heading: heading,
			fileName: replaceSlashWithArrow(removeMdExtension(result.value.pattern.card.note.path)),
			showAns: false,
		})
		result.value.pattern.Pronounce()
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
			<Stack flexWrap="wrap" useFlexGap direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ marginTop: 2, marginBottom: 2 }}>
				<Stack direction={'row'} spacing={2} >
					<Button onClick={() => { this.props.goStage(ReviewStage.Loading) }}> <ArrowBackIcon /> </Button>
					<Hidden smUp>
						<Button onClick={this.next} startIcon={<SkipNextIcon />}><Trans i18nKey="ButtonTextSkip" /></Button>
					</Hidden>
				</Stack>
				<Stack direction={'row'} spacing={2} >
					<Button onClick={() => this.openPatternFile(this.state.nowPattern)}><Trans i18nKey="ButtonTextOpenFile" /></Button>
					<Button onClick={() => this.openPatternFile(this.lastPattern)}><Trans i18nKey="ButtonTextOpenLast" /></Button>
				</Stack>
				<Stack direction={'row'} spacing={2} >
					{
						this.getLastTime() &&
						<Chip sx={{ color: 'var(--text-normal)', }} label={this.getLastTime()} />
					}
					{
						this.state.nowPattern &&
						<Chip sx={{ color: 'var(--text-normal)', }} label={
							<>
								<Trans i18nKey="ClipTextEase" />{" "}
								{this.state.nowPattern?.schedule.Ease.toFixed(0)}
							</>
						} />
					}
				</Stack>
				<Hidden smDown><Button onClick={this.next} startIcon={<SkipNextIcon />}><Trans i18nKey="ButtonTextSkip" /></Button></Hidden>
			</Stack>
			{
				!GlobalSettings.HideContext && <>
					<Box sx={{ marginTop: 2, marginBottom: 2 }}>
						<Typography variant="h3">
							{this.state.fileName}
						</Typography>
					</Box>
					<Box sx={{ marginTop: 2, marginBottom: 2 }}>
						<Typography variant="h6"><MarkdownRenderComponent markdown={this.state.heading} sourcePath={''} component={this.props.view} /></Typography>
					</Box>
				</>
			}
			<Box sx={{ minHeight: 135, marginTop: 2, marginBottom: 2 }}>
				<this.PatternComponent></this.PatternComponent>
			</Box>
			<Box sx={{ marginTop: 2, marginBottom: 2 }}>
				{
					!this.state.showAns &&
					<Stack spacing={2} direction={{ xs: 'column', sm: 'row' }}>
						<DelayButton initTime={GlobalSettings.WaitingTimeoutBase} color="error" size="large" onClick={() => this.markAs(markEnum.FORGET)}><Trans i18nKey="ButtonTextForget" /></DelayButton>
						<DelayButton initTime={GlobalSettings.WaitingTimeoutBase * DURATION_CHECK} color="info" size="large" onClick={() => this.markAs(markEnum.NOTSURE)}><Trans i18nKey="ButtonNotSure" /></DelayButton>
						<Button color="success" size="large" onClick={() => this.markAs(markEnum.KNOWN)}><Trans i18nKey="ButtonTextKnown" /></Button>
					</Stack>
				}
				{
					this.state.showAns && this.props.arrangeName != "learn" &&
					<Stack spacing={2} direction={{ xs: 'column', sm: 'row' }}>
						{
							this.state.mark == markEnum.FORGET &&
							<DelayButton initTime={GlobalSettings.WaitingTimeoutBase * DURATION_FORGET} color="error" size="large" onClick={() => this.submit(new ReviewOpt(ReviewEnum.FORGET))}><Trans i18nKey="ButtonTextForget2" /> {this.getOptDate(ReviewEnum.FORGET)}</DelayButton>
						}
						{
							this.state.mark == markEnum.NOTSURE &&
							<DelayButton initTime={GlobalSettings.WaitingTimeoutBase * DURATION_HARD} onClick={() => this.submit(new ReviewOpt(ReviewEnum.HARD))} color="error" size="large"><Trans i18nKey="ButtonTextHard" /> {this.getOptDate(ReviewEnum.HARD)}</DelayButton>

						}
						{
							this.state.mark == markEnum.NOTSURE &&
							<DelayButton initTime={GlobalSettings.WaitingTimeoutBase * DURATION_CHECK} color="info" size="large" onClick={() => this.submit(new ReviewOpt(ReviewEnum.FAIR))}><Trans i18nKey="ButtonTextFair" /> {this.getOptDate(ReviewEnum.FAIR)}</DelayButton>
						}
						{
							this.state.mark == markEnum.KNOWN &&
							<DelayButton initTime={GlobalSettings.WaitingTimeoutBase * DURATION_WRONG} onClick={() => this.submit(new ReviewOpt(ReviewEnum.FORGET))} color="error" size="large"><Trans i18nKey="ButtonTextWrong" /> {this.getOptDate(ReviewEnum.FORGET)}</DelayButton>
						}
						{
							this.state.mark == markEnum.KNOWN &&
							<Button color="success" size="large" onClick={() => this.submit(new ReviewOpt(ReviewEnum.EASY))}><Trans i18nKey="ButtonTextEasy" /> {this.getOptDate(ReviewEnum.EASY)}</Button>
						}
					</Stack>
				}
				{
					this.state.showAns && this.props.arrangeName === "learn" &&
					<Stack spacing={2} direction={{ xs: 'column', sm: 'row' }}>
						{
							this.state.mark === markEnum.FORGET &&
							<DelayButton initTime={GlobalSettings.WaitingTimeoutBase * DURATION_FORGET} color="error" size="large" onClick={() => this.submit(new LearnOpt(LearnEnum.FORGET))}><Trans i18nKey="ButtonTextForget2" /> {this.getOptRate(LearnEnum.FORGET)}</DelayButton>
						}
						{
							this.state.mark === markEnum.NOTSURE &&
							<DelayButton initTime={GlobalSettings.WaitingTimeoutBase * DURATION_HARD} color="error" size="large" onClick={() => this.submit(new LearnOpt(LearnEnum.HARD))}><Trans i18nKey="ButtonTextHard" /> {this.getOptRate(LearnEnum.HARD)}</DelayButton>
						}
						{
							this.state.mark === markEnum.NOTSURE &&
							<DelayButton initTime={GlobalSettings.WaitingTimeoutBase * DURATION_CHECK} color="info" size="large" onClick={() => this.submit(new LearnOpt(LearnEnum.FAIR))}><Trans i18nKey="ButtonTextFair" /> {this.getOptRate(LearnEnum.FAIR)}</DelayButton>
						}
						{
							this.state.mark === markEnum.KNOWN &&
							<DelayButton initTime={GlobalSettings.WaitingTimeoutBase * DURATION_WRONG} color="error" size="large" onClick={() => this.submit(new LearnOpt(LearnEnum.FORGET))}><Trans i18nKey="ButtonTextWrong" /> {this.getOptRate(LearnEnum.FORGET)}</DelayButton>
						}
						{
							this.state.mark === markEnum.KNOWN &&
							<Button color="info" size="large" onClick={() => this.submit(new LearnOpt(LearnEnum.EASY))}><Trans i18nKey="ButtonTextEasy" /> {this.getOptRate(LearnEnum.EASY)}</Button>
						}
					</Stack>
				}
			</Box>
		</Box>
	}
}


class LoadingComponent extends React.Component<any, any> {
	render() {
		return <HourglassBottomIcon />
	}
}

type MaindeskProps = {
	arrangement: Arrangement
	goStage: (stage: ReviewStage) => void
	setArrangement: (arrangeName: string) => void
}

type MaindeskState = {

}

interface ReviewPaperProps {
	arrangement: Arrangement;
	setArrangement: (name: string) => void;
	goStage: (stage: ReviewStage) => void;
}

interface ReviewPaperStates {

}

class ReviewPaperComponent extends React.Component<ReviewPaperProps, ReviewPaperStates> {
	constructor(props: ReviewPaperProps) {
		super(props)
	}
	render(): React.ReactNode {
		let emptyReview = this.props.arrangement.isOnlyAllTag()
		return (
			<Paper sx={{
				color: 'var(--text-normal)',
				bgcolor: 'var(--background-primary)',
				margin: 2,
			}}>
				{this.props.arrangement.ArrangementList().length !== 0 && <>
					<Typography variant="h6" sx={{ padding: 2 }}>
						<Trans i18nKey="StartReview" />
					</Typography>
					<List>
						{
							this.props.arrangement.ArrangementList().map((value) => (
								<ListItem disablePadding key={value.Name}>
									<ListItemButton onClick={() => {
										this.props.setArrangement(value.Name);
										this.props.goStage(ReviewStage.Reviewing);
									}}>
										<ListItemText primary={`${value.Display} : ${value.Count}`} />
									</ListItemButton>
								</ListItem>
							))
						}
					</List>
				</>
				}
				{
					emptyReview &&
					<Box sx={{ margin: 2 }}>
						<Trans i18nKey="StartTextEmpty" />
					</Box>
				}
			</Paper>
		);
	}
}

// interface DeckSettingProps {

// }

// interface DeckSettingStates {
// 	deckName: string
// 	pathRegex: string
// 	unfold: boolean
// 	matchType: DeckMatchType
// }

// class CustomPaperComponent extends React.Component<DeckSettingProps, DeckSettingStates> {
// 	constructor(props: DeckSettingProps | Readonly<DeckSettingProps>) {
// 		super(props);
// 		this.state = {
// 			deckName: '',
// 			pathRegex: '',
// 			matchType: DeckMatchType.PATHREGEX,
// 			unfold: false,
// 		};
// 	}

// 	handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
// 		if (event.target.name == "deckName") {
// 			this.setState({
// 				deckName: event.target.value
// 			})
// 		}
// 		if (event.target.name == "pathRegex") {
// 			this.setState({
// 				pathRegex: event.target.value
// 			})
// 		}
// 		if (event.target.name == "matchType") {
// 			let type: DeckMatchType = DeckMatchType[event.target.value as keyof typeof DeckMatchType];
// 			this.setState({
// 				matchType: type
// 			})
// 		}
// 	}

// 	submit = (event: FormEvent) => {
// 		event.preventDefault();
// 	}

// 	render() {
// 		if (!this.state.unfold) {
// 			return <Button onClick={() => {
// 				this.setState({
// 					unfold: true
// 				})
// 			}} ><AddIcon /></Button>
// 		}
// 		return (
// 			<Paper sx={{ color: 'var(--text-normal)', bgcolor: 'var(--background-primary)', margin: 2 }}>
// 				<form onSubmit={this.submit}>
// 					<Box p={2} sx={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
// 						<Typography><Trans i18nKey="DeckName" />:</Typography>
// 						<TextField required name="deckName" value={this.state.deckName} onChange={this.handleInputChange} />

// 						<Typography><Trans i18nKey="MatchType" />:</Typography>
// 						<Select
// 							required
// 							defaultValue={DeckMatchType.PATHREGEX}
// 							name="matchType"
// 							value={this.state.matchType}
// 							onChange={this.handleInputChange}>
// 							<MenuItem value={DeckMatchType.PATHREGEX}><Trans i18nKey="PathRegex" /></MenuItem>
// 						</Select>
// 						<TextField required name="pathRegex" value={this.state.pathRegex} onChange={this.handleInputChange} />

// 					</Box>

// 					<Box p={2} sx={{ gap: '10px', margin: 2, display: 'flex', flexDirection: 'row' }}>
// 						<Button onClick={() => {
// 							this.setState({
// 								unfold: false
// 							})
// 						}}><Trans i18nKey="Cancel" /></Button>
// 						<Button type='submit'><Trans i18nKey="OK" /></Button>
// 					</Box>
// 				</form>
// 			</Paper>
// 		);
// 	}
// }

class MaindeskComponent extends React.Component<MaindeskProps, MaindeskState> {
	constructor(props: any) {
		super(props)
	}
	render(): React.ReactNode {
		let showStats: boolean = false
		let stats = this.props.arrangement.stats()
		if (stats.NewCount > 0 || stats.LearnCount > 0 || stats.ReviewCount > 0) {
			showStats = true
		}
		return <Box>
			<Stack spacing={2}>
				<Button onClick={() => {
					this.props.goStage(ReviewStage.Loading)
				}} ><RefreshIcon /></Button>
				<ReviewPaperComponent
					arrangement={this.props.arrangement}
					setArrangement={this.props.setArrangement}
					goStage={this.props.goStage}
				/>
				{
					showStats &&
					<Paper sx={{
						color: 'var(--text-normal)',
						bgcolor: 'var(--background-primary)',
						margin: 2,
					}}>
						<Typography variant="h6" sx={{ padding: 2 }}>
							<Trans i18nKey="TodayStats" />
						</Typography>
						<List>
							<ListItem>
								<ListItemText primary={<><Trans i18nKey="StartTextNew" /> : {stats.NewCount}</>}></ListItemText>
							</ListItem>
							<ListItem>
								<ListItemText primary={<><Trans i18nKey="StartTextReview" /> : {stats.ReviewCount}</>}> </ListItemText>
							</ListItem>
							<ListItem>
								<ListItemText primary={<><Trans i18nKey="StartTextLearn" /> : {stats.LearnCount}</>}> </ListItemText>
							</ListItem>
						</List>
					</Paper>
				}
			</Stack>
		</Box>
	}
}

type ReviewProps = {
	view: Component
	rule: RuleProperties | null
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
		await arrangement.init(this.props.rule)
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
	view: Component
	rule: RuleProperties | null
}

export function App(props: props) {
	let halfPageHeight = window.innerHeight / 2
	return (
		<div className="markdown-preview-view markdown-rendered is-readable-line-width allow-fold-headings">
			<div className="markdown-preview-sizer markdown-preview-section" style={{ paddingBottom: `${halfPageHeight}px` }}>
				<I18nextProvider i18n={i18n}>
					<ReviewComponent view={props.view} rule={props.rule} ></ReviewComponent>
				</I18nextProvider>
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
			<App view={this} rule={null}></App>
		)
	}
	onunload(): void {
		this.root.unmount()
	}
}

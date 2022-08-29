import { List, ListItem, ListItemButton, ListItemText } from "@mui/material";
import Button from "@mui/material/Button";
import { Arrangement } from 'arrangement';
import { ItemView } from 'obsidian';
import { Pattern } from "Pattern";
import * as React from "react";
import { createRoot, Root } from "react-dom/client";
import { Operation } from "schedule";

export const VIEW_TYPE_REVIEW = "review-view"

// 状态机 表示视图的状态
interface ReviewViewer {
	render(): void
}

type ReviewingProps = {
	arrangement: Arrangement
	goStage: (stage: ReviewStage) => void
	view: ItemView
	arrangeName: string
}

type ReviewingState = {
	nowPattern: Pattern | undefined
	showAns: boolean
	patternIter: AsyncGenerator<Pattern, boolean, unknown>
}

class Reviewing extends React.Component<ReviewingProps, ReviewingState> { 
	initFlag:boolean
	constructor(props: ReviewingProps) {
		super(props)
		this.state = {
			nowPattern: undefined,
			showAns: false,
			patternIter: this.props.arrangement.PatternSequence(this.props.arrangeName),
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
		console.log("next 被调用")
		let result = await this.state.patternIter.next()
		if (result.done) {
			console.log("结束")
			this.props.goStage(ReviewStage.Loading)
			return
		}
		this.setState({
			nowPattern: result.value
		})
	}
	clickShowAns = () => {
		this.setState({
			showAns: true
		})
	}
	PatternComponent = () => {
		if (this.state.nowPattern) {
			return <this.state.nowPattern.Component view={this.props.view} clickShowAns={this.clickShowAns}></this.state.nowPattern.Component>
		}
		return <div></div>
	}
	async submit(opt: Operation) {
		await this.state.nowPattern?.submitOpt(opt)
		await this.next()
		this.setState({
			showAns: false
		})
	}
	render() {
		return <div>
			<this.PatternComponent></this.PatternComponent>
			{
				this.state.showAns && this.props.arrangeName != "learn" &&
				<div>
					<Button color="error" size="large"  onClick={() => this.submit(Operation.HARD)}>Hard</Button>
					<Button color="info" size="large"  onClick={() => this.submit(Operation.FAIR)}>Fair</Button>
					<Button color="success" size="large"  onClick={() => this.submit(Operation.EASE)}>Easy</Button>
				</div>
			}
			{
				this.state.showAns && this.props.arrangeName == "learn" &&
				<div>
					<Button color="error" size="large"  onClick={() => this.submit(Operation.NOTLEARN)}>Hard</Button>
					<Button color="info" size="large"  onClick={() => this.submit(Operation.LEARN)}>Fair</Button>
				</div>
			}
		</div>
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
		return <div>
			{this.props.arrangement.ArrangementList().length != 0 &&
				<List>
					{
						this.props.arrangement.ArrangementList().map((value) => (
							<ListItem key={value.Name}>
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
		</div>
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
	private syncFlag:boolean;
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

export const ViewContext = React.createContext<ReviewView>(undefined as any);

// 卡片复习视图
export class ReviewView extends ItemView {
	root: Root
	getViewType(): string {
		return VIEW_TYPE_REVIEW
	}
	getDisplayText(): string {
		return "AOSR"
	}
	async onload() {
		let rootDiv = this.containerEl.children[1].createDiv()
		this.root = createRoot(rootDiv);
		this.root.render(
			<React.StrictMode>
				<div className="markdown-preview-view markdown-rendered">
					<div className="markdown-preview-sizer markdown-preview-section">
						<ReviewComponent view={this} ></ReviewComponent>
					</div>
				</div>
			</React.StrictMode>
		)
	}
	onunload(): void {
		this.root.unmount()
	}
}

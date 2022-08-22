import { TFile, App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting, MarkdownPostProcessorContext, MarkdownRenderer, MarkdownRenderChild, MarkdownEditView, ItemView, WorkspaceLeaf, Vault, MarkdownPreviewView, Component, MarkdownPreviewRenderer } from 'obsidian';
import { CardsWatcher, NewCardsWatch } from "./cardWatcher"
import { NewCardSearch, SearchResult } from "./cardSearch"
import * as React from "react";
import * as ReactDOM from "react-dom";
import { createRoot, Root } from "react-dom/client";
import { DatePicker } from 'antd';
import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup"
import FormControl from "@mui/material/FormControl"
import InputLabel from "@mui/material/InputLabel"
import ListItemButton from "@mui/material/ListItemButton"
import Select from "@mui/material/Select"
import MenuItem from "@mui/material/MenuItem"
import ButtonUnstyled, {
	buttonUnstyledClasses
} from "@mui/base/ButtonUnstyled";
import { renderMarkdown } from 'markdown';
import { SingleLineMethod } from 'singleLineStyle';
import { Operation } from 'schedule';
import moment from 'moment';
import { Arrangement, NewArrangement } from 'arrangement';
import { Card } from 'card';
import { Pattern } from "Pattern";



export const VIEW_TYPE_REVIEW = "review-view"

// class ReviewBase {
// 	controller: ReviewController
// 	constructor(controller: ReviewController) {
// 		this.controller = controller
// 	}
// 	get root(): Root {
// 		return this.controller.root
// 	}
// }

// 状态机 表示视图的状态
interface ReviewViewer {
	render(): void
}

type ReviewingState = {
	nowPattern: Pattern | undefined
}

type ReviewingProps = {
	allCards: Card[]
	goStage: (stage: ReviewStage) => void
	view: ItemView
}

// function Welcome(props) {
// 	return <h1>Hello, {props.name}</h1>;
//   }

class Reviewing extends React.Component<ReviewingProps, ReviewingState> {
	private arrangement: Arrangement
	private patternIter: Generator<Pattern, boolean, unknown>
	constructor(props: ReviewingProps) {
		super(props)
		this.state = {
			nowPattern: undefined
		}
	}
	componentDidMount() {
		this.arrangement = NewArrangement(this.props.allCards)
		this.patternIter = this.arrangement.PatternSequence()
		this.next()
	}
	next = () => {
		let result = this.patternIter.next()
		console.log(result)
		if (result.done) {
			this.props.goStage(ReviewStage.Loading)
			return
		}
		this.setState({
			nowPattern: result.value
		})
	}
	PatternComponent = () => {
		if (this.state.nowPattern) {
			return <this.state.nowPattern.Component view={this.props.view}></this.state.nowPattern.Component>
		}
		return <div></div>
	}
	render() {
		return <div>
			{
				<this.PatternComponent></this.PatternComponent>
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
	allCards: SearchResult
	goStage: (stage: ReviewStage) => void
}

type MaindeskState = {

}

class MaindeskComponent extends React.Component<MaindeskProps, MaindeskState> {
	render(): React.ReactNode {
		return <div>
			<ul>
				<li><Button onClick={
					() =>
						this.props.goStage(ReviewStage.Reviewing)
				} >{`${this.props.allCards.SearchName} : ${this.props.allCards.AllCard.length}`}</Button></li>
			</ul>
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
	searchResult: SearchResult
}

class ReviewComponent extends React.Component<ReviewProps, ReviewState> {
	changeStage(stage: ReviewStage) {
		this.setState({
			stage: stage
		})
	}
	async sync() {
		await new Promise((e) => setTimeout(e, 200))
		let search = NewCardSearch()
		let allcards = await search.search()
		console.log(this)
		this.setState({
			searchResult: allcards
		})
		this.setState({
			stage: ReviewStage.Maindesk
		})
	}
	componentDidMount() {
		this.sync()
	}
	constructor(props: ReviewProps) {
		super(props)
		this.state = {
			stage: ReviewStage.Loading,
			searchResult: new SearchResult()
		}
	}
	goStage = (stage: ReviewStage) => {
		this.setState({
			stage: stage
		})
	}

	render(): React.ReactNode {
		if (this.state.stage == ReviewStage.Loading) {
			return <LoadingComponent></LoadingComponent>
		}
		if (this.state.stage == ReviewStage.Maindesk) {
			return <MaindeskComponent
				goStage={this.goStage}
				allCards={this.state.searchResult}
			></MaindeskComponent>
		}
		if (this.state.stage == ReviewStage.Reviewing) {
			return <Reviewing
				allCards={this.state.searchResult.AllCard}
				goStage={this.goStage}
				view={this.props.view}></Reviewing>
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
		this.root.render(<React.StrictMode>

			<ReviewComponent view={this}></ReviewComponent>
		</React.StrictMode>)
	}
	onunload(): void {
		this.root.unmount()
	}
}

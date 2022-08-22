import { PatternMethod, Card } from "card";
import { Pattern, PatternBase, PatternProps } from "Pattern";
import { randomUUID } from "crypto";
import { ItemView } from "obsidian";
import React from "react";
import { Operation } from "schedule";
import { TagParser } from "tag";
import { renderMarkdown } from "./markdown"
import { ViewContext } from "./review"
import { NodeContainer } from "./Container"
import { Button } from "@mui/material";

class singleLinePattern extends PatternBase implements Pattern {
	keyText: string
	front: string
	back: string
	originalID: string
	constructor(card: Card) {
		super(card)
	}

	// 界面按钮点击
	async submitOpt(opt: Operation): Promise<void> {
		// 更新安排
		this.card.getSchedule(this.ID).apply(opt)
		// 提交更改
		this.method.update(this)
		// 应用更改
		await this.card.commit()
	}
	Component = (props:PatternProps):JSX.Element =>  {
		console.log("thisis")
		console.log(this)
		return <SingleLinePatternComponent pattern={this} view={props.view}></SingleLinePatternComponent>
	}
}



type singleLinePatternComponentProps = {
	pattern: singleLinePattern
	view:ItemView
}

type singleLinePatternComponentState = {
	showAns: boolean
	markdownDivFront: HTMLDivElement
	markdownDivBack: HTMLDivElement
	
}

// type singleLinePatternComponentPr

export const useView = (): ItemView | undefined => {
	return React.useContext(ViewContext);
};

class SingleLinePatternComponent extends React.Component<singleLinePatternComponentProps, singleLinePatternComponentState> {
	async componentDidMount() {
		let markdownDivFront = createDiv()
		let markdownDivBack = createDiv()
		console.log(this.props)
		await renderMarkdown(this.props.pattern.front, markdownDivFront, this.props.pattern.card.note.path, this.props.view)
		await renderMarkdown(this.props.pattern.back, markdownDivBack, this.props.pattern.card.note.path, this.props.view)
		this.setState({
			markdownDivFront: markdownDivFront,
			markdownDivBack: markdownDivBack,
		})
	}
	constructor(props: singleLinePatternComponentProps) {
		super(props)
		this.state = {
			showAns: false,
			markdownDivFront: createDiv(),
			markdownDivBack: createDiv(),
		}
	}
	showAns = () => {
		this.setState({
			showAns: true
		})
	}
	render() {
		return <div>
			<NodeContainer node={this.state.markdownDivFront}></NodeContainer>
			<br></br>
			{
				this.state.showAns &&
				<NodeContainer node={this.state.markdownDivBack}></NodeContainer>
			}
			<br></br>
			{
				this.state.showAns == false &&
				<Button onClick={this.showAns}>答案</Button>
			}
		</div>

	}
}


export class SingleLineMethod implements PatternMethod {
	async update(parseInfo: Pattern): Promise<void> {
		if (parseInfo instanceof singleLinePattern) {
			if (parseInfo.originalID) {
				return
			}
			parseInfo.card.update({
				updateFunc: function (fileText: string): string {
					let newContent = parseInfo.front + "::" + parseInfo.back + " " + parseInfo.ID;
					return fileText.replace(parseInfo.keyText, newContent);
				}
			})
		}
	}
	render(parseInfo: Pattern): React.Component {
		throw new Error('Method not implemented.');
	}
	parse(card: Card): Pattern[] {
		let reg = /^(.+)::(.+?)$/gm
		let results: Pattern[] = []
		while (1) {
			let regArr = reg.exec(card.source)
			if (regArr == null) {
				break
			}
			if (regArr.length >= 3) {
				let result = new singleLinePattern(card)
				result.keyText = regArr[0]
				result.front = regArr[1]
				result.back = regArr[2]
				let tagInfo = TagParser.parse(result.keyText)
				result.ID = tagInfo.findTag(card.ID)?.Original || ""
				result.originalID = result.ID
				result.method = this
				results.push(result)
			}
		}
		return results
	}
	constructor() {

	}
}
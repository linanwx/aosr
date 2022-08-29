import { Button } from "@mui/material";
import { Card } from "card";
import { cyrb53 } from "hash";
import { PatternParser } from "ParserCollection";
import { Pattern, PatternProps } from "Pattern";
import React from "react";
import { Operation } from "schedule";
import { TagParser } from "tag";
import { renderMarkdown } from "./markdown";
import { NodeContainer } from "./nodeContainer";

abstract class linePattern extends Pattern {
	keyText: string
	front: string
	back: string
	originalID: string
	constructor(card: Card, keyText:string, front:string, back:string, originalID:string, tagid:string) {
		super(card, tagid)
		this.front = front
		this.keyText = keyText
		this.back = back
		this.originalID = originalID
	}
	abstract insertPatternID(): void
	// 界面按钮点击
	async submitOpt(opt: Operation): Promise<void> {
		// 计算调度情况
		this.card.getSchedule(this.TagID).apply(opt)
		// 原文中不一定包含pattern的ID 可能需要更新
		this.insertPatternID()
		// 通知卡片一切就绪 准备更新原文
		await this.card.commitFile()
	}
	// 展示组件
	Component = (props: PatternProps): JSX.Element => {
		return <LinePatternComponent pattern={this} patternProps={props}></LinePatternComponent>
	}
}

class singleLinePattern extends linePattern {
	insertPatternID() {
		if (this.originalID) {
			return
		}
		this.card.updateFile({
			updateFunc: (fileText): string => {
				let newContent = this.front + "::" + this.back + " " + this.TagID;
				return fileText.replace(this.keyText, newContent);
			}
		})
	}
}

class multiLinePattern extends linePattern {
	insertPatternID(): void {
		if (this.originalID) {
			return
		}
		this.card.updateFile({
			updateFunc: (fileText): string => {
				let newContent = `${this.front}\n? ${this.TagID}\n${this.back}`
				return fileText.replace(this.keyText, newContent)
			}
		})
	}
}

type singleLinePatternComponentProps = {
	pattern: singleLinePattern
	patternProps: PatternProps
}

type singleLinePatternComponentState = {
	showAns: boolean
	markdownDivFront: HTMLDivElement
	markdownDivBack: HTMLDivElement
}

class LinePatternComponent extends React.Component<singleLinePatternComponentProps, singleLinePatternComponentState> {
	async componentDidMount() {
		let markdownDivFront = this.state.markdownDivFront
		markdownDivFront.empty()
		let markdownDivBack = this.state.markdownDivBack
		markdownDivBack.empty()
		await renderMarkdown(this.props.pattern.front, markdownDivFront, this.props.pattern.card.note.path, this.props.patternProps.view)
		await renderMarkdown(this.props.pattern.back, markdownDivBack, this.props.pattern.card.note.path, this.props.patternProps.view)
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
		this.props.patternProps.clickShowAns()
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


export class SingleLineParser implements PatternParser {
	Parse(card: Card): Pattern[] {
		let reg = /^(.+)::(.+?)$/gm
		let results: Pattern[] = []
		for (let i = 0; i < 10000; i++) {
			let regArr = reg.exec(card.source)
			if (regArr == null) {
				break
			}
			
			let newID = "#" + card.ID + "\/s\/" + cyrb53(regArr[0], 4)
			let tagInfo = TagParser.parse(regArr[0])
			let originalID = tagInfo.findTag(card.ID, "s")?.Original || ""
			let result = new singleLinePattern(card, regArr[0], regArr[1], regArr[2], originalID, originalID || newID)
			results.push(result)
		}
		return results
	}
}

export class MultiLineParser implements PatternParser {
	Parse(card: Card): Pattern[] {
		let reg = /^([\s\S]+)\n\?( #.+)?\n([\s\S]+)$/gm
		let results: Pattern[] = []
		for (let i = 0; i < 1; i++) {
			let regArr = reg.exec(card.source)
			if (regArr == null) {
				break
			}
			let newID = "#" + card.ID + "\/m\/" + cyrb53(regArr[0], 4)
			let tagInfo = TagParser.parse(regArr[2] || "")
			let originalID = tagInfo.findTag(card.ID)?.Original || ""
			let result = new multiLinePattern(card, regArr[0], regArr[1], regArr[3], originalID, originalID || newID)
			results.push(result)
		}
		return results
	}
}
import { Card } from "card";
import { CardIDTag } from "cardHead";
import { cyrb53 } from "hash";
import { PatternParser } from "ParserCollection";
import { Pattern, PatternProps, prettyText } from "Pattern";
import React from "react";
import { Operation } from "schedule";
import { GlobalSettings } from "setting";
import { TagParser } from "tag";
import { renderMarkdown } from "./markdown";
import { NodeContainer } from "./nodeContainer";
import MUICard from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import { Box } from '@mui/system';


abstract class linePattern extends Pattern {
	keyText: string
	front: string
	back: string
	originalID: string
	reverse: boolean
	constructor(card: Card, keyText: string, front: string, back: string, originalID: string, tagid: string, reverse:boolean) {
		super(card, tagid)
		this.front = front
		this.keyText = keyText
		this.back = back
		this.originalID = originalID
		this.reverse = reverse
	}
	abstract insertPatternID(): void
	// 界面按钮点击
	async SubmitOpt(opt: Operation): Promise<void> {
		// 计算调度情况
		this.card.getSchedule(this.TagID).apply(opt)
		// 原文中不一定包含pattern的ID 可能需要更新
		this.insertPatternID()
		// 通知卡片一切就绪 准备更新原文
		await this.card.commitFile({ID:true, annotation:true})
	}
	// 展示组件
	Component = (props: PatternProps): JSX.Element => {
		return <LinePatternComponent reverse={this.reverse} front={this.front} back={this.back} path={this.card.note.path} patternProps={props}></LinePatternComponent>
	}
}

class singleLinePattern extends linePattern {
	insertPatternID() {
		if (this.originalID) {
			return
		}
		this.card.updateFile({
			updateFunc: (content): string => {
				let newContent = this.keyText + " " + this.TagID;
				return content.replace(this.keyText, newContent);
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
			updateFunc: (content): string => {
				let newContent = `${this.front}? ${this.TagID}\n${this.back}`
				return content.replace(this.keyText, newContent)
			}
		})
	}
}

type singleLinePatternComponentProps = {
	front: string
	back: string
	path: string
	patternProps: PatternProps
	reverse: boolean
}

type singleLinePatternComponentState = {
	markdownDivFront: HTMLDivElement
	markdownDivBack: HTMLDivElement
}

class LinePatternComponent extends React.Component<singleLinePatternComponentProps, singleLinePatternComponentState> {
	playTTS = async(text:string) => {
		if (GlobalSettings.WordTTSURL.length > 0) {
			let url = GlobalSettings.WordTTSURL.replace('%s',text)
			const audio = new Audio(url)
			await audio.play()
		}
	}
	async componentDidMount() {
		let markdownDivFront = this.state.markdownDivFront
		markdownDivFront.empty()
		let markdownDivBack = this.state.markdownDivBack
		markdownDivBack.empty()
		if (this.props.reverse == false) {
			await renderMarkdown(prettyText(this.props.front), markdownDivFront, this.props.path, this.props.patternProps.view)
			await renderMarkdown(prettyText(this.props.back), markdownDivBack, this.props.path, this.props.patternProps.view)
		} else {
			await renderMarkdown(prettyText(this.props.back), markdownDivFront, this.props.path, this.props.patternProps.view)
			await renderMarkdown(prettyText(this.props.front), markdownDivBack, this.props.path, this.props.patternProps.view)
		}
		this.setState({
			markdownDivFront: markdownDivFront,
			markdownDivBack: markdownDivBack,
		})
		// 如果是单词 则尝试调用有道发音
		let ttstext = ""
		if (this.props.reverse==false) {
			ttstext = this.props.front
		} else {
			ttstext = this.props.back
		}
		if (/^[a-zA-Z\s-]+$/.test(ttstext)) {
			setTimeout(() => {
				this.playTTS(ttstext)
			}, 100);
		}
	}
	constructor(props: singleLinePatternComponentProps) {
		super(props)
		this.state = {
			markdownDivFront: createDiv(),
			markdownDivBack: createDiv(),
		}
	}
	render() {
		const showAnswerClass = this.props.patternProps.showAns ? 'aosr-show' : '';
	
		return <div>
			<NodeContainer node={this.state.markdownDivFront}></NodeContainer>
			<br></br>
			<div className={`aosr-answer ${showAnswerClass}`}>
				<NodeContainer node={this.state.markdownDivBack}></NodeContainer>
			</div>
			<br></br>
		</div>
	}
}


export class SingleLineParser implements PatternParser {
	Parse(card: Card): Pattern[] {
		let reg = /^(.+?)(::+)(.+?)$/gm
		let results: Pattern[] = []
		for (let body of card.bodyList) {
			for (let i = 0; i < 10000; i++) {
				let regArr = reg.exec(body)
				if (regArr == null) {
					break
				}
				if (regArr[2].length == 2) {
					let newID = `#${CardIDTag}/${card.ID}/s/${cyrb53(regArr[0], 4)}`
					let tagInfo = TagParser.parse(regArr[0])
					let originalID = tagInfo.findTag(CardIDTag, card.ID, "s")?.Original || ""
					let result = new singleLinePattern(card, regArr[0], regArr[1], regArr[3], originalID, originalID || newID, false)
					results.push(result)
				}
				if (regArr[2].length == 3) {
					let newIDForward = `#${CardIDTag}/${card.ID}/sf/${cyrb53(regArr[0], 4)}`
					let newIDReverse = `#${CardIDTag}/${card.ID}/sr/${cyrb53(regArr[0], 4)}`
					let tagInfo = TagParser.parse(regArr[0])
					let originalIDForward = tagInfo.findTag(CardIDTag, card.ID, "sf")?.Original || ""
					let originalIDReverse = tagInfo.findTag(CardIDTag, card.ID, "sr")?.Original || ""
					let result1 = new singleLinePattern(card, regArr[0], regArr[1], regArr[3], originalIDForward, originalIDForward || newIDForward, false)
					let result2 = new singleLinePattern(card, regArr[0], regArr[1], regArr[3], originalIDReverse, originalIDReverse || newIDReverse, true)
					results.push(result1, result2)
				}
			}
		}
		return results
	}
}

export class MultiLineParser implements PatternParser {
	Parse(card: Card): Pattern[] {
		let reg = /^((?:(?!\? ?).+\n)+)\?( #.+)?\n((?:.+\n?)+)$/gm
		// 捕获不包含? 开头的连续行 然后捕获标签 然后捕获剩余行
		let results: Pattern[] = []
		for (let body of card.bodyList) {
			let regArr = reg.exec(body)
			if (regArr == null) {
				continue
			}
			let newID = `#${CardIDTag}/${card.ID}/m/${cyrb53(regArr[0], 4)}`
			let tagInfo = TagParser.parse(regArr[2] || "")
			let originalID = tagInfo.findTag(CardIDTag, card.ID, "m")?.Original || ""
			let result = new multiLinePattern(card, regArr[0], regArr[1], regArr[3], originalID, originalID || newID, false)
			results.push(result)
		}
		return results
	}
}
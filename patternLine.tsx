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
import { cardParserRegFlags, escapeRegExp } from "Pattern";
import { log } from "main";


abstract class linePattern extends Pattern {
	keyText: string
	front: string
	back: string
	originalID: string
	reverse: boolean
	constructor(card: Card, keyText: string, front: string, back: string, originalID: string, tagid: string, reverse: boolean) {
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
		await this.card.commitFile({ ID: true, annotation: true })
	}
	// 展示组件
	Component = (props: PatternProps): JSX.Element => {
		return <LinePatternComponent reverse={this.reverse} front={this.front} back={this.back} path={this.card.note.path} patternProps={props}></LinePatternComponent>
	}
	Pronounce(): void {
		// 如果是单词 则尝试调用有道发音
		let ttstext = ""
		if (this.reverse == false) {
			ttstext = this.front
		} else {
			ttstext = this.back
		}
		if (/^[a-zA-Z\s-]+$/.test(ttstext)) {
			setTimeout(() => {
				this.playTTS(ttstext)
			}, 100);
		}
	}
	playTTS = async (text: string) => {
		if (GlobalSettings.WordTTSURL.length > 0) {
			let url = GlobalSettings.WordTTSURL.replace('%s', text)
			const audio = new Audio(url)
			await audio.play()
		}
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
				return content.replace(this.keyText, () => { return newContent });
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
				let newContent = `${this.front}${GlobalSettings.MultiLineDelimeter} ${this.TagID}\n${this.back}`
				return content.replace(this.keyText, () => { return newContent })
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
		const processingTimesLimit = 10000;
		const dSepEscaped = escapeRegExp(GlobalSettings.OneLineDelimeter);
		const rSepEscaped = escapeRegExp(GlobalSettings.OneLineReversedDelimeter);
		let regDirect = new RegExp(
			`^(.+?)(${dSepEscaped})(.+?)$`,
			cardParserRegFlags);
		let regReversed = new RegExp(
			`^(.+?)(${rSepEscaped})(.+?)$`,
			cardParserRegFlags);
		let results: Pattern[] = []
		for (let body of card.bodyList) {
			let i;
			for (i = 0; i < processingTimesLimit; i++) { // Process direct patterns
				let regArr = regDirect.exec(body);
				if (regArr == null) {
					break; // stop processing due to matcher resets iterator to 0
				}
				let [fullText, frontText, sepText, backText] = regArr;
				if (sepText.length === GlobalSettings.OneLineDelimeter.length) {
					let newID = `#${CardIDTag}/${card.ID}/s/${cyrb53(fullText, 4)}`
					let tagInfo = TagParser.parse(fullText)
					let originalID = tagInfo.findTag(CardIDTag, card.ID, "s")?.Original || ""
					let result = new singleLinePattern(card, fullText, frontText, backText, originalID, originalID || newID, false)
					results.push(result)
				}

			}
			for (i = 0; i < processingTimesLimit; i++) { // Process two-side patterns
				let regArr = regReversed.exec(body);
				if (regArr == null) {
					break; // stop processing due to matcher resets iterator to 0
				}
				let [fullText, frontText, sepText, backText] = regArr;
				if (sepText.length === GlobalSettings.OneLineReversedDelimeter.length) {
					let newIDForward = `#${CardIDTag}/${card.ID}/sf/${cyrb53(fullText, 4)}`
					let newIDReverse = `#${CardIDTag}/${card.ID}/sr/${cyrb53(fullText, 4)}`
					let tagInfo = TagParser.parse(fullText)
					let originalIDForward = tagInfo.findTag(CardIDTag, card.ID, "sf")?.Original || ""
					let originalIDReverse = tagInfo.findTag(CardIDTag, card.ID, "sr")?.Original || ""
					let result1 = new singleLinePattern(card, fullText, frontText, backText, originalIDForward, originalIDForward || newIDForward, false)
					let result2 = new singleLinePattern(card, fullText, frontText, backText, originalIDReverse, originalIDReverse || newIDReverse, true)
					results.push(result1, result2)
				}
			}
		}
		return results
	}
}

export class MultiLineParser implements PatternParser {
	Parse(card: Card): Pattern[] {
		let sepEscaped = escapeRegExp(GlobalSettings.MultiLineDelimeter);
		let reg = new RegExp(
			`^((?:(?!(?:${sepEscaped}) ?).*\n)+)(?:${sepEscaped}) *( #.+)?\n((?:.*\n?)+)$`,
			cardParserRegFlags);
		// 捕获不包含? 开头的连续行 然后捕获标签 然后捕获剩余行
		let results: Pattern[] = []
		for (let body of card.bodyList) {
			let regArr = reg.exec(body)
			while (regArr !== null) {
				let fullText = regArr[0];
				let frontText = regArr[1]
				let sepText = regArr[2]
				let backText = regArr[3]
				let newID = `#${CardIDTag}/${card.ID}/m/${cyrb53(fullText, 4)}`
				let tagInfo = TagParser.parse(sepText || "")
				let originalID = tagInfo.findTag(CardIDTag, card.ID, "m")?.Original || ""
				let result = new multiLinePattern(card, fullText, frontText, backText, originalID, originalID || newID, false)
				results.push(result)
				regArr = reg.exec(body)
			}
		}
		return results
	}
}

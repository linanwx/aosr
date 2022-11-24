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

abstract class linePattern extends Pattern {
	keyText: string
	front: string
	back: string
	originalID: string
	constructor(card: Card, keyText: string, front: string, back: string, originalID: string, tagid: string) {
		super(card, tagid)
		this.front = front
		this.keyText = keyText
		this.back = back
		this.originalID = originalID
	}
	abstract insertPatternID(): void
	// 界面按钮点击
	async SubmitOpt(opt: Operation): Promise<void> {
		// 计算调度情况
		this.card.getSchedule(this.TagID).apply(opt)
		// 原文中不一定包含pattern的ID 可能需要更新
		this.insertPatternID()
		// 通知卡片一切就绪 准备更新原文
		await this.card.commitFile()
	}
	// 展示组件
	Component = (props: PatternProps): JSX.Element => {
		return <LinePatternComponent front={this.front} back={this.back} path={this.card.note.path} patternProps={props}></LinePatternComponent>
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
				let newContent = `${this.front}? ${this.TagID}\n${this.back}`
				return fileText.replace(this.keyText, newContent)
			}
		})
	}
}

type singleLinePatternComponentProps = {
	front: string
	back: string
	path: string
	patternProps: PatternProps
}

type singleLinePatternComponentState = {
	markdownDivFront: HTMLDivElement
	markdownDivBack: HTMLDivElement
}

class LinePatternComponent extends React.Component<singleLinePatternComponentProps, singleLinePatternComponentState> {
	playTTS = async() => {
		if (GlobalSettings.WordTTSURL.length > 0) {
			let url = GlobalSettings.WordTTSURL.replace('%s',this.props.front)
			const audio = new Audio(url)
			audio.play()
		}
	}
	async componentDidMount() {
		let markdownDivFront = this.state.markdownDivFront
		markdownDivFront.empty()
		let markdownDivBack = this.state.markdownDivBack
		markdownDivBack.empty()
		await renderMarkdown(this.props.front, markdownDivFront, this.props.path, this.props.patternProps.view)
		await renderMarkdown(prettyText(this.props.back), markdownDivBack, this.props.path, this.props.patternProps.view)
		this.setState({
			markdownDivFront: markdownDivFront,
			markdownDivBack: markdownDivBack,
		})
		// 如果是单词 则尝试调用有道发音
		if (/^[\w-]+$/.test(this.props.front)) {
			this.playTTS()
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
		return <div>
			<NodeContainer node={this.state.markdownDivFront}></NodeContainer>
			<br></br>
			{
				this.props.patternProps.showAns &&
				<NodeContainer node={this.state.markdownDivBack}></NodeContainer>
			}
			<br></br>
		</div>
	}
}


export class SingleLineParser implements PatternParser {
	Parse(card: Card): Pattern[] {
		let reg = /^(.+)::(.+?)$/gm
		let results: Pattern[] = []
		for (let body of card.bodyList) {
			for (let i = 0; i < 10000; i++) {
				let regArr = reg.exec(body)
				if (regArr == null) {
					break
				}
				let newID = `#${CardIDTag}/${card.ID}/s/${cyrb53(regArr[0], 4)}`
				let tagInfo = TagParser.parse(regArr[0])
				let originalID = tagInfo.findTag(CardIDTag, card.ID, "s")?.Original || ""
				let result = new singleLinePattern(card, regArr[0], regArr[1], regArr[2], originalID, originalID || newID)
				results.push(result)
			}
		}
		return results
	}
}

export class MultiLineParser implements PatternParser {
	Parse(card: Card): Pattern[] {
		// 注意不需要gm
		let reg = /^((?:(?!\? ?).+\n)+)\?( #.+)?\n((?:.+\n?)+)$/
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
			let result = new multiLinePattern(card, regArr[0], regArr[1], regArr[3], originalID, originalID || newID)
			results.push(result)
		}
		return results
	}
}
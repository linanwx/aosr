import { AnnotationObject, AnnotationWrapper } from 'annotationParse';
import { UpdateCardIDTag } from 'cardHead';
import { TFile } from 'obsidian';
import { CardSchedule, PatternSchedule } from 'schedule';
import { cyrb53 } from './hash';
import { ParserCollection } from './ParserCollection';
import { Pattern } from './Pattern';

// 卡片
// 卡片由源码和注释两部分组成，
// 源码是卡片的正文，书写的内容
// 注释是卡片的附属信息，存储额外的信息
// 卡片负责存储和解析md文件中卡片的内容
// 包括如何定义卡片的元信息以及附属信息
export interface Card {
	// 获取卡片所属文件
	get note(): TFile
	// 获取卡片ID
	get ID(): string
	// 获取卡片原始字符串长度
	get cardText(): string
	// 获取源码
	get bodyList(): string[]
	// 获取卡片模式
	get patterns(): Pattern[]
	// 获取卡片偏移量
	get indexBuff(): number
	// 获取调度
	getSchedule(patternID: string): PatternSchedule
	// 更新文件
	updateFile(info: updateInfo): void
	// 提交文件变更
	commitFile(): Promise<void>
}

export function NewCard(cardText: string, content: string, annotation: string, cardID: string, index: number, note: TFile): Card {
	return new defaultCard(cardText, content, annotation, cardID, index, note)
}

// 更新原文
class updateInfo {
	updateFunc: (fileText: string) => string
}

// 默认卡片的实现
class defaultCard implements Card {
	annotationWrapperStr: string = ""
	bodyList: string[]
	note: TFile
	originalID: string = ""
	patterns: Pattern[];
	schedules: CardSchedule
	indexBuff: number
	annotationObj: AnnotationObject
	updateList: updateInfo[];
	cardText: string
	static bodySplitReg = /((?:^(?!\*{3,}$).+$\n?)+)/gm
	// 1为source 2为注释
	constructor(cardText: string, content: string, annotationWrapperStr: string, cardID: string, index: number, note: TFile) {
		this.updateList = []
		this.indexBuff = index
		this.cardText = cardText || ""
		this.bodyList = []
		let matchResults = content.matchAll(defaultCard.bodySplitReg)
		for (let result of matchResults) {
			this.bodyList.push(result[0])
		}
		this.annotationWrapperStr = annotationWrapperStr || ""
		this.note = note
		this.originalID = cardID || ""
		let annotationStr = AnnotationWrapper.deWrapper(annotationWrapperStr)
		this.initAnnotation(annotationStr);

		let parser = ParserCollection.getInstance()
		this.patterns = parser.Parse(this)
	}
	private initAnnotation(annotationStr: string) {
		this.annotationObj = AnnotationObject.Parse(annotationStr);
		this.schedules = this.annotationObj.cardSchedule
	}
	updateFile(info: updateInfo) {
		this.updateList.push(info)
	}
	getSchedule(patternID: string): PatternSchedule {
		return this.schedules.getSchedule(patternID)
	}
	// ID 优先使用原始ID 不存在时为卡片hash结果
	get ID(): string {
		if (this.originalID?.length > 0) {
			return this.originalID
		}
		return cyrb53(this.cardText, 5);
	}
	// 更新注释块内容
	private updateAnnotation(fileText: string): string {
		let newAnnotation = AnnotationObject.Stringify(this.annotationObj)
		newAnnotation = AnnotationWrapper.enWrapper(this.ID, newAnnotation)
		if (this.annotationWrapperStr?.length > 0) {
			fileText = fileText.replace(this.annotationWrapperStr, newAnnotation)
		} else {
			if (fileText.at(-1) != "\n") {
				fileText += "\n" + "\n"
			} else if (fileText.at(-2) != "\n") {
				fileText += "\n"
			}
			fileText = fileText + newAnnotation
		}
		return fileText
	}
	async commitFile() {
		// 首先读取原文
		let fileText = await app.vault.read(this.note)
		if (!fileText.contains(this.cardText)) {
			// 如果原文已被改变，可能是复习打开的过程中，用户更改了原文
			// 原文如果被更改，则不能再对原文进行更新，并且只有在原来有注释的情况下，更新注释
			console.info("File has been changed, ignore commit original card.")
			// 只更新复习进度
			if (this.annotationWrapperStr?.length > 0) {
				fileText = this.updateAnnotation(fileText)
			}
		} else {
			// 如果不存在复习块ID 则先更新复习块块ID
			if (this.originalID == "") {
				let index = fileText.indexOf(this.cardText)
				if (index >= 0) {
					fileText = UpdateCardIDTag(this.ID, fileText, index)
				}
			}
			// 更新复习块注释 包括复习进度
			fileText = this.updateAnnotation(fileText)
			// 更新复习块
			for (let updateInfo of this.updateList) {
				fileText = updateInfo.updateFunc(fileText)
			}
			this.updateList = []
		}
		// 更新注释段内容
		await app.vault.modify(this.note, fileText)
	}
}



import { AnnotationObject, AnnotationWrapper } from 'annotationParse';
import { UpdateCardIDTag } from 'cardHead';
import { CachedMetadata, TFile } from 'obsidian';
import { CardSchedule, PatternSchedule } from 'schedule';
import { ParserCollection } from './ParserCollection';
import { Pattern } from './Pattern';
import { cyrb53 } from './hash';
import { DatabaseHelper } from 'db';
import { getAppInstance } from 'main';

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
	// 获取卡片原始字符串
	get cardText(): string
	// 获取源码
	get bodyList(): string[]
	// 获取卡片模式
	get patterns(): Pattern[]
	// 获取卡片偏移量
	get indexBuff(): number
	get tags(): string[]
	get fileCache(): CachedMetadata | null
	// 获取调度
	getSchedule(patternID: string): PatternSchedule
	getSchedules(): CardSchedule
	// 更新文件
	updateFile(info: updateInfo): void
	// 提交文件变更
	commitFile(commitType: commitType): Promise<void>
}

interface commitType {
	annotation?: boolean
	ID?: boolean
}

export function NewCard(cardText: string, content: string, annotation: string, cardID: string, index: number, note: TFile, cache: CachedMetadata | null): Card {
	return new defaultCard(cardText, content, annotation, cardID, index, note, cache)
}

// 更新原文
class updateInfo {
	updateFunc: (content: string) => string
}

function extractStrings(inputText: string): string[] {
	const regex = /#[\/\w]+/gm;
	return inputText.match(regex) || [];
}

export function findOutline(cache: CachedMetadata | null, offset: number): string {
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
	content: string
	tags: string[];
	static bodySplitReg = /\n(?:\*{3,}\s*|\n\s*\n)\n/
	idGenFlag: boolean = false
	fileCache: CachedMetadata | null
	outline: string
	// 1为source 2为注释
	constructor(cardText: string, content: string, annotationWrapperStr: string, cardID: string, index: number, note: TFile, cache: CachedMetadata | null) {
		let tags = extractStrings(cardText)
		this.tags = tags
		this.fileCache = cache
		this.updateList = []
		this.indexBuff = index
		this.cardText = cardText || ""
		this.bodyList = []
		this.content = content
		this.bodyList = content.split(defaultCard.bodySplitReg)
		this.note = note
		this.schedules = new CardSchedule()
		this.originalID = cardID || ""
		this.annotationWrapperStr = annotationWrapperStr || ""
		let annotationStr = AnnotationWrapper.deWrapper(annotationWrapperStr)
		this.initAnnotation(annotationStr);

		let parser = ParserCollection.getInstance()
		this.patterns = parser.Parse(this)
	}
	getSchedules(): CardSchedule {
		return this.schedules
	}
	private initAnnotation(annotationStr: string) {
		// 尝试使用DatabaseHelper查找对应的文档，如果能找到，优先使用该文档
		let db = DatabaseHelper.getInstance()
		let findFlag = false
		let doc = db.query(this.ID)
		if (doc) {
			this.schedules.setData(doc.CardSchedules)
			findFlag = true
		}

		// 如果找不到，使annotationStr
		if (findFlag === false) {
			this.annotationObj = AnnotationObject.Parse(annotationStr);
			this.schedules = this.annotationObj.cardSchedule
		}
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
	private updateAnnotationOld(fileText: string): string {
		let newAnnotation = AnnotationObject.Stringify(this.annotationObj)
		newAnnotation = AnnotationWrapper.enWrapper(this.ID, newAnnotation, "AOSRDATA")
		if (this.annotationWrapperStr?.length > 0) {
			fileText = fileText.replace(this.annotationWrapperStr, () => { return newAnnotation })
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
	// 更新注释块内容
	private updateAnnotation() {
		// 使用新的数据库方式写入数据
		let db = DatabaseHelper.getInstance()
		db.insertOrUpdate(this.ID, this.schedules)
		db.commit()
	}
	async commitFile(committype: commitType) {
		// 首先读取原文
		let fileText = await getAppInstance().vault.read(this.note)
		if (committype.ID == true && this.idGenFlag == false) {
			// 如果卡片内容被更改, 则阻止添加ID, 因为这会破坏卡片格式
			if (fileText.contains(this.cardText)) {
				// 如果不存在复习块ID 则先更新复习块块ID
				if (this.originalID == "") {
					let index = fileText.indexOf(this.cardText)
					if (index >= 0) {
						fileText = UpdateCardIDTag(this.ID, fileText, index)
					}
				}
				// 更新复习块 包括插入复习标记标签
				let newContent = this.content
				for (let updateInfo of this.updateList) {
					newContent = updateInfo.updateFunc(newContent)
				}
				fileText = fileText.replace(this.content, () => { return newContent })
				this.updateList = []
				this.idGenFlag = true // 确保只添加一次
			}
		}
		// 更新注释段内容
		if (committype.annotation == true) {
			// fileText = this.updateAnnotation(fileText)
			this.updateAnnotation()
		}
		// 提交变更
		await getAppInstance().vault.modify(this.note, fileText)
	}
}



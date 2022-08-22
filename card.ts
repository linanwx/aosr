import { AnnotationFormat, AnnotationWrapper, AnnotationParseFormat, AnnotationStringifyFormat } from 'annotationParse';
import { UpdateCardIDTag } from 'cardHead';
// import { randomUUID } from 'crypto';
import { TFile, App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting, MarkdownPostProcessorContext, MarkdownRenderer, MarkdownRenderChild, MarkdownEditView, ItemView, WorkspaceLeaf, Vault } from 'obsidian';
import React from 'react';
import { CardSchedule, PatternSchedule } from 'schedule';
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
	// 获取源码
	get source(): string
	// 获取卡片模式
	get patterns(): Pattern[]
	// 获取调度
	getSchedule(patternID: string): PatternSchedule
	// 更新注释
	update(info: updateInfo): void
	// 更新结果
	commit(): Promise<void>
}

export function NewCard(content: string, annotation: string, cardID: string, index: number, note: TFile): Card {
	return new defaultCard(content, annotation, cardID, index, note)
}

// 更新原文
class updateInfo {
	updateFunc: (fileText: string) => string
}

// 默认卡片的实现
class defaultCard implements Card {
	annotationWrapperStr: string = ""
	source: string = ""
	note: TFile
	originalID: string = ""
	patterns: Pattern[];
	schedules: CardSchedule
	index: number
	annotationFmt: AnnotationFormat
	updateList: updateInfo[];
	// 1为source 2为注释
	constructor(content: string, annotationWrapperStr: string, cardID: string, index: number, note: TFile) {
		this.updateList = []
		this.index = index
		this.source = content || ""
		this.annotationWrapperStr = annotationWrapperStr || ""
		this.note = note
		this.originalID = cardID || ""
		let annotationStr = AnnotationWrapper.deWrapper(annotationWrapperStr)
		this.initAnnotation(annotationStr);

		let parser = ParserCollection.getInstance()
		this.patterns = parser.parse(this)
		this.assignBlankMark()
	}
	private initAnnotation(annotationStr: string) {
		this.annotationFmt = AnnotationParseFormat(annotationStr);
		this.schedules = this.annotationFmt.cardSchedule
	}
	update(info: updateInfo) {
		this.updateList.push(info)
	}
	getSchedule(patternID: string): PatternSchedule {
		return this.schedules.getSchedule(patternID)
	}
	private assignBlankMark() {
		this.patterns.forEach((result, index) => {
			if (result.ID?.length > 0) {
				return
			}
			result.ID = "#" + this.ID + "\/q" + (index + 1)
		})
	}
	get ID(): string {
		if (this.originalID?.length > 0) {
			return this.originalID
		}
		return "q" + cyrb53(this.source).slice(0, 5);
	}

	private updateAnnotation(fileText: string): string {
		let newAnnotation = AnnotationStringifyFormat(this.annotationFmt)
		newAnnotation = AnnotationWrapper.enWrapper(this.ID, newAnnotation)
		if (this.annotationWrapperStr?.length > 0) {
			fileText = fileText.replace(this.annotationWrapperStr, newAnnotation)
		} else {
			if (fileText.at(-1) != "\n") {
				fileText += "\n"
			}
			fileText = fileText + "\n" + newAnnotation
		}
		return fileText
	}
	async commit() {
		// 首先读取原文
		let fileText = await app.vault.read(this.note)
		// 更新复习块
		for (let updateInfo of this.updateList) {
			fileText = updateInfo.updateFunc(fileText)
		}
		this.updateList = []
		// 更新复习块块ID
		if (this.originalID == "") {
			fileText = UpdateCardIDTag(this.ID, fileText, this.index)
		}
		// 更新复习块注释
		fileText = this.updateAnnotation(fileText)
		// 更新注释段内容
		await app.vault.modify(this.note, fileText)
	}
}


/**
 * Returns the cyrb53 hash (hex string) of the input string
 * Please see https://stackoverflow.com/a/52171480 for more details
 *
 * @param str - The string to be hashed
 * @param seed - The seed for the cyrb53 function
 * @returns The cyrb53 hash (hex string) of `str` seeded using `seed`
 */
type Hex = number;
export function cyrb53(str: string, seed = 0): string {
	let h1: Hex = 0xdeadbeef ^ seed,
		h2: Hex = 0x41c6ce57 ^ seed;
	for (let i = 0, ch; i < str.length; i++) {
		ch = str.charCodeAt(i);
		h1 = Math.imul(h1 ^ ch, 2654435761);
		h2 = Math.imul(h2 ^ ch, 1597334677);
	}
	h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
	h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
	return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(16);
}

// 解析器集合
export class ParserCollection implements PatternParser {
	private parsers: PatternParser[]
	private static instance: ParserCollection;
	private constructor() {
		this.parsers = []
	}
	public parse(card: Card): Pattern[] {
		if (this.parsers.length == 0) {
			throw new Error('No parsers implemented.');
		}
		let tmpResults: Pattern[] = []
		for (let parser of this.parsers) {
			let results = parser.parse(card)
			tmpResults.push(...results)
		}
		return tmpResults
	}
	public static getInstance(): ParserCollection {
		if (!ParserCollection.instance) {
			ParserCollection.instance = new ParserCollection();
		}

		return ParserCollection.instance;
	}
	public registerParser(parser: PatternParser): void {
		this.parsers.push(parser);
	}
	private sortResults(results: Pattern[]) {

	}
}

// 卡片解析器 将卡片解析成为视图
// 卡片解析器负责解析卡片
export interface PatternParser {
	parse(card: Card): Pattern[]
}

// 卡片视图 卡片的视图
// 卡片视图管理视图的展示
export interface PatternViewer {
	render(parseInfo: Pattern): void
}

// 卡片更新
// 更新卡片
export interface PatternUpdater {
	update(parseInfo: Pattern): void
}

// 卡片模式 代表卡片可能出现的结果 类似小卡片
export interface PatternMethod extends PatternParser, PatternViewer, PatternUpdater {

}
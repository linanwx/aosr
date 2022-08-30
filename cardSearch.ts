import { AnnotationWrapper } from 'annotationParse';
import { CardIDTag } from 'cardHead';
import { TFile } from 'obsidian';
import { TagParser } from 'tag';
import { Card, NewCard } from "./card";

// 搜索的结果
export class SearchResult {
	AllCard: Card[]
	SearchName: string
	constructor() {
		this.AllCard = []
	}
}

// 卡片搜寻器负责搜索可能的卡片
export interface cardSearcher {
	search(file?: TFile): Promise<SearchResult>
}

export function NewCardSearch(tagName?: string): cardSearcher {
	return new defaultCardSearch(tagName)
}

// 默认的卡片搜索
// 搜索标签开头的一行，到该段落结束位置，该区域的内容被视为卡片Card的内容
class defaultCardSearch implements cardSearcher {
	private tagName = "Q"
	// 匹配所有 标签 开头行 到该段落的结束为止
	private defaultRegText = String.raw`(^#tagName\b.*)\n((?=\S)[\s\S]+?)(?=\n$)`
	private matchReg: RegExp
	async search(file?: TFile): Promise<SearchResult> {
		let result = new SearchResult()
		result.SearchName = "#" + this.tagName
		if (file) {
			await this.walkFileCard(file, (card) => {
				result.AllCard.push(card)
			})
		} else {
			await this.walkVaultFile(async (note) => {
				await this.walkFileCard(note, (card) => {
					result.AllCard.push(card)
				})
			})
		}
		return result
	}
	async walkVaultFile(callback: (note: TFile) => Promise<void>) {
		const notes: TFile[] = app.vault.getMarkdownFiles();
		for (const note of notes) {
			await callback(note)
		}
	}
	async walkFileCard(note: TFile, callback: (card: Card) => void) {
		let fileText: string = await app.vault.read(note);
		// workaround 如果文本最后一张卡片后面没有多余的换行，正则无法匹配
		fileText += "\n"
		let results = fileText.matchAll(this.matchReg)
		for (let result of results) {
			// 匹配注释段
			let cardText = result[0]
			let index = result.index || 0
			let content = result[2]
			let tags = TagParser.parse(result[1])
			let tag = tags.findTag(CardIDTag)
			let blockID = tag?.Suffix || ""
			let annotation = ""
			if (blockID != "") {
				annotation = AnnotationWrapper.findAnnotationWrapper(fileText, blockID)
			}
			let card: Card = NewCard(cardText, content, annotation, blockID, index, note)
			callback(card)
		}
	}
	constructor(tagName?: string) {
		if (tagName) {
			this.tagName = tagName
		}
		this.defaultRegText = this.defaultRegText.replace("tagName", this.tagName)
		this.matchReg = new RegExp(this.defaultRegText, "gm")
	}
}
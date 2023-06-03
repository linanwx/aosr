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
	search(file?: TFile, text?: string): Promise<SearchResult>
}

export function NewCardSearch(tagName?: string): cardSearcher {
	return new defaultCardSearch(tagName)
}

interface elem {
	all: string
	start: number
	end: number
	content: string
	heading: string
}

// 默认的卡片搜索
// 搜索标签开头的一行，到该段落结束位置，该区域的内容被视为卡片Card的内容
class defaultCardSearch implements cardSearcher {
	private tagName = "Q"
	private matchReg: RegExp
	private qReg = /(^#Q\b.*|^#\/Q\b.*)/gm;
	constructor(tagName?: string) {
	}
	findAllQ(text: string) {
		let match;
		const matches = [];
		while ((match = this.qReg.exec(text)) !== null) {
			matches.push({
				text: match[0],
				start: match.index,
				end: match.index + match[0].length
			});
		}
		return matches;
	}
	matchText(text: string) {
		const qTags = this.findAllQ(text);
		const matches: elem[] = [];
		for (let i = 0; i < qTags.length; i++) {
			if (qTags[i].text.startsWith('#Q')) {
				if (matches.length > 0) {
					if (matches[matches.length - 1].end > qTags[i].start) {
						continue
					}
				}
				let end;
				if (i + 1 < qTags.length && qTags[i + 1].text.startsWith('#/Q')) {
					end = qTags[i + 1].start - 1;
				} else {
					const nextBlankLine = text.indexOf('\n\n', qTags[i].end);
					end = nextBlankLine !== -1 ? nextBlankLine : text.length;
				}
				const all = text.slice(qTags[i].start, end)
				const content = text.slice(qTags[i].end + 1, end)
				if (all.length == 0 || content.length == 0) {
					continue
				}
				matches.push({ all: all, start: qTags[i].start, end: end, content: content, heading: qTags[i].text });
			}
		}
		return matches;
	}

	async search(file?: TFile, text?: string): Promise<SearchResult> {
		let result = new SearchResult()
		result.SearchName = "#" + this.tagName
		if (file) {
			if (!text) {
				await this.walkFileCard(file, (card) => {
					result.AllCard.push(card)
				})
			} else {
				this.walkText(text, file, (card) => {
					result.AllCard.push(card)
				})
			}

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
		// fileText += "\n"
		this.walkText(fileText, note, callback);
	}
	private walkText(fileText: string, note: TFile, callback: (card: Card) => void) {
		// let results = fileText.matchAll(this.matchReg);
		let results = this.matchText(fileText)
		for (let result of results) {
			// 匹配注释段
			let cardText = result.all;
			let index = result.start || 0;
			let tags = TagParser.parse(result.heading);
			let idTag = tags.findTag(CardIDTag);
			let blockID = idTag?.Suffix || "";
			let annotation = "";
			if (blockID != "") {
				annotation = AnnotationWrapper.findAnnotationWrapper(fileText, blockID);
			}
			let content = result.content;
			let card: Card = NewCard(cardText, content, annotation, blockID, index, note);
			callback(card);
		}
	}
}
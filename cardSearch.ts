import { AnnotationWrapper } from 'annotationParse';
import { CardIDTag } from 'cardHead';
import { Notice, TFile } from 'obsidian';
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
				result.AllCard = await this.getCardFromFile(file)
			} else {
				result.AllCard = this.getCardFromText(text, file)
			}
		} else {
			result.AllCard = await this.getCardFromVaultFile()
		}
		return result
	}

	async getCardFromVaultFile(): Promise<Card[]> {
		let cards: Card[] = []
		const notes: TFile[] = app.vault.getMarkdownFiles();
		for (const note of notes) {
			cards.push(...await this.getCardFromFile(note))
		}
		return cards
	}
	async getCardFromFile(note: TFile): Promise<Card[]> {
		let cards: Card[] = []
		try {
			let fileText = await app.vault.read(note)
			if (fileText) {
				cards = this.getCardFromText(fileText, note);
			}
		} catch (error) {
			new Notice(`Failed to read file: ${note}, error: ${error}`);
		}
		return cards;
	}
	private getCardFromText(fileText: string, note: TFile): Card[] {
		let cards: Card[] = []
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
			let card: Card = NewCard(cardText, content, annotation, blockID, index, note, tags.getStringArray());
			cards.push(card)
		}
		return cards
	}
}
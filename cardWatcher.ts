import { TFile, App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting, MarkdownPostProcessorContext, MarkdownRenderer, MarkdownRenderChild, MarkdownEditView, ItemView, WorkspaceLeaf, Vault } from 'obsidian';
import { Card } from "./card"
import { NewCardSearch } from "./cardSearch"
// 当卡片更新时 更新所组织的卡片
// 当文件更新时 更新卡片
export interface CardsWatcher {
	getCardByID(id: string): Card | undefined
}

export function NewCardsWatch(cards: Card[]): CardsWatcher {
	return new defaultCardsWatcher(cards)
}

class defaultCardsWatcher implements CardsWatcher {
	private cardMapByNote: Map<string, Map<string, Card>>;
	getCardByID(id: string): Card | undefined {
		for (let [_, cards] of this.cardMapByNote) {
			return cards.get(id)
		}
	}
	// 先记录全量卡片
	constructor(cards: Card[]) {
		this.cardMapByNote = new Map
		this.addCards(cards)
		this.listenFileChange()
	}
	private addCards(cards: Card[]): void {
		for (let card of cards) {
			let cardsMap = this.cardMapByNote.get(card.note.path)
			if (!cardsMap) {
				this.cardMapByNote.set(card.note.path, new Map)
			}
			this.cardMapByNote.get(card.note.path)?.set(card.ID, card)
		}
	}
	private listenFileChange() {
		app.vault.on("modify", async (file) => {
			if (file instanceof TFile) {
				let count = await this.updateFile(file)
			}
		})
	}
	// 更新某个文件的卡片
	private async updateFile(file: TFile): Promise<number> {
		let cardsMap = this.cardMapByNote.get(file.path)
		if (cardsMap) {
			cardsMap.clear()
			let search = NewCardSearch()
			let result = await search.search(file)
			this.addCards(result.AllCard)
			return result.AllCard.length
		}
		return 0
	}
}

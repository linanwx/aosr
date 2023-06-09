import { TFile } from 'obsidian';
import { Card } from "./card";
import { NewCardSearch } from "./cardSearch";
// 当卡片更新时 更新所组织的卡片
// 当文件更新时 更新卡片
export interface CardsWatcher {
	getLiveCard(card:Card): Promise<Card | undefined>
}

export function NewCardsWatch(cards: Card[]): CardsWatcher {
	return new defaultCardsWatcher(cards)
}

class defaultCardsWatcher implements CardsWatcher {
	private cardMapByNote: Map<string, Map<string, Card[]>>;
	async getLiveCard(checkcard:Card): Promise<Card | undefined> {
		let card = this.findCard(checkcard)
		if (!card) {
			return
		}
		await this.researchFile(card.note)
		card = this.findCard(checkcard)
		if (!card) {
			return
		}
		return card
	}
	findCard(checkcard:Card): Card | null {
		if (this.cardMapByNote.has(checkcard.note.path)) {
			const cardMap = this.cardMapByNote.get(checkcard.note.path);
			if (cardMap && cardMap.has(checkcard.ID)) {
				let cardArray = cardMap.get(checkcard.ID)
				if (cardArray) {
					if (cardArray.length == 1) {
						return cardArray[0]
					} else if (cardArray.length >= 1) {
						for (let index = 0; index < cardArray.length; index++) {
							const element = cardArray[index];
							if (element.indexBuff === checkcard.indexBuff) {
								return element
							}
						}
					}
				}
			}
		}
		return null
	}
	// 先记录全量卡片
	constructor(cards: Card[]) {
		this.cardMapByNote = new Map
		this.addCards(cards)
	}
	private addCards(cards: Card[]): void {
		for (let card of cards) {
			let cardsMap = this.cardMapByNote.get(card.note.path)
			if (!cardsMap) {
				this.cardMapByNote.set(card.note.path, new Map)
				cardsMap = this.cardMapByNote.get(card.note.path);
			}
			if (cardsMap) {
				let cardArray = cardsMap.get(card.ID)
				if (!cardArray) {
					cardArray = [];
					cardsMap.set(card.ID, cardArray);
				}
				cardArray.push(card);
			}
		}
	}
	// 更新某个文件的卡片
	private async researchFile(file: TFile): Promise<number> {
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

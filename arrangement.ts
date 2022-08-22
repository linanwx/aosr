import { Card } from "card"
import { Pattern } from "Pattern"
import { CardsWatcher, NewCardsWatch } from "cardWatcher"
import moment from "moment"


export interface Arrangement {
    PatternSequence():Generator<Pattern, boolean, unknown>
}

export function NewArrangement(cards: Card[]): Arrangement {
    return new defaultArrangement(cards)
}

class defaultArrangement implements Arrangement {
    private allPattern: Pattern[]
    private newPattern: Pattern[]
    private needReviewPattern: Pattern[]
    private watcher: CardsWatcher
    constructor(cards: Card[]) {
        this.allPattern = []
        this.newPattern = []
        this.needReviewPattern = []
        this.watcher = NewCardsWatch(cards)
        console.log(cards)
        for (let card of cards) {
            for (let p of card.patterns) {
                this.allPattern.push(p)
            }
        }
        this.sort()
        console.log(this.newPattern)
    }
    private sort() {
        let now = moment()
        for (let p of this.allPattern) {
            console.log(p.schedule)
            if (p.schedule.IsNew) {
                this.newPattern.push(p)
            }
            if (p.schedule.NextTime.isBefore(now)) {
                this.needReviewPattern.push(p)
            }
        }
    }
    findLivePattern(p: Pattern): Pattern | undefined {
        let card = this.watcher.getCardByID(p.card.ID)
        if (!card) {
            return card
        }
        for (let cardp of card.patterns) {
            if (p.ID == cardp.ID) {
                return cardp
            }
        }
        return
    }
    *PatternSequence() {
        for (let p of this.needReviewPattern) {
            let cardp = this.findLivePattern(p)
            if (cardp) {
                yield p
            }
        }
        for (let p of this.newPattern) {
            let cardp = this.findLivePattern(p)
            if (cardp) {
                yield p
            }
        }
        return true
    }
}
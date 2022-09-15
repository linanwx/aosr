import { NewCardSearch } from "cardSearch"
import { CardsWatcher, NewCardsWatch } from "cardWatcher"
import { Pattern } from "Pattern"

class ArrangementItem {
    Name:string
    Count: number
    constructor(name:string, count:number) {
        this.Name = name
        this.Count = count
    }
}

abstract class ArrangementBase {
    abstract PatternSequence(Name:string):AsyncGenerator<Pattern, boolean, unknown>
    abstract ArrangementList():ArrangementItem[]
}

export class Arrangement implements ArrangementBase{
    private allPattern: Pattern[]
    private newPattern: Pattern[]
    private needReviewPattern: Pattern[]
    private needLearn: Pattern[]
    private watcher: CardsWatcher
    constructor() {
        this.allPattern = []
        this.newPattern = []
        this.needReviewPattern = []
    }
    async init() {
        let search = NewCardSearch()
		let allcards = await search.search()
        this.allPattern = []
        this.newPattern = []
        this.needReviewPattern = []
        this.watcher = NewCardsWatch(allcards.AllCard)
        for (let card of allcards.AllCard) {
            for (let p of card.patterns) {
                this.allPattern.push(p)
            }
        }
        this.sort()
    }
    ArrangementList(): ArrangementItem[] {
        let retlist:ArrangementItem[] = []
        if (this.newPattern.length > 0) {
            retlist.push(new ArrangementItem("new", this.newPattern.length)) 
        }
        if (this.needReviewPattern.length > 0 ) {
            retlist.push(new ArrangementItem("review", this.needReviewPattern.length))
        }
        if (this.needLearn.length > 0 ) {
            retlist.push(new ArrangementItem("learn", this.needLearn.length))
        }
        return retlist
    }
    private sort() {
        let now = window.moment()
        this.newPattern = []
        this.needReviewPattern = []
        this.needLearn = []
        for (let p of this.allPattern) {
            if (p.schedule.IsNew) {
                this.newPattern.push(p)
            }
            if (p.schedule.NextTime.isBefore(now)) {
                this.needReviewPattern.push(p)
            }
            if (!p.schedule.LearnedOK) {
                this.needLearn.push(p)
            }
        }
        this.newPattern.sort(()=>{
            return .5 - Math.random()
        })
        this.needReviewPattern.sort(()=>{
            return .5 - Math.random()
        })
        this.needLearn.sort((a,b)=>{
            if (a.schedule.LearnedTime.isAfter(b.schedule.LearnedTime)) {
                return 1
            }
            if (a.schedule.LearnedTime.isSame(b.schedule.LearnedTime)) {
                return 0
            }
            return -1
        })
    }
    async findLivePattern(p: Pattern): Promise<Pattern | undefined> {
        let liveCard = await this.watcher.getLiveCard(p.card.ID)
        if (!liveCard) {
            console.info("卡片ID不存在", p.card.ID)
            return
        }
        for (let cardp of liveCard.patterns) {
            if (p.TagID == cardp.TagID) {
                return cardp
            }
        }
        console.info("卡片模式不存在", p.TagID)
        return
    }
    async *PatternSequence(name:string) {
        console.log("进入")
        if (name == "review") {
            for (let p of this.needReviewPattern) {
                let cardp = await this.findLivePattern(p)
                if (cardp) {
                    yield cardp
                } else {
                    console.info("卡片已移除")
                }
            }
        }
        if (name == "new") {
            for (let p of this.newPattern) {
                let cardp = await this.findLivePattern(p)
                if (cardp) {
                    yield cardp
                } else {
                    console.info("卡片已移除")
                }
            }
        }
        if (name == "learn") {
            for (let p of this.needLearn) {
                let cardp = await this.findLivePattern(p)
                if (cardp) {
                    yield cardp
                } else {
                    console.info("卡片已移除")
                }
            }
        }
        console.log("离开")
        return true
    }
}
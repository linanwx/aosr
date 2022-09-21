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
    private wait:Pattern[]
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
        if (this.wait.length > 0) {
            retlist.push(new ArrangementItem("wait", this.wait.length))
        }
        return retlist
    }
    private sort() {
        let now = window.moment()
        this.newPattern = []
        this.needReviewPattern = []
        this.needLearn = []
        this.wait = []
        for (let p of this.allPattern) {
            let learnInfo = p.schedule.LearnInfo
            if (learnInfo.IsNew) {
                this.newPattern.push(p)
            } else if (p.schedule.NextTime.isBefore(now)) {
                this.needReviewPattern.push(p)
            } else if (learnInfo.IsLearn) {
                this.needLearn.push(p)
            } else if (learnInfo.IsWait) {
                this.wait.push(p)
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
            return
        }
        for (let cardp of liveCard.patterns) {
            if (p.TagID == cardp.TagID) {
                return cardp
            }
        }
        return
    }
    async *PatternSequence(name:string) {
        if (name == "review") {
            for (let p of this.needReviewPattern) {
                let cardp = await this.findLivePattern(p)
                if (cardp) {
                    yield cardp
                } else {
                }
            }
        }
        if (name == "new") {
            for (let p of this.newPattern) {
                let cardp = await this.findLivePattern(p)
                if (cardp) {
                    yield cardp
                } else {
                }
            }
        }
        if (name == "learn") {
            for (let p of this.needLearn) {
                let cardp = await this.findLivePattern(p)
                if (cardp) {
                    yield cardp
                } else {
                }
            }
        }
        return true
    }
}
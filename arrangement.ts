import { NewCardSearch } from "cardSearch"
import { CardsWatcher, NewCardsWatch } from "cardWatcher"
import i18next from "i18next"
import { Pattern } from "Pattern"

class ArrangementItem {
    Name: string
    Count: number
    Display: string
    constructor(name: string, count: number, display: string) {
        this.Name = name
        this.Count = count
        this.Display = display
    }
}

const NEWTAG = "new"
const REVIEWTAG = "review"
const LEARNTAG = "learn"

export class Stats {
    NewCount: number
    ReviewCount: number
    LearnCount: number
}

export class PatternIter {
    pattern: Pattern
    index: number
    total: number
    constructor(pattern: Pattern, index: number, total: number) {
        this.pattern = pattern
        this.index = index
        this.total = total
    }
}

abstract class ArrangementBase {
    abstract PatternSequence(Name: string): AsyncGenerator<PatternIter, boolean, unknown>
    abstract ArrangementList(): ArrangementItem[]
    abstract stats(): Stats
}

function isToday(date: moment.Moment): boolean {
    const todayStart = window.moment().startOf('day')
    const todayEnd = window.moment().endOf('day')
    return date.isBetween(todayStart, todayEnd, null, '[]');
}

export class Arrangement implements ArrangementBase {
    private allPattern: Pattern[]
    private newPattern: Pattern[]
    private needReviewPattern: Pattern[]
    private needLearn: Pattern[]
    // private wait:Pattern[]
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
    stats(): Stats {
        let newCount = 0
        let reviewCount = 0
        let learnCount = 0
        for (let p of this.allPattern) {
            if (p.schedule.Last && p.schedule.Last != "") {
                if (isToday(p.schedule.LastTime)) {
                    if (p.schedule.Opts.length == 1) {
                        newCount++
                    } else {
                        reviewCount++
                    }
                }
            }
            if (p.schedule.Learned && p.schedule.Learned != "") {
                if (isToday(p.schedule.LearnedTime)) {
                    learnCount++
                }
            }
        }
        let stats = new Stats
        stats.LearnCount = learnCount
        stats.NewCount = newCount
        stats.ReviewCount = reviewCount
        return stats
    }
    ArrangementList(): ArrangementItem[] {
        let retlist: ArrangementItem[] = []
        if (this.newPattern.length > 0) {
            retlist.push(new ArrangementItem(NEWTAG, this.newPattern.length, i18next.t('StartTextNew')))
        }
        if (this.needReviewPattern.length > 0) {
            retlist.push(new ArrangementItem(REVIEWTAG, this.needReviewPattern.length, i18next.t('StartTextReview')))
        }
        if (this.needLearn.length > 0) {
            retlist.push(new ArrangementItem(LEARNTAG, this.needLearn.length, i18next.t('StartTextLearn')))
        }
        return retlist
    }
    private sort() {
        let now = window.moment()
        this.newPattern = []
        this.needReviewPattern = []
        this.needLearn = []
        // this.wait = []
        for (let p of this.allPattern) {
            let learnInfo = p.schedule.LearnInfo
            if (learnInfo.IsNew) {
                this.newPattern.push(p)
            } else if (p.schedule.NextTime.isBefore(now)) {
                this.needReviewPattern.push(p)
            } else if (learnInfo.IsLearn) {
                this.needLearn.push(p)
            }
        }
        this.newPattern.sort(() => {
            return .5 - Math.random()
        })
        this.needReviewPattern.sort(() => {
            return .5 - Math.random()
        })
        this.needLearn.sort((a, b) => {
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
        let liveCard = await this.watcher.getLiveCard(p.card)
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
    async *PatternSequence(name: string) {
        if (name == REVIEWTAG) {
            for (let i = 0; i < this.needReviewPattern.length; i++) {
                let p = this.needReviewPattern[i]
                let cardp = await this.findLivePattern(p)
                if (cardp) {
                    yield new PatternIter(cardp, i, this.needReviewPattern.length)
                }
            }
        }
        if (name == NEWTAG) {
            for (let i = 0; i < this.newPattern.length; i++) {
                let p = this.newPattern[i]
                let cardp = await this.findLivePattern(p)
                if (cardp) {
                    yield new PatternIter(cardp, i, this.newPattern.length)
                }
            }
        }
        if (name == LEARNTAG) {
            for (let i = 0; i < this.needLearn.length; i++) {
                let p = this.needLearn[i]
                let cardp = await this.findLivePattern(p)
                if (cardp) {
                    yield new PatternIter(cardp, i, this.needLearn.length)
                }
            }
        }
        return true
    }
}
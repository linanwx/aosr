import { NewCardSearch } from "cardSearch"
import { CardsWatcher, NewCardsWatch } from "cardWatcher"
import { ParseRule } from "deck"
import i18next from "i18next"
import { RuleProperties } from "json-rules-engine"
import { Pattern } from "Pattern"
import { defaultSchedule } from "schedule"
import { GlobalSettings } from "setting"

class ArrangementItem {
    Name: TAGNAME
    Count: number
    Display: string
    constructor(name: TAGNAME, count: number, display: string) {
        this.Name = name
        this.Count = count
        this.Display = display
    }
}

export enum TAGNAME {
    NEWTAG = "new",
    REVIEWTAG = "review",
    LEARNTAG = "learn",
    HARDTAG = "hard",
    ALLTAG = "all",
}

export class Stats {
    NewCount: number
    ReviewCount: number
    LearnCount: number
    HardCount: number
}

export function hardPatterns(p: Pattern[]): Pattern[] {
    return p.filter((p) => {
        return p.schedule.Ease - defaultSchedule.MIN_EASE_VALUE
            < 0.33 * (GlobalSettings.DefaultEase - defaultSchedule.MIN_EASE_VALUE)
    })
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
    isOnlyAllTag(): boolean {
        for (const item of this.ArrangementList()) {
            if (item.Name !== TAGNAME.ALLTAG) {
                return false;
            }
        }
        return true;
    }
}

function isToday(date: moment.Moment): boolean {
    const todayStart = window.moment().startOf('day')
    const todayEnd = window.moment().endOf('day')
    return date.isBetween(todayStart, todayEnd, null, '[]');
}

export class Arrangement extends ArrangementBase {
    private allPattern: Pattern[]
    private newPattern: Pattern[]
    private needReviewPattern: Pattern[]
    private needLearn: Pattern[]
    private hardPatterns: Pattern[]
    // private wait:Pattern[]
    private watcher: CardsWatcher
    constructor() {
        super()
        this.allPattern = []
        this.newPattern = []
        this.needReviewPattern = []
        this.hardPatterns = []
    }
    async init(rule: RuleProperties | null) {
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
        if (rule != null) {
            this.allPattern = await ParseRule(rule, this.allPattern)
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
        stats.HardCount = hardPatterns(this.allPattern).length;
        return stats
    }
    ArrangementList(): ArrangementItem[] {
        let retlist: ArrangementItem[] = []
        if (this.newPattern.length > 0) {
            retlist.push(new ArrangementItem(TAGNAME.NEWTAG, this.newPattern.length, i18next.t('StartTextNew')))
        }
        if (this.needReviewPattern.length > 0) {
            retlist.push(new ArrangementItem(TAGNAME.REVIEWTAG, this.needReviewPattern.length, i18next.t('StartTextReview')))
        }
        if (this.needLearn.length > 0) {
            retlist.push(new ArrangementItem(TAGNAME.LEARNTAG, this.needLearn.length, i18next.t('StartTextLearn')))
        }
        if (this.hardPatterns.length > 0
            && GlobalSettings.ShowHardCardsArrangement) {
            retlist.push(new ArrangementItem(TAGNAME.HARDTAG, this.hardPatterns.length, i18next.t('StartTextHard')))
        }
        if (this.allPattern.length > 0) {
            retlist.push(new ArrangementItem(TAGNAME.ALLTAG, this.allPattern.length, i18next.t('StartTextALL')))
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
        this.hardPatterns = hardPatterns(this.allPattern);
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
        let patterns = null;

        if (name == TAGNAME.REVIEWTAG) {
            patterns = this.needReviewPattern;
        } else if (name == TAGNAME.NEWTAG) {
            patterns = this.newPattern;
        } else if (name == TAGNAME.LEARNTAG) {
            patterns = this.needLearn;
        } else if (name == TAGNAME.HARDTAG) {
            patterns = this.hardPatterns;
        } else if (name == TAGNAME.ALLTAG) {
            patterns = this.allPattern;
        }

        if (patterns) {
            for (let i = 0; i < patterns.length; i++) {
                let p = patterns[i]
                let cardp = await this.findLivePattern(p)
                if (cardp) {
                    yield new PatternIter(cardp, i, patterns.length)
                }
            }
        }

        return true;
    }
}

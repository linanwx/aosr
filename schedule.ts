import { Duration, now } from "moment"
import { stringifyYaml } from "obsidian"
import { DEFAULT_SETTINGS } from "setting"
import { parse, stringify } from 'yaml'
import moment from "moment";
import toml from "toml"

export enum Operation {
    // 最难
    HARD,
    // 中等
    FAIR,
    // 简单
    EASE,
}

export interface PatternSchedule {
    apply(opt: Operation): void
    copy(v: PatternSchedule): void
    get Gap(): moment.Duration
    get Ease(): number
    get Opts(): Operation[]
    get IsNew(): boolean
    get NextTime():moment.Moment
    get LastTime(): moment.Moment
}

export function NewSchedule(id: string) {
    return new defaultPattern(id)
}

// 一个模式的复习信息
export class defaultPattern implements PatternSchedule {
    copy(v: PatternSchedule) {
        if (v instanceof defaultPattern) {
            this.opts = v.opts
            this.Last = v.Last
            this.Next = v.Next
        }
    }
    private opts: string
    private id: string
    Last: string
    Next: string
    get LastTime(): moment.Moment {
        if (!this.Last) {
            return moment()
        }
        return moment(this.Last, "YYYY-MM-DD HH:mm")
    }
    set LastTime(t: moment.Moment) {
        this.Last = t.format("YYYY-MM-DD HH:mm")
    }
    get NextTime(): moment.Moment {
        if (!this.Next) {
            return moment()
        }
        return moment(this.Next, "YYYY-MM-DD HH:mm")
    }
    set NextTime(t: moment.Moment) {
        this.Next = t.format("YYYY-MM-DD HH:mm")
    }
    get Opts(): Operation[] {
        let ret: Operation[] = []
        for (let c of this.opts) {
            ret.push(Number(c))
        }
        return ret
    }
    get Gap(): moment.Duration {
        if (!this.LastTime) {
            return moment.duration(1, "days")
        }
        let now = moment()
        let gap = moment.duration(now.diff(this.LastTime, "seconds"), "seconds")
        return gap
    }
    get ID(): string {
        return this.id;
    }
    apply(opt: Operation) {
        this.opts += opt.toString()
        let duration: Duration
        if (opt == Operation.EASE) {
            duration = new easeSchedule(this).calculate(opt)
        } else if (opt == Operation.FAIR) {
            duration = new fairSchedule(this).calculate(opt)
        } else if (opt == Operation.HARD) {
            duration = new hardSchedule(this).calculate(opt)
        } else {
            throw new Error("opt error")
        }

        this.LastTime = moment()
        this.NextTime = this.NextTime.add(duration)
        if (this.NextTime.unix() < moment().unix()) {
            let gap = moment.duration(3, "hours")
            this.NextTime = moment().add(gap)
        }
    }
    constructor(id: string) {
        this.id = id
        this.opts = ""
        this.Last = ""
        this.Next = ""
    }
    get IsNew(): boolean {
        if (this.Last == "") {
            return true
        }
        return false
    }
    get Ease(): number {
        // hard扣除
        let hardBonus = 0
        for (let opt of this.Opts.slice(-7, -1)) {
            if (opt == Operation.HARD) {
                hardBonus = hardBonus + 20
            }
        }

        // 连续非hard奖励 
        let fairBonus = 0
        for (let opt of this.Opts.slice(-7, -1)) {
            if (opt == Operation.FAIR || opt == Operation.EASE) {
                if (fairBonus == 0) {
                    fairBonus = 2
                } else {
                    fairBonus = fairBonus * 2
                }
            } else if (opt == Operation.HARD) {
                fairBonus = 0
            }
        }
        fairBonus = fairBonus * 5

        // 简单奖励
        let easeBouns = 0
        for (let opt of this.Opts.slice(-7, -1)) {
            if (opt == Operation.EASE) {
                easeBouns += 20
            }
        }
        let ease = DEFAULT_SETTINGS.DefaultEase - hardBonus + fairBonus + easeBouns
        ease = Math.max(130, ease)
        return ease
    }
}

// 卡片所有的复习结果
export class CardSchedule {
    copy(cardSchedule: CardSchedule) {
        const map1 = new Map(Object.entries(cardSchedule.schedules))
        for (let [k, v] of map1) {
            let schedule = NewSchedule(k)
            schedule.copy(v)
            this.schedules.set(k, schedule)
        }
    }
    public schedules: Map<string, PatternSchedule>
    constructor() {
        this.schedules = new Map
    }
    getSchedule(id: string) {
        let parten = this.schedules.get(id)
        if (!parten) {
            parten = NewSchedule(id)
            this.schedules.set(id, parten)
        }
        return parten
    }
}

// 负责计算复习间隔
interface scheduler {
    calculate(opt: Operation): moment.Duration
}

class schedulerBase {
    private _schedule: PatternSchedule
    constructor(schedule: PatternSchedule) {
        this._schedule = schedule
    }
    get schedule(): PatternSchedule {
        return this._schedule
    }
}

// 简单难度计算
class easeSchedule extends schedulerBase implements scheduler {
    calculate(opt: Operation): moment.Duration {
        let basesecond = this.schedule.Gap.asSeconds() * this.schedule.Ease / 100;
        let addsecond = Number(DEFAULT_SETTINGS.EasyBonus) * 24 * 60 * 60
        let newdiff = moment.duration(basesecond + addsecond, "seconds")
        return newdiff
    }
}

// 正常难度计算
class fairSchedule extends schedulerBase implements scheduler {
    calculate(opt: Operation): Duration {
        let basesecond = this.schedule.Gap.asSeconds() * this.schedule.Ease / 100;
        let newdiff = moment.duration(basesecond, "seconds")
        return newdiff
    }
}

// 困难难度计算
class hardSchedule extends schedulerBase implements scheduler {
    calculate(opt: Operation): Duration {
        let basesecond = this.schedule.Gap.asSeconds() * 100 / this.schedule.Ease;
        let addsecond = Number(DEFAULT_SETTINGS.HardBonus) * 24 * 60 * 60;
        let diffsecond = basesecond - addsecond
        let newdiff = moment.duration(diffsecond, "seconds")
        return newdiff
    }
}
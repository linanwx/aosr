import { GlobalSettings } from "setting";

export enum ReviewEnum {
    // 不会
    HARD = 0,
    // 尚可
    FAIR = 1,
    // 简单
    EASY = 2,
    // 完全不会
    FORGET = 3,
}

export enum LearnEnum {
    // 简单
    EASY,
    // 会了
    FAIR,
    // 不太会
    HARD,
    // 不会
    FORGET,
}

// 包含两个子操作
export abstract class Operation {
}

// 复习操作
export class ReviewOpt extends Operation {
    value: ReviewEnum
    constructor(value: ReviewEnum) {
        super()
        this.value = value
    }
}

// 学习操作
export class LearnOpt extends Operation {
    value: LearnEnum
    constructor(value: LearnEnum) {
        super()
        this.value = value
    }
}

export interface scheduleCalc {
    get Gap(): moment.Duration
    get Ease(): number
}

class LearnInfo {
    IsLearn: boolean
    IsNew: boolean
    IsWait: boolean
}

export interface scheduleArrange {
    get NextTime(): moment.Moment
    get LearnedTime(): moment.Moment
    get LearnInfo(): LearnInfo
    // 根据操作更新复习计划
    apply(opt: Operation): void
    // 获取下次需要复习的时间
    CalcNextTime(opt: ReviewEnum): moment.Moment
}

export interface PatternYaml {
    Last: string
    Next: string
    Opts: string
    Learned: string | null
    LearnedCount: number | null
    // 用于读取存储的schedule yaml格式 需要复制对象
    copy(v: PatternYaml): void
}

export interface PatternSchedule extends scheduleCalc, scheduleArrange, PatternYaml {
}

export function NewSchedule(id: string) {
    return new defaultSchedule(id)
}

// 一个模式的复习信息
export class defaultSchedule implements PatternSchedule {
    copy(v: PatternYaml) {
        this.Opts = v.Opts
        this.Last = v.Last
        this.Next = v.Next
        this.Learned = v.Learned
        this.LearnedCount = v.LearnedCount
    }
    private id: string
    Last: string
    Next: string
    Opts: string
    Learned: string | null
    LearnedCount: number | null
    get LearnedTime(): moment.Moment {
        if (!this.Learned) {
            return this.LastTime
        }
        return window.moment(this.Learned, "YYYY-MM-DD HH:mm:ss")
    }
    set LearnedTime(t: moment.Moment) {
        this.Learned = t.format("YYYY-MM-DD HH:mm:ss")
    }
    get LastTime(): moment.Moment {
        if (!this.Last) {
            return window.moment()
        }
        return window.moment(this.Last, "YYYY-MM-DD HH:mm")
    }
    set LastTime(t: moment.Moment) {
        this.Last = t.format("YYYY-MM-DD HH:mm")
    }
    get NextTime(): moment.Moment {
        if (!this.Next) {
            return window.moment()
        }
        return window.moment(this.Next, "YYYY-MM-DD HH:mm")
    }
    set NextTime(t: moment.Moment) {
        this.Next = t.format("YYYY-MM-DD HH:mm")
    }
    get OptArr(): ReviewEnum[] {
        let ret: ReviewEnum[] = []
        for (let c of this.Opts) {
            ret.push(Number(c))
        }
        return ret
    }
    get Gap(): moment.Duration {
        if (!this.Last) {
            return window.moment.duration(12, "hours")
        }
        let now = window.moment()
        let gap = window.moment.duration(now.diff(this.LastTime, "seconds"), "seconds")
        return gap
    }
    get ID(): string {
        return this.id;
    }
    apply(opt: Operation) {
        if (opt instanceof ReviewOpt) {
            this.applyReviewResult(opt.value);
        }
        if (opt instanceof LearnOpt) {
            this.applyLearnResult(opt.value);
        }
    }
    constructor(id: string) {
        this.id = id
        this.Opts = ""
        this.Last = ""
        this.Next = ""
    }
    get LearnInfo(): LearnInfo {
        let info = new LearnInfo
        info.IsNew = this.IsNew
        info.IsLearn = false
        info.IsWait = false
        if (info.IsNew) {
            return info
        }
        if (!this.Opts) {
        } else if (this.Opts.at(-1) == String(ReviewEnum.EASY)) {
        } else if (this.Opts.at(-1) == String(ReviewEnum.FAIR)) {
        } else if (this.LearnedCount && this.LearnedCount >= 2) {
        } else {
            // 短期记忆内的信息不需要学习
            // 这部分内容会在过了短期记忆从记忆区中清空后重新安排学习
            let checkPoint = window.moment().add(-60, "seconds")
            if (this.LearnedTime.isAfter(checkPoint)) {
                info.IsWait = true
            } else {
                info.IsLearn = true
            }
        }
        return info
    }
    private applyLearnResult(opt: LearnEnum) {
        if (!this.LearnedCount) {
            this.LearnedCount = 0
        }
        this.LearnedCount = Math.max(-2, this.LearnedCount)
        if (opt == LearnEnum.FAIR) {
            this.LearnedCount++
        }
        if (opt == LearnEnum.HARD) {
            this.LearnedCount--
        }
        if (opt == LearnEnum.FORGET) {
            this.LearnedCount -= 2
        }
        if (opt == LearnEnum.EASY) {
            this.LearnedCount += 2
        }
        this.LearnedCount = Math.max(-2, this.LearnedCount)
        this.LearnedTime = window.moment()
    }
    private applyReviewResult(opt: ReviewEnum) {
        let nextTime = this.CalcNextTime(opt)
        this.clearLearn();
        this.NextTime = nextTime
        this.Opts += opt.toString();
        this.LastTime = window.moment();
    }
    CalcNextTime(opt: ReviewEnum): moment.Moment {
        let duration: moment.Duration;
        if (opt == ReviewEnum.EASY) {
            duration = new easeSchedule(this).calculate();
        } else if (opt == ReviewEnum.FAIR) {
            duration = new fairSchedule(this).calculate();
        } else if (opt == ReviewEnum.HARD) {
            duration = new hardSchedule(this).calculate();
        } else if (opt == ReviewEnum.FORGET) {
            duration = new unknowSchedule(this).calculate();
        } else {
            throw new Error("unknow operation");
        }
        // console.info(`gap ${this.Gap.asDays().toFixed(2)} duration ${duration.asDays().toFixed(2)}`)
        // 在原来规划的下次复习时间上叠加这次复习的结果
        // 通常NextTime为now，如果提早或晚复习，则NextTime可能为过去和将来
        // duration同样可能为正值（表示在规划之后的某天复习）负值（表示这个内容需要将下次规划的时间提早，如果提早到当前时间以前，则需要立即复习）
        let nextTime = this.NextTime.add(duration);
        if (nextTime.unix() < window.moment().unix()) {
            // 如果需要立即复习，说明复习间隔已被缩短到0以下
            // 这种情况意味着提交了一次Hard，时间间隔为负值，且叠加在安排计划上之后的下次时间点仍然为过去
            // 此时需要立刻进行学习，而不是立刻进行复习检测
            // 因为复习检测并不意味着用户进行了学习，且学会了（尽管很多情况下，复习时用户在压力小的情况下可以同时进行学习并且学会）
            // 只有学习才能保证用户一定学会了
            // 假设用户在此刻进行了学习
            // 如论是否用户真的进行了学习，或者用户在复习过程中顺带进行了学习，我们都将在3小时之后进行复习检测
            nextTime = window.moment().add(3, "hours");
        }
        return nextTime
    }
    // 清除学习结果
    private clearLearn() {
        this.LearnedCount = null;
        this.Learned = null;
    }
    get IsNew(): boolean {
        if (this.Last == "") {
            return true
        }
        return false
    }
    get Ease(): number {
        // console.info(`opts is ${this.OptArr}`)
        // 困难扣除
        let hardBonus = 0
        for (let opt of this.OptArr.slice(-10)) {
            if (opt == ReviewEnum.FORGET) {
                hardBonus += 50
            }
            if (opt == ReviewEnum.HARD) {
                hardBonus += 25
            }
        }
        // 简单奖励
        let easeBouns = 0
        for (let opt of this.OptArr.slice(-10)) {
            if (opt == ReviewEnum.EASY) {
                easeBouns += 25
            }
        }
        let ease = GlobalSettings.DefaultEase - hardBonus + easeBouns
        ease = Math.max(130, ease)
        // console.info(`hardbonus ${hardBonus} easeBonus ${easeBouns} result ease ${ease}`)
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

abstract class scheduler {
    private _schedule: scheduleCalc
    constructor(schedule: scheduleCalc) {
        this._schedule = schedule
    }
    get schedule(): scheduleCalc {
        return this._schedule
    }
    abstract calculate(): moment.Duration
}

// 简单难度计算
class easeSchedule extends scheduler {
    calculate(): moment.Duration {
        let basesecond = this.schedule.Gap.asSeconds() * this.schedule.Ease / 100;
        let addsecond = Number(GlobalSettings.EasyBonus) * 24 * 60 * 60
        let newdiff = window.moment.duration(basesecond + addsecond, "seconds")
        return newdiff
    }
}

// 正常难度计算
class fairSchedule extends scheduler {
    calculate(): moment.Duration {
        let basesecond = this.schedule.Gap.asSeconds() * this.schedule.Ease / 100;
        let newdiff = window.moment.duration(basesecond, "seconds")
        return newdiff
    }
}

// 困难难度计算
class hardSchedule extends scheduler {
    calculate(): moment.Duration {
        let basesecond = this.schedule.Gap.asSeconds() * 100 / this.schedule.Ease;
        let newdiff = window.moment.duration(basesecond, "seconds")
        return newdiff
    }
}

// 不会难度计算
class unknowSchedule extends scheduler {
    calculate(): moment.Duration {
        let basesecond = this.schedule.Gap.asSeconds() * 100 / this.schedule.Ease;
        let addsecond = Number(GlobalSettings.HardBonus) * 24 * 60 * 60;
        let diffsecond = basesecond - addsecond
        let newdiff = window.moment.duration(diffsecond, "seconds")
        return newdiff
    }
}
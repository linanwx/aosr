import moment, { Duration } from "moment";
import { DEFAULT_SETTINGS } from "setting";

export enum Operation {
    // 不会
    HARD,
    // 尚可
    FAIR,
    // 简单
    EASE,
    // 知道了
    LEARN,
    // 不知道
    NOTLEARN
}

export interface PatternSchedule {
    apply(opt: Operation): void
    copy(v: PatternSchedule): void
    // Gap 返回距离上次复习间隔时间是多久
    get Gap(): moment.Duration
    get Ease(): number
    get OptArr(): Operation[]
    get IsNew(): boolean
    // NextTime 返回规划的下次复习的时间
    get NextTime(): moment.Moment
    // LastTime 返回上一次复习时间
    get LastTime(): moment.Moment
    // 获取学习结束
    get LearnedOK(): boolean
    // 获取上次学习的时间
    get LearnedTime(): moment.Moment
    Last: string
    Next: string
    Opts: string
    Learned: string | null
    LearnedCount: number | null
}

export function NewSchedule(id: string) {
    return new defaultSchedule(id)
}

// 一个模式的复习信息
export class defaultSchedule implements PatternSchedule {
    copy(v: PatternSchedule) {
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
        return moment(this.Learned, "YYYY-MM-DD HH:mm:ss")
    }
    set LearnedTime(t: moment.Moment) {
        this.Learned = t.format("YYYY-MM-DD HH:mm:ss")
    }
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
    get OptArr(): Operation[] {
        let ret: Operation[] = []
        for (let c of this.Opts) {
            ret.push(Number(c))
        }
        return ret
    }
    get Gap(): moment.Duration {
        if (!this.Last) {
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
        if (opt == Operation.EASE || opt == Operation.FAIR || opt == Operation.HARD) {
            this.applyReviewResult(opt);
        }
        if (opt == Operation.LEARN || opt == Operation.NOTLEARN) {
            this.applyLearnResult(opt);
        }
    }
    constructor(id: string) {
        this.id = id
        this.Opts = ""
        this.Last = ""
        this.Next = ""
    }
    get LearnedOK(): boolean {
        console.log(this.Opts)
        if (!this.Opts) {
            return true
        }
        if (this.Opts.at(-1) != String(Operation.HARD)) {
            return true
        }
        if (this.LearnedCount && this.LearnedCount >= 2) {
            return true
        }
        // 短期记忆内的信息不需要学习
        // 这部分内容会在过了短期记忆的时长变为需要学习的内容
        let checkPoint = moment().add(-1, "minutes")
        if (this.LearnedTime.isAfter(checkPoint)) {
            return true
        }
        return false
    }
    private applyLearnResult(opt: Operation) {
        if (!this.LearnedCount) {
            this.LearnedCount = 0
        }
        if (opt == Operation.LEARN) {
            this.LearnedCount ++
        }
        if (opt == Operation.NOTLEARN) {
            this.LearnedCount --
        }
        this.LearnedTime = moment()
    }
    private applyReviewResult(opt: Operation) {
        let duration: Duration;
        if (opt == Operation.EASE) {
            duration = new easeSchedule(this).calculate(opt);
        } else if (opt == Operation.FAIR) {
            duration = new fairSchedule(this).calculate(opt);
        } else if (opt == Operation.HARD) {
            duration = new hardSchedule(this).calculate(opt);
        } else {
            throw new Error("unknow operation");
        }
        console.log(`ease ${this.Ease} duration ${duration.asDays()}`);
        // 在原来规划的下次复习时间上叠加这次复习的结果
        // 通常NextTime为now，如果提早或晚复习，则NextTime可能为过去和将来
        // duration同样可能为正值（表示在规划之后的某天复习）负值（表示这个内容需要将下次规划的时间提早，如果提早到当前时间以前，则需要立即复习）
        this.NextTime = this.NextTime.add(duration);
        if (this.NextTime.unix() < moment().unix()) {
            // 如果需要立即复习，说明复习间隔已被缩短到0以下
            // 这种情况意味着提交了一次Hard，时间间隔为负值，且叠加在安排计划上之后的下次时间点仍然为过去
            // 安排计划时间通常就代表记忆的强度，安排的越早，记忆强度就越弱，安排的越晚，记忆强度越强
            // 安排在过去意味着记忆强度为0以下，对于记忆强度为0以下的pattern，用户需要通过学习来保证记忆强度为0以上
            // 这里假设用户会在之后进行学习，或者本次复习时进行了学习
            // 因此，在3小时以后，重新进行检测。3小时的间隔可以确保复习检验的不是中期记忆
            this.NextTime = moment().add(3, "hours");
        }
        this.clearLearn();
        this.Opts += opt.toString();
        this.LastTime = moment();
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
        // hard扣除
        let hardBonus = 0
        for (let opt of this.OptArr.slice(-7)) {
            if (opt == Operation.HARD) {
                hardBonus = hardBonus + 20
            }
        }

        // 连续非hard奖励 
        let fairBonus = 0
        for (let opt of this.OptArr.slice(-7)) {
            if (opt == Operation.FAIR || opt == Operation.EASE) {
                if (fairBonus == 0) {
                    fairBonus = 10
                } else {
                    fairBonus = fairBonus * 2
                }
            } else if (opt == Operation.HARD) {
                fairBonus = 0
            }
        }

        // 简单奖励
        let easeBouns = 0
        for (let opt of this.OptArr.slice(-7)) {
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
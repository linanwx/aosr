import { ItemView } from 'obsidian';
import { Operation, PatternSchedule } from 'schedule';
import { PatternMethod, Card } from './card';


export type PatternProps ={
	view:ItemView
}

// import { Md5 } from 'ts-md5';
// 卡片解析的结果 为卡片所持有
export interface Pattern {
	set ID(mark: string);
	get method(): PatternMethod;
	get schedule(): PatternSchedule;
	get card(): Card;
	submitOpt(opt: Operation): Promise<void>;
	Component(props:PatternProps): JSX.Element;
}

export class PatternBase {
	ID: string;
	method: PatternMethod;
	card: Card;
	constructor(card: Card) {
		this.card = card;
	}
	get schedule():PatternSchedule {
		return this.card.getSchedule(this.ID)
	}
}

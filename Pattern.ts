import { ItemView } from 'obsidian';
import { Operation, PatternSchedule } from 'schedule';
import { Card } from './card';


export type PatternProps ={
	view:ItemView
	clickShowAns:() => void
}

// 卡片的展示模式
export abstract class Pattern {
	TagID: string;
	private pcard: Card;
	get schedule(): PatternSchedule {
		return this.card.getSchedule(this.TagID)
	}
	get card(): Card {
		return this.pcard
	}
	constructor(card:Card, id:string) {
		this.pcard = card
		this.TagID = id
	}
	abstract submitOpt(opt: Operation): Promise<void>;
	abstract Component(props:PatternProps): JSX.Element;
}

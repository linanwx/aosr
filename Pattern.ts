import { CardIDTag } from 'cardHead';
import { Component } from 'obsidian';
import { Operation, PatternSchedule } from 'schedule';
import { TagParser } from 'tag';
import { Card } from './card';


export type PatternProps ={
	view:Component
	showAns:boolean
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
	Pronounce() {}
	abstract SubmitOpt(opt: Operation): Promise<void>;
	abstract Component(props:PatternProps): JSX.Element;
	abstract insertPatternID(): void;
	// 纯正面文本（不含答案），供预览用
	abstract get FrontText(): string;
	// 答案文本，供预览悬浮时显示
	abstract get BackText(): string;
	async InitAosrID() {
		this.insertPatternID()
		await this.card.commitFile({ID:true})
	}
}

export const cardParserRegFlags = "gm";
export function escapeRegExp(text: string): string {
	return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function prettyText (text:string):string {
	let tags = TagParser.parse(text)
	for (let tag of tags.Tags) {
		if (tag.Head != CardIDTag) {
			continue
		}
		text = text.replace(tag.Original, ()=>{return ""})
	}
	text = text.replace("#multicloze", ()=>{return ""})
	return text
}
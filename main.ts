import { cyrb53 } from 'hash';
import { Plugin } from 'obsidian';
import { AOSRSettings, AOSRSettingTab, DEFAULT_SETTINGS } from 'setting';
import { SingleLineParser, MultiLineParser } from 'patternSingleLine';
import { ParserCollection } from "./ParserCollection";
import { ReviewView, VIEW_TYPE_REVIEW } from './review';
import { ClozeParser } from 'patternCloze';

export default class AOSRPlugin extends Plugin {
	settings: AOSRSettings;

	async onload() {
		await this.loadSettings();
		this.registerView(VIEW_TYPE_REVIEW, (leaf) => new ReviewView(leaf));
		this.addRibbonIcon('dice', 'Review', (evt: MouseEvent) => {
			app.workspace.detachLeavesOfType(VIEW_TYPE_REVIEW)
			let leaf = app.workspace.getLeaf(true)
			leaf.open(new ReviewView(leaf));
			// console.log(cyrb53("abcdef", 0, 32))
		});
		this.addSettingTab(new AOSRSettingTab(this.app, this));
		this.registerAosrParser()
	}

	registerAosrParser() {
		const parserCol = ParserCollection.getInstance();
		parserCol.registerParser(new SingleLineParser);
		parserCol.registerParser(new MultiLineParser);
		parserCol.registerParser(new ClozeParser)
	}

	onunload() {
		
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
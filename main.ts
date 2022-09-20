import { addIcon, Plugin } from 'obsidian';
import { ClozeParser } from 'patternCloze';
import { MultiLineParser, SingleLineParser } from 'patternLine';
import { AOSRSettingTab, setGlobalSettings, GlobalSettings } from 'setting';
import { ParserCollection } from "./ParserCollection";
import { ReviewView, VIEW_TYPE_REVIEW } from './view';

export default class AOSRPlugin extends Plugin {

	async onload() {
		await this.loadSettings();
		this.registerView(VIEW_TYPE_REVIEW, (leaf) => new ReviewView(leaf));
		addIcon("flashcards", `
		<path d="M 6.56 26.72 L 44.504 9.026 C 47.786 7.496 51.688 8.916 53.218 12.198 L 58.634 23.812 L 87.211 23.812 C 90.832 23.812 93.768 26.748 93.768 30.369 L 93.768 85.564 C 93.768 89.185 90.832 92.121 87.211 92.121 L 45.344 92.121 C 42.213 92.121 39.594 89.926 38.943 86.991 L 35.429 88.629 C 32.147 90.159 28.245 88.739 26.715 85.457 L 3.388 35.434 C 1.858 32.152 3.278 28.25 6.56 26.72 Z M 49.168 14.22 C 48.491 12.768 46.766 12.14 45.314 12.817 L 8.944 29.777 C 7.492 30.454 6.865 32.179 7.542 33.631 L 30.766 83.436 C 31.443 84.888 33.168 85.516 34.62 84.838 L 38.787 82.895 L 38.787 30.369 C 38.787 26.748 41.723 23.812 45.344 23.812 L 53.641 23.812 L 49.168 14.22 Z M 43.313 30.49 L 43.313 85.444 C 43.313 87.046 44.611 88.344 46.213 88.344 L 86.343 88.344 C 87.945 88.344 89.243 87.046 89.243 85.444 L 89.243 30.49 C 89.243 28.888 87.945 27.59 86.343 27.59 L 46.213 27.59 C 44.611 27.59 43.313 28.888 43.313 30.49 Z" fill="currentColor" stroke="currentColor"/>
	    `
		)
		this.addRibbonIcon('flashcards', 'Review', (evt: MouseEvent) => {
			app.workspace.detachLeavesOfType(VIEW_TYPE_REVIEW)
			let activeFile = app.workspace.getActiveFile()
			let newView = false
			if (activeFile) {
				newView = true
			}
			let leaf = app.workspace.getLeaf(newView)
			leaf.open(new ReviewView(leaf));
		});
		this.addSettingTab(new AOSRSettingTab(this.app, this));
		this.registerAosrParser()
	}

	registerAosrParser() {
		const parserCol = ParserCollection.getInstance();
		parserCol.registerParser(new SingleLineParser());
		parserCol.registerParser(new MultiLineParser);
		parserCol.registerParser(new ClozeParser)
	}

	onunload() {
		app.workspace.detachLeavesOfType(VIEW_TYPE_REVIEW)
	}

	async loadSettings() {
		setGlobalSettings(await this.loadData())
	}

	async saveSettings() {
		await this.saveData(GlobalSettings);
	}
}
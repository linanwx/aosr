import { AosrAPI } from 'api';
import { NewCardSearch } from 'cardSearch';
import { handlerDeckCode } from 'deck';
import { initLanguage } from 'language';
import { debounce } from 'lodash';
import { EventRef, MarkdownView, Notice, Plugin, TFile, addIcon } from 'obsidian';
import { ClozeParser } from 'patternCloze';
import { MultiLineParser, SingleLineParser } from 'patternLine';
import { AOSRSettingTab, GlobalSettings, setGlobalSettings } from 'setting';
import { emojiTagPlugin } from 'tag';
import yaml from "yaml";
import { ParserCollection } from "./ParserCollection";
import { ReviewView, VIEW_TYPE_REVIEW } from './view';



class AosrWriterHelper {
	cardCount: number = 0
	patternCount: number = 0
	filePath: string = ""
	event1: EventRef
	event2: EventRef
	checkDebounced = debounce((file: TFile, text: string) => {
		this.check(file, text);
	}, 500);

	unregister() {
		app.workspace.offref(this.event1)
		app.workspace.offref(this.event2)
	}

	constructor() {
		this.event1 = app.workspace.on("active-leaf-change", async (leaf) => {
			let view = app.workspace.getActiveViewOfType(MarkdownView)
			if (!view) {
				return
			}
			this.checkDebounced(view.file, view.editor.getValue())
		})
		this.event2 = app.workspace.on("editor-change", async (editor, view) => {
			if (!view || !view.file) {
				return;
			}
			this.checkDebounced(view.file, editor.getValue())
		});
	}

	private async check(file: TFile, text: string) {
		let search = NewCardSearch()
		let result = await search.search(file, text)
		let newcardcount = result.AllCard.length
		let newpatterncount = 0
		result.AllCard.forEach(element => {
			newpatterncount += element.patterns.length
		});

		if (file.path == this.filePath) {
			if (newcardcount !== this.cardCount) {
				let change = newcardcount - this.cardCount;
				let symbol = change > 0 ? "+" : "-";
				new Notice(`Card ${symbol}${Math.abs(change)}`);
			}
			if (newpatterncount !== this.patternCount) {
				let change = newpatterncount - this.patternCount;
				let symbol = change > 0 ? "+" : "-";
				new Notice(`Pattern ${symbol}${Math.abs(change)}`);
			}
		}
		this.cardCount = newcardcount
		this.patternCount = newpatterncount
		this.filePath = file.path
	}
}

function extractPrefix(str: string): string {
	const regex = /(#\w+\/\w+)/;
	const match = str.match(regex);

	if (match && match.length > 0) {
		return match[0];
	}

	return '';
}

export default class AOSRPlugin extends Plugin {
	public api: AosrAPI
	writerHelper: AosrWriterHelper
	async onload() {
		this.registerEditorExtension(emojiTagPlugin)
		await this.loadSettings();
		initLanguage()
		this.registerView(VIEW_TYPE_REVIEW, (leaf) => new ReviewView(leaf));
		addIcon("flashcards", `
		<path d="M 6.56 26.72 L 44.504 9.026 C 47.786 7.496 51.688 8.916 53.218 12.198 L 58.634 23.812 L 87.211 23.812 C 90.832 23.812 93.768 26.748 93.768 30.369 L 93.768 85.564 C 93.768 89.185 90.832 92.121 87.211 92.121 L 45.344 92.121 C 42.213 92.121 39.594 89.926 38.943 86.991 L 35.429 88.629 C 32.147 90.159 28.245 88.739 26.715 85.457 L 3.388 35.434 C 1.858 32.152 3.278 28.25 6.56 26.72 Z M 49.168 14.22 C 48.491 12.768 46.766 12.14 45.314 12.817 L 8.944 29.777 C 7.492 30.454 6.865 32.179 7.542 33.631 L 30.766 83.436 C 31.443 84.888 33.168 85.516 34.62 84.838 L 38.787 82.895 L 38.787 30.369 C 38.787 26.748 41.723 23.812 45.344 23.812 L 53.641 23.812 L 49.168 14.22 Z M 43.313 30.49 L 43.313 85.444 C 43.313 87.046 44.611 88.344 46.213 88.344 L 86.343 88.344 C 87.945 88.344 89.243 87.046 89.243 85.444 L 89.243 30.49 C 89.243 28.888 87.945 27.59 86.343 27.59 L 46.213 27.59 C 44.611 27.59 43.313 28.888 43.313 30.49 Z" fill="currentColor" stroke="currentColor"/>
	    `
		)
		this.addRibbonIcon('flashcards', 'Aosr', async () => {
			let find = false
			this.app.workspace.iterateAllLeaves((leaf) => {
				if (leaf.view.getViewType() == VIEW_TYPE_REVIEW) {
					find = true
					app.workspace.revealLeaf(leaf)
				}
			})
			if (find) {
				return
			}
			let leaf = this.app.workspace.getLeaf(false)
			if (leaf.view.getViewType() != 'empty') {
				leaf = this.app.workspace.getLeaf(true)
			}
			await leaf.setViewState({
				type: VIEW_TYPE_REVIEW,
				active: true,
			})
			app.workspace.revealLeaf(leaf)
		});
		this.addSettingTab(new AOSRSettingTab(this.app, this));
		this.registerAosrParser()
		this.api = new AosrAPI
		this.writerHelper = new AosrWriterHelper()
		this.registerMarkdownCodeBlockProcessor("AOSRDATA", (source, el, ctx) => {
			let cardID = ""
			try {
				const parsedData = yaml.parse(source);
				const scheduleKeys = Object.keys(parsedData.cardSchedule.schedules);

				if (scheduleKeys.length > 0) {
					cardID = extractPrefix(scheduleKeys[0]);
				}
			} catch (error) {
				console.log(error)
			}

			el.createSpan({ "text": `Aosr data for card ${cardID}. Please do not edit.`, "cls": "cm-comment" })
		});
		this.registerMarkdownCodeBlockProcessor("aosr-deck-config", handlerDeckCode)
	}

	registerAosrParser() {
		const parserCol = ParserCollection.getInstance();
		parserCol.registerParser(new SingleLineParser());
		parserCol.registerParser(new MultiLineParser);
		parserCol.registerParser(new ClozeParser)
	}

	onunload() {
		app.workspace.detachLeavesOfType(VIEW_TYPE_REVIEW)
		const parserCol = ParserCollection.getInstance();
		parserCol.clean()
		this.writerHelper.unregister()
	}

	async loadSettings() {
		setGlobalSettings(await this.loadData())
	}

	async saveSettings() {
		await this.saveData(GlobalSettings);
	}
}
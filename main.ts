import { TFile, App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting, MarkdownPostProcessorContext, MarkdownRenderer, MarkdownRenderChild, MarkdownEditView, ItemView, WorkspaceLeaf, Vault, MarkdownPreviewRenderer, MarkdownPreviewView } from 'obsidian';
import {VIEW_TYPE_REVIEW} from './review'
import {ReviewView} from "./review"
import {ParserCollection} from "./card"
import {hammingWeight, hammingDistance, simhash} from 'string-similarity-algorithm'
import similarity from 'string-similarity-algorithm'
import { renderMarkdown } from 'markdown';
import { SingleLineMethod } from 'singleLineStyle';
import { AOSRSettings, AOSRSettingTab, DEFAULT_SETTINGS } from 'setting';

// Remember to rename these classes and interfaces!




class ReviewViewTest extends ItemView {
	getViewType(): string {
		return VIEW_TYPE_REVIEW
	}
	getDisplayText(): string {
		return "ReviewViewTest"
	}
	onload(): void {
		let node = this.containerEl.children[1]
		let div = node.createDiv()
		renderMarkdown("#test ![[test1.mp3]]", div, "", this)
	}
}

export default class AOSRPlugin extends Plugin {
	settings: AOSRSettings;

	async onload() {
		await this.loadSettings();

		this.registerView(VIEW_TYPE_REVIEW, (leaf) => new ReviewView(leaf));
		const ribbonIconEl = this.addRibbonIcon('dice', 'Review', (evt: MouseEvent) => {
			app.workspace.detachLeavesOfType(VIEW_TYPE_REVIEW)
			let leaf = app.workspace.getLeaf()
			leaf.open(new ReviewView(leaf));
		});
		// Perform additional things with the ribbon
		// ribbonIconEl.addClass('my-plugin-ribbon-class');

		// This adds a status bar item to the bottom of the app. Does not work on mobile apps.
		// const statusBarItemEl = this.addStatusBarItem();
		// statusBarItemEl.setText('Status Bar Text');

		// This adds a simple command that can be triggered anywhere
		// this.addCommand({
		// 	id: 'open-sample-modal-simple',
		// 	name: 'Open sample modal (simple)',
		// 	callback: () => {
		// 		new SampleModal(this.app).open();
		// 	}
		// });
		// This adds an editor command that can perform some operation on the current editor instance
		// this.addCommand({
		// 	id: 'sample-editor-command',
		// 	name: 'Sample editor command',
		// 	editorCallback: (editor: Editor, view: MarkdownView) => {
		// 		console.log(editor.getSelection());
		// 		editor.replaceSelection('Sample Editor Command');
		// 	}
		// });
		// This adds a complex command that can check whether the current state of the app allows execution of the command
		// this.addCommand({
		// 	id: 'open-sample-modal-complex',
		// 	name: 'Open sample modal (complex)',
		// 	checkCallback: (checking: boolean) => {
		// 		// Conditions to check
		// 		const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
		// 		if (markdownView) {
		// 			// If checking is true, we're simply "checking" if the command can be run.
		// 			// If checking is false, then we want to actually perform the operation.
		// 			if (!checking) {
		// 				new SampleModal(this.app).open();
		// 			}

		// 			// This command will only show up in Command Palette when the check function returns true
		// 			return true;
		// 		}
		// 	}
		// });

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new AOSRSettingTab(this.app, this));

		// If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// Using this function will automatically remove the event listener when this plugin is disabled.
		// this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
		// 	console.log('click', evt);
		// });

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		// this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));

		// this.registerMarkdownCodeBlockProcessor(
		// 	"aosr",
		// 	this.aosrPanelBlockProcessor
		// )

		this.registerAosrParser()
	}

	registerAosrParser() {
		const parserCol = ParserCollection.getInstance();
		parserCol.registerParser(new SingleLineMethod);
	}

	onunload() {
		
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	// async aosrPanelBlockProcessor(source: string, el: HTMLElement, ctx: MarkdownPostProcessorContext): Promise<any> {
	// 	let div = el.createDiv()
	// 	ctx.addChild(new ReviewView(div))
	// }
}





// 解析的结果
// class parseResult {
// 	// 正面
// 	front: string
// 	// 标记
// 	mark: string
// 	// 反面
// 	back: string
// 	// 偏移量
// 	offset: number
// 	// 解析类型
// 	type: string
// }
import AOSRPlugin, { log } from "main";
import { App, Notice, PluginSettingTab, Setting } from "obsidian";
import i18n from 'i18next';

export interface AOSRSettings {
    DefaultEase: number;
    EasyBonus: number;
    HardBonus: number;
    WordTTSURL: string;
    WaitingTimeoutBase: number;
    HideContext: boolean;
    OneLineDelimeter: string;
    OneLineReversedDelimeter: string;
    MultiLineDelimeter: string;
    AosrDbPath: string;
    ExcludeWorkingPathesPattern: string;
    ShowHardCardsArrangement: boolean;
	UseNewLineAsSplitter: boolean;
}

export const AOSR_DEFAULT_SETTINGS: AOSRSettings = {
    DefaultEase: 250,
    EasyBonus: 1,
    HardBonus: 1,
    WordTTSURL: "",
    WaitingTimeoutBase: 7,
    HideContext: false,
    OneLineDelimeter: "::",
    OneLineReversedDelimeter: ":::",
    MultiLineDelimeter: "?",
    AosrDbPath: ".obsidian/aosr.db",
    ExcludeWorkingPathesPattern: "",
    ShowHardCardsArrangement: false,
	UseNewLineAsSplitter: false
}

// i18n.t('someKey');

// 排除规则一行一条。Obsidian 的路径相对 vault 根目录、不带开头的 /、分隔符是 /，
// 所以顺手去掉首尾空白和开头的 / 或 ./，并把 Windows 风格的 \ 换成 /
export function parseExcludePatterns(setting: string): string[] {
    return setting.split("\n")
        .map((p) => p.trim().replace(/\\/g, "/").replace(/^\.?\/+/, ""))
        .filter((p) => p.length > 0)
}

export let GlobalSettings: AOSRSettings

export function setGlobalSettings(s: AOSRSettings) {
    let settings = Object.assign({}, AOSR_DEFAULT_SETTINGS, s);
    // 1.1.6 的默认值把换行写成了字面量 "\\n"，设置框里显示成一行，用户照着在后面接 "\\nXXX" 就整串失效（#61）
    settings.ExcludeWorkingPathesPattern = settings.ExcludeWorkingPathesPattern.replace(/\\n/g, "\n");
    log(() => ["GlobalSettings", settings]);
    GlobalSettings = settings
}

export class AOSRSettingTab extends PluginSettingTab {
    plugin: AOSRPlugin;

    constructor(app: App, plugin: AOSRPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;
        containerEl.empty();
        containerEl.createEl('h2', { text: i18n.t('SettingTextAosrSettings') || "" });

        new Setting(containerEl)
            .setName(i18n.t('SettingTextInitEase') || "")
            .setDesc(i18n.t('SettingTextInitEaseDesc') || "")
            .addText(text => text
                .setPlaceholder('100-500')
                .setValue(GlobalSettings.DefaultEase.toString())
                .onChange(async (value) => {
                    GlobalSettings.DefaultEase = Number(value);
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName(i18n.t('SettingTextEasyChoice') || "")
            .setDesc(i18n.t('SettingTextEaseChoiceDesc') || "")
            .addText(text => text
                .setPlaceholder('0-10')
                .setValue(GlobalSettings.EasyBonus.toString())
                .onChange(async (value) => {
                    GlobalSettings.EasyBonus = Number(value);
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName(i18n.t('SettingTextHardChoice') || "")
            .setDesc(i18n.t('SettingTextHardChoiceDesc') || "")
            .addText(text => text
                .setPlaceholder('0-10')
                .setValue(GlobalSettings.HardBonus.toString())
                .onChange(async (value) => {
                    GlobalSettings.HardBonus = Number(value);
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName(i18n.t('SettingTextWaitting') || "")
            .setDesc(i18n.t('SettingTextWaittingDesc') || "")
            .addSlider(slider => slider
                .setDynamicTooltip()
                .setLimits(0, 15, 0.5)
                .setValue(GlobalSettings.WaitingTimeoutBase)
                .onChange(async (value) => {
                    GlobalSettings.WaitingTimeoutBase = Number(value)
                    await this.plugin.saveSettings();
                })
            )

        new Setting(containerEl)
            .setName(i18n.t('SettingHideContext') || '')
            .addToggle(toggle => toggle
                .setValue(GlobalSettings.HideContext)
                .onChange(async (value) => {
                    GlobalSettings.HideContext = value
                    await this.plugin.saveSettings();
                })
            )

        new Setting(containerEl)
            .setName('Word TTS [experiment]')
            .setDesc('Input a TTS URL to pronounce the single word in the card. Use %s to represent word.')
            .addText(text => text
                .setPlaceholder('http://word.tts/%s')
                .setValue(GlobalSettings.WordTTSURL)
                .onChange(async (value) => {
                    GlobalSettings.WordTTSURL = value
                    await this.plugin.saveSettings();
                }))


        new Setting(containerEl)
            .setName(i18n.t('SettingTextMigrateData') || "")
            .setDesc(i18n.t('SettingTextMigrateDataDesc') || "")
            .addButton(button => button
                .setButtonText(i18n.t('SettingTextMigrateData') || "")
                .onClick(async () => {
                    await this.plugin.migrateData();
                }
                ))

        new Setting(containerEl)
            .setName(i18n.t('SettingTextConvertID') || "")
            .setDesc(i18n.t('SettingTextConvertIDDesc') || "")
            .addButton(button => button
                .setButtonText(i18n.t('SettingTextConvertID') || "")
                .onClick(async () => {
                    await this.plugin.convertIDs();
                }
                ))

        new Setting(containerEl)
            .setName(i18n.t('SettingsOneLineDelimeter') || '')
            .setDesc(i18n.t('SettingsOneLineDelimeterDesc') || "")
            .addText(text => text
                .setPlaceholder('::')
                .setValue(GlobalSettings.OneLineDelimeter)
                .onChange(async (value) => {
                    if (value.length > 0 && !(/^\s*$/.test(value))) {
                        GlobalSettings.OneLineDelimeter = value
                        await this.plugin.saveSettings();
                    } else {
                        new Notice(i18n.t('SettingsOneLineDelimeterError') || "Cannot be empty or whitespace only.");
                    }
                }))

        new Setting(containerEl)
            .setName(i18n.t('SettingsOneLineReversedDelimeter') || '')
            .setDesc(i18n.t('SettingsOneLineReversedDelimeterDesc') || "")
            .addText(text => text
                .setPlaceholder('::')
                .setValue(GlobalSettings.OneLineReversedDelimeter)
                .onChange(async (value) => {
                    if (value.length > 0 && !(/^\s*$/.test(value))) {
                        GlobalSettings.OneLineReversedDelimeter = value
                        await this.plugin.saveSettings();
                    } else {
                        new Notice(i18n.t('SettingsOneLineReversedDelimeterError') || "Cannot be empty or whitespace only.");
                    }
                }))

        new Setting(containerEl)
            .setName(i18n.t('SettingsMultiLineDelimeter') || '')
            .setDesc(i18n.t('SettingsMultiLineDelimeterDesc') || "")
            .addText(text => text
                .setPlaceholder('?')
                .setValue(GlobalSettings.MultiLineDelimeter)
                .onChange(async (value) => {
                    if (value.length > 0 && !(/^\s*$/.test(value))) {
                        GlobalSettings.MultiLineDelimeter = value
                        await this.plugin.saveSettings();
                    } else {
                        new Notice(i18n.t('SettingsMultiLineDelimeterError') || "Cannot be empty or whitespace only.");
                    }
                }))

        new Setting(containerEl)
            .setName(i18n.t('SettingsDbPath') || '')
            .setDesc(i18n.t('SettingsDbPathDesc') || "")
            .addText(text => text
                .setPlaceholder('.obsidian/aosr.db')
                .setValue(GlobalSettings.AosrDbPath)
                .onChange(async (value) => {
                    if (value.length > 0 && !(/^\s*$/.test(value))) {
                        GlobalSettings.AosrDbPath = value;
                        await this.plugin.saveSettings();
                    } else {
                        new Notice(i18n.t('SettingsDbPathError') || "Cannot be empty or whitespace only.");
                    }
                }))
        new Setting(containerEl)
            .setName(i18n.t('SettingsExcludeDirectories') || '')
            .setDesc(i18n.t('SettingsExcludeDirectoriesDesc') || "")
            .addTextArea(text => {
                // 一行一条，默认两行高会把后面的规则藏起来
                text.inputEl.rows = 5
                return text
                    .setPlaceholder('Archive/\n**/Templates/**\nNotes/Todo.md')
                    .setValue(GlobalSettings.ExcludeWorkingPathesPattern)
                    .onChange(async (value) => {
                        GlobalSettings.ExcludeWorkingPathesPattern = value;
                        await this.plugin.saveSettings();
                    })
            })

        new Setting(containerEl)
            .setName(i18n.t('SettingsShowHardCardsArrangement') || '')
            .setDesc(i18n.t('SettingsShowHardCardsArrangementDesc') || "")
            .addToggle(toggle => toggle
                .setValue(GlobalSettings.ShowHardCardsArrangement)
                .onChange(async (value) => {
                    GlobalSettings.ShowHardCardsArrangement = value;
                    await this.plugin.saveSettings();
				}))

		new Setting(containerEl)
			.setName(i18n.t('SettingsNewLineAsSplitter') || '')
			.setDesc(i18n.t('SettingsNewLineAsSplitterDesc') || "")
			.addToggle(toggle => toggle
				.setValue(GlobalSettings.UseNewLineAsSplitter)
				.onChange(async (value) => {
					GlobalSettings.UseNewLineAsSplitter = value;
					await this.plugin.saveSettings();
				}))
	}
}

import AOSRPlugin from "main";
import { App, PluginSettingTab, Setting } from "obsidian";
import i18n from 'i18next';

export interface AOSRSettings {
    DefaultEase: number;
    EasyBonus: number;
    HardBonus: number;
    WordTTSURL: string;
    WaitingTimeoutBase: number;
}

const AOSR_DEFAULT_SETTINGS: AOSRSettings = {
    DefaultEase: 250,
    EasyBonus: 1,
    HardBonus: 1,
    WordTTSURL: "",
    WaitingTimeoutBase: 7,
}

// i18n.t('someKey');

export let GlobalSettings: AOSRSettings

export function setGlobalSettings(s: AOSRSettings) {
    let settings = Object.assign({}, AOSR_DEFAULT_SETTINGS, s);
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
            .setName('Word TTS [experiment]')
            .setDesc('Input a TTS URL to pronounce the single word in the card. Use %s to represent word.')
            .addText(text => text
                .setPlaceholder('http://word.tts/%s')
                .setValue(GlobalSettings.WordTTSURL)
                .onChange(async (value) => {
                    GlobalSettings.WordTTSURL = value
                    await this.plugin.saveSettings();
                }))
    }
}
import AOSRPlugin from "main";
import { App, PluginSettingTab, Setting } from "obsidian";

export interface AOSRSettings {
    DefaultEase: number;
    EasyBonus: number;
    HardBonus: number;
    WordTTSURL: string;
}

const AOSR_DEFAULT_SETTINGS: AOSRSettings = {
    DefaultEase: 250,
    EasyBonus: 2,
    HardBonus: 2,
    WordTTSURL: ""
}

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
        containerEl.createEl('h2', { text: 'Settings for my awesome plugin.' });

        new Setting(containerEl)
            .setName('Degree of initial ease')
            .setDesc('The review interval is doubled by ease /100')
            .addText(text => text
                .setPlaceholder('130-500')
                .setValue(GlobalSettings.DefaultEase.toString())
                .onChange(async (value) => {
                    GlobalSettings.DefaultEase = Number(value);
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('Reward of easy choice')
            .setDesc('An additional interval is added to the normal review interval')
            .addText(text => text
                .setPlaceholder('1-10')
                .setValue(GlobalSettings.EasyBonus.toString())
                .onChange(async (value) => {
                    GlobalSettings.EasyBonus = Number(value);
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('Reward of hard choice')
            .setDesc('An additional interval is reduced to the normal review interval')
            .addText(text => text
                .setPlaceholder('1-10')
                .setValue(GlobalSettings.HardBonus.toString())
                .onChange(async (value) => {
                    GlobalSettings.HardBonus = Number(value);
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('Word TTS')
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
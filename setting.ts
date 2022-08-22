import AOSRPlugin from "main";
import { App, PluginSettingTab, Setting } from "obsidian";

export interface AOSRSettings {
    DefaultEase: number;
    EasyBonus: number;
    HardBonus: number;
}

export const DEFAULT_SETTINGS: AOSRSettings = {
    DefaultEase: 250,
    EasyBonus: 3,
    HardBonus: 3,
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
            .setName('初始容易度')
            .setDesc('复习间隔按照容易度/100翻倍')
            .addText(text => text
                .setPlaceholder('130-500')
                .setValue(this.plugin.settings.DefaultEase.toString())
                .onChange(async (value) => {
                    this.plugin.settings.DefaultEase = Number(value);
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('简单奖励')
            .setDesc('比正常复习间隔额外增加间隔')
            .addText(text => text
                .setPlaceholder('1-10')
                .setValue(this.plugin.settings.EasyBonus.toString())
                .onChange(async (value) => {
                    this.plugin.settings.EasyBonus = Number(value);
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('困难惩罚')
            .setDesc('比正常复习间隔额外增加减少')
            .addText(text => text
                .setPlaceholder('1-10')
                .setValue(this.plugin.settings.HardBonus.toString())
                .onChange(async (value) => {
                    this.plugin.settings.HardBonus = Number(value);
                    await this.plugin.saveSettings();
                }));
    }
}
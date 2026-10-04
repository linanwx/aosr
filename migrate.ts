import { App, Modal, Setting, TFile } from "obsidian";
import i18n from 'i18next';
import { NewCardSearch } from "cardSearch";
import { DatabaseHelper } from "db";
import { getAppInstance } from "main";
import { convertOldIDs } from "cardHead";

export class MigrateModal extends Modal {
    div: HTMLDivElement;

    constructor(app: App) {
        super(app);
    }

    onOpen() {
        let { contentEl } = this;
        this.div = contentEl.createDiv()
        new Setting(contentEl)
            .addButton((btn) =>
                btn
                    .setButtonText(i18n.t('MigrateTextMigrate') || "")
                    .setCta()
                    .onClick(() => {
                        btn.setDisabled(true)
                        this.begin()
                        btn.setDisabled(false)
                    }));

        this.updateConsole(i18n.t('MigrateTextMigrateReady') || "")
        this.updateConsole(i18n.t('MigrateTextMigrateWarning') || "")
    }

    async begin() {
        try {
            await this.migrate()
            await this.cleanNote()
        } catch (error) {
            this.updateConsole(error)
        }

        this.updateConsole(i18n.t('MigrateTextMigrateEnd') || "")
    }

    async migrate() {
        // 提示用户开始读取卡片数量
        this.updateConsole(i18n.t('MigrateTextStart') || "")
        let search = NewCardSearch()
        let allcards = await search.search()
        // 提示用户读取到的卡片数量
        this.updateConsole(i18n.t('MigrateTextCardCount', { count: allcards.AllCard.length }) || "")
        // 读取到的卡片数量为0，直接返回
        if (allcards.AllCard.length == 0) {
            return
        }
        // 提示用户开始迁移
        this.updateConsole(i18n.t('MigrateTextStartMigrate') || "")
        // 获取数据库对象
        let db = DatabaseHelper.getInstance()
        // 对每个卡片，判断数据库中是否存在，如果不存在则插入
        let count = 0
        for (let index = 0; index < allcards.AllCard.length; index++) {
            const element = allcards.AllCard[index];
            if (db.query(element.ID) == null) {
                count++
                db.insertOrUpdate(element.ID, element.getSchedules())
            }
        }
        db.commit()
        // 提示用户迁移完成以及数量
        this.updateConsole(i18n.t('MigrateTextMigrateComplete', { count: count }) || "")
    }

    // 读取用户的每个笔记，然后清理笔记中的内容，再写回笔记
    async cleanNote() {
        // 提示用户开始清理笔记内容
        this.updateConsole(i18n.t('MigrateTextStartClean') || "")
        let cleanDataCommentReg = /%%[^\%\^]+?%%\n\^[\w]+(\n)?/gm
        let cleanLinkRefReg = /\[\[\#\^[\w|\d]+\|?.+\]\]/gm
        let countDataComment = 0
        let countLinkRef = 0
        let files = getAppInstance().vault.getMarkdownFiles()
        for (let i = 0; i < files.length; i++) {
            let file = files[i]
            let fileText = await getAppInstance().vault.read(file)
            let newFileText = fileText.replace(cleanDataCommentReg, () => {
                countDataComment++
                return ""
            })
            // 处理每行内容
            let lines = newFileText.split("\n")
            // 每行判断是否#Q开头，如果是，使用正则清理
            for (let index = 0; index < lines.length; index++) {
                const element = lines[index];
                if (element.startsWith("#Q")) {
                    lines[index] = element.replace(cleanLinkRefReg, () => {
                        countLinkRef++
                        return ""
                    })
                }
            }
            newFileText = lines.join("\n")
            if (newFileText != fileText) {
                await getAppInstance().vault.modify(file, newFileText)
            }
        }
        // 提示用户清理完成以及数量
        this.updateConsole(i18n.t('MigrateTextCleanComplete', { countDataComment: countDataComment, countLinkRef: countLinkRef }) || "")
    }

    // 将日志显示到用户界面
    updateConsole(text: string) {
        let { contentEl } = this;
        this.div.createEl('p', { text: text });
    }

    onClose() {
        let { contentEl } = this;
        contentEl.empty();
    }
}



// 旧版本的卡片 ID 是标签 #AOSR/xxx，会被 Obsidian 收进标签面板；新版本写成注释 %%AOSR/xxx%%。
// 复习数据以 #AOSR/xxx 规范写法为键（见 TagInfo.Canonical），转换只改笔记原文，不动数据库。
export class ConvertIDModal extends Modal {
    div: HTMLDivElement;

    constructor(app: App) {
        super(app);
    }

    async onOpen() {
        let { contentEl } = this;
        this.div = contentEl.createDiv()
        this.updateConsole(i18n.t('ConvertIDTextWarning') || "")
        this.updateConsole(i18n.t('ConvertIDTextScan') || "")
        let { files, count } = await this.scan()
        if (count == 0) {
            this.updateConsole(i18n.t('ConvertIDTextNone') || "")
            return
        }
        this.updateConsole(i18n.t('ConvertIDTextFound', { files: files.length, count: count }) || "")
        new Setting(contentEl)
            .addButton((btn) =>
                btn
                    .setButtonText(i18n.t('ConvertIDTextConvert') || "")
                    .setCta()
                    .onClick(async () => {
                        btn.setDisabled(true)
                        try {
                            await this.convert(files)
                        } catch (error) {
                            this.updateConsole(String(error))
                        }
                    }));
    }

    // 找出含旧格式 ID 的笔记，只读不写
    async scan(): Promise<{ files: TFile[], count: number }> {
        let files: TFile[] = []
        let count = 0
        for (let file of getAppInstance().vault.getMarkdownFiles()) {
            let fileText = await getAppInstance().vault.read(file)
            let result = convertOldIDs(fileText)
            if (result.count > 0) {
                files.push(file)
                count += result.count
            }
        }
        return { files: files, count: count }
    }

    async convert(files: TFile[]) {
        let changedFiles = 0
        let count = 0
        for (let file of files) {
            let fileText = await getAppInstance().vault.read(file)
            let result = convertOldIDs(fileText)
            if (result.count > 0) {
                changedFiles++
                count += result.count
                await getAppInstance().vault.modify(file, result.text)
            }
        }
        this.updateConsole(i18n.t('ConvertIDTextComplete', { files: changedFiles, count: count }) || "")
    }

    updateConsole(text: string) {
        this.div.createEl('p', { text: text });
    }

    onClose() {
        let { contentEl } = this;
        contentEl.empty();
    }
}

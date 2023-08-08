import { App, Modal, Setting } from "obsidian";
import i18n from 'i18next';
import { NewCardSearch } from "cardSearch";
import { DatabaseHelper } from "db";

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
        let files = app.vault.getMarkdownFiles()
        for (let i = 0; i < files.length; i++) {
            let file = files[i]
            let fileText = await app.vault.read(file)
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
                await app.vault.modify(file, newFileText)
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



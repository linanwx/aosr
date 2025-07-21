import { Low } from 'lowdb';
import { log, getAppInstance } from 'main';
import { App, Notice, Vault } from 'obsidian';
import path from 'path';
import { CardSchedule, scheduleData } from 'schedule';
import { GlobalSettings } from 'setting';

// 存储文档的数据结构
export interface CardDoc {
    ID: string;
    CardSchedules: scheduleData[];
}

class ObsidianAdapter {
    private basePath: string;
    private fileName: string;

    constructor(basePath: string, fileName: string) {
        this.basePath = basePath;
        this.fileName = fileName;
    }

    async read() {
        try {
            const filePath = this.basePath + this.fileName;
            log(() => `Reading from file: ${filePath}`);
            if (await getAppInstance().vault.adapter.exists(filePath)) {
                const data = await getAppInstance().vault.adapter.read(filePath);
                return JSON.parse(data);
            }
            return { docs: [] } as Data;
        } catch (error) {
            new Notice(`[Aosr] read error: ${error}`);
        }
    }


    async write(data: any) {
        const filePath = this.basePath + this.fileName;
        const content = JSON.stringify(data);
        if (!await getAppInstance().vault.adapter.exists(this.basePath)) {
            const noTrailingSeparatorPath = this.basePath.endsWith(path.sep)
                ? this.basePath.substring(0, this.basePath.length - 1)
                : this.basePath;
            await getAppInstance().vault.adapter.mkdir(
                noTrailingSeparatorPath
            );
        }
        await getAppInstance().vault.adapter.write(filePath, content);
    }
}

type Data = {
    docs: CardDoc[];
}

export class DatabaseHelper {
    private static instance: DatabaseHelper;
    private db: Low<Data>;

    public static getInstance(): DatabaseHelper {
        if (!DatabaseHelper.instance) {
            DatabaseHelper.instance = new DatabaseHelper(GlobalSettings.AosrDbPath);
        }
        return DatabaseHelper.instance;
    }

    constructor(dbPath: string) {
        const adapter = new ObsidianAdapter(
            path.dirname(dbPath) + path.sep,
            path.basename(dbPath)
        );
        this.db = new Low(adapter, {});
        this.init();
    }

    private async init() {
        await this.db.read();
        if (!this.db.data.docs) {
            this.db.data.docs = [];
            await this.db.write();
        }
    }

    public insertOrUpdate(cardID: string, cardSchedule: CardSchedule) {
        let doc = this.db.data.docs.find((pattern) => pattern.ID === cardID);
        if (doc) {
            doc.CardSchedules = cardSchedule.cardScheduleToPatternData();
        } else {
            this.db.data.docs.push({ ID: cardID, CardSchedules: cardSchedule.cardScheduleToPatternData() });
        }
    }

    public query(cardID: string): CardDoc | null {
        if (!this.db.data.docs) {
            return null;
        }
        return this.db.data.docs.find((pattern) => pattern.ID === cardID) || null;
    }

    public async commit() {
        await this.db.write();
    }
}

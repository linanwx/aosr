import { Low } from 'lowdb';
import { Notice } from 'obsidian';
import { CardSchedule, scheduleData } from 'schedule';

export const DBNAME = 'aosr.db'
export const DBPATH = '.obsidian/'

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
            if (await app.vault.adapter.exists(filePath)) {
                const data = await app.vault.adapter.read(filePath);
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
        await app.vault.adapter.write(filePath, content);
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
            DatabaseHelper.instance = new DatabaseHelper(DBNAME);
        }
        return DatabaseHelper.instance;
    }

    constructor(dbPath: string) {
        const adapter = new ObsidianAdapter(DBPATH, dbPath);
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

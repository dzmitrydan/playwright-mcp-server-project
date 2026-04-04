import sql from 'mssql';
import * as fs from 'fs';
import * as path from 'path';

export class SqlHelper {
    private pool: sql.ConnectionPool | null = null;
    private envName: string;
    private config: any;

    constructor(envName: string) {
        this.envName = envName.toLowerCase();

        // Формируем путь к файлу конфигурации в зависимости от среды
        const configFileName = `env.${this.envName}.json`;
        const configPath = path.resolve(`./config/${configFileName}`);

        if (!fs.existsSync(configPath)) {
            throw new Error(`DB config file not found for env "${this.envName}": ${configPath}`);
        }

        const fileContent = fs.readFileSync(configPath, 'utf8');
        const json = JSON.parse(fileContent);

        if (!json.db) {
            throw new Error(`DB configuration missing in file: ${configPath}`);
        }

        this.config = json.db;
    }

    async connect() {
        if (this.pool) return this.pool;

        this.pool = new sql.ConnectionPool({
            ...this.config,
            options: {
                encrypt: false,
                trustServerCertificate: true
            }
        });

        await this.pool.connect();
        return this.pool;
    }

    async runQuery(query: string): Promise<string> {
        try {
            const pool = await this.connect();
            const result = await pool.request().query(query);
            return JSON.stringify(result.recordset);
        } catch (err: any) {
            return err.message;
        }
    }

    async close() {
        if (this.pool) {
            await this.pool.close();
            this.pool = null;
        }
    }
}
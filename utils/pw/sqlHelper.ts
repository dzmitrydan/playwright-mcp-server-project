import sql from 'mssql';

export class SqlHelper {
    private pool: sql.ConnectionPool | null = null;

    async connect() {
        if (this.pool) return this.pool;

        this.pool = new sql.ConnectionPool({
            user: 'sa',
            password: 'Strong@Passw0rd',
            server: 'localhost',
            port: 1433,
            database: 'TestDB',
            options: { encrypt: false, trustServerCertificate: true },
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
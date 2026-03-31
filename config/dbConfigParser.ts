import * as fs from 'fs';
import * as path from 'path';

const configPath = path.resolve(__dirname, './dbConfig.json');

const config = JSON.parse(
    fs.readFileSync(configPath, 'utf8')
);

export const dbConfigParser = {
    ...config.db,
    options: {
        encrypt: false,
        trustServerCertificate: true
    }
};
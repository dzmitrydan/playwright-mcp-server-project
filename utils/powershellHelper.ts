import { spawn } from 'child_process';
import { test } from '@playwright/test';

import * as XLSX from 'xlsx';

export interface CommandCheck {
    command: string;
    expectedOutput: string;
}

export class PowerShellHelper {

    async runCommand(command: string): Promise<string> {
        return new Promise((resolve, reject) => {
            const process = spawn('pwsh', ['-Command', command]);

            let output = '';

            process.stdout.on('data', (data) => {
                output += data.toString();
            });

            process.stderr.on('data', (data) => {
                output += data.toString();
            });

            process.on('close', async () => {
                const result = output.trim();

                // attach output to Playwright report
                await test.info().attach(`Command: ${command}`, {
                    body: result,
                    contentType: 'text/plain',
                });

                resolve(result);
            });

            process.on('error', (err) => {
                reject(err);
            });
        });
    }



    async readCommands(filePath: string, sheetName?: string): Promise<CommandCheck[]> {
        const workbook = XLSX.readFile(filePath);
        const sheet = sheetName ? workbook.Sheets[sheetName] : workbook.Sheets[workbook.SheetNames[0]];

        const data = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as Array<Array<string>>;
        const result: CommandCheck[] = [];

        // Предполагаем, что первая колонка — команда, вторая — ожидаемый текст
        for (const row of data) {
            if (row[0] && row[1]) {
                result.push({
                    command: row[0].toString(),
                    expectedOutput: row[1].toString()
                });
            }
        }

        return result;
    }
}
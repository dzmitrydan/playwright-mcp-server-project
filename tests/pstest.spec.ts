import * as XLSX from 'xlsx';
import { test, expect } from '@playwright/test';
import { PowershellHelper } from '../utils/pw/powershellHelper';
import { SqlHelper } from '../utils/pw/sqlHelper';
import { OutputParser } from '../utils/pw/outputParser';

const ps = new PowershellHelper();
const sqlHelper = new SqlHelper();

const workbook = XLSX.readFile('./data/commands.xlsx');
const sheetsMap: Record<string, any[]> = {};

for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[];

    sheetsMap[sheetName] = data.slice(1).map(row => ({
        action: row[0]?.toString().toLowerCase().trim(),
        command: row[1]?.toString().trim(),
        expected: row[2]?.toString().trim(),
        checkType: row[3]?.toString().toLowerCase().trim(),
    }));
}

for (const sheetName of Object.keys(sheetsMap)) {
    test(`Excel Sheet: ${sheetName}`, async ({}, testInfo) => {

        for (const cmd of sheetsMap[sheetName]) {
            await test.step(`Command: ${cmd.command}`, async () => {
                let output = '';

                if (cmd.action === 'powershell') {
                    output = await ps.runCommand(cmd.command);
                }

                if (cmd.action === 'sql') {
                    output = await sqlHelper.runQuery(cmd.command);
                }

                const passed = cmd.expected
                    ? OutputParser.validate(output, cmd.expected, cmd.checkType)
                    : true;

                console.log(`[${sheetName}] ${cmd.action} -> ${cmd.command}`);
                console.log(`Output: ${output}`);
                console.log(`Passed: ${passed}`);

                await testInfo.attach(`Sheet: ${sheetName} | Command: ${cmd.command}`, {
                    body:
                        `Sheet: ${sheetName}
Action: ${cmd.action}
Command: ${cmd.command}
Output: ${output}
Expected: ${cmd.expected}
CheckType: ${cmd.checkType}
Passed: ${passed}`,
                    contentType: 'text/plain'
                });

                expect(passed).toBeTruthy();
            });
        }
    });
}

test.afterAll(async () => {
    await sqlHelper.close();
});
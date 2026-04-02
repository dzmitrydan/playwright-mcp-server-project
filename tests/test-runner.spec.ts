import * as XLSX from 'xlsx';
import { expect, test } from '@playwright/test';
import { PowershellHelper } from '../utils/pw/powershellHelper';
import { SqlHelper } from '../utils/pw/sqlHelper';
import { OutputChecker } from '../utils/pw/outputChecker';
import { VariableHelper } from '../utils/pw/variableHelper';
import WebHelper from '../utils/pw/webHelper';

import path from 'path';
import fs from 'fs';

// ================= CONFIG =================
test.use({
    screenshot: 'off',
    video: 'off',
    trace: 'off'
});

test.describe.configure({ mode: 'serial' });

// ================= HELPERS =================
const ps = new PowershellHelper();
const sqlHelper = new SqlHelper();

const resolver = new VariableHelper([
    './config/dbConfig.json',
    './config/sqlVariables.json',
    './config/powershellVariables.json'
]);

// ================= ENV =================
const suite = process.env.TEST_SUITE || 'demo';
const excelFile = path.resolve(process.cwd(), `data/${suite}.xlsx`);

console.log('==============================');
console.log('TEST_SUITE =', suite);
console.log('EXCEL FILE =', excelFile);
console.log('==============================');

// ================= VALIDATION =================
if (!fs.existsSync(excelFile)) {
    throw new Error(`Excel file not found: ${excelFile}`);
}

// ================= LOAD EXCEL =================
const workbook = XLSX.readFile(excelFile);
const sheetsMap: Record<string, any[]> = {};

for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[];

    sheetsMap[sheetName] = data.slice(1).map(row => ({
        action: row[0]?.toString().trim(),
        command: row[1]?.toString().trim(),
        value1: row[2]?.toString().trim(),
        value2: row[3]?.toString().trim(),
        expected: row[4]?.toString().trim(),
        check: row[5]?.toString().trim(),
        value3: row[6]?.toString().trim(), // FIX
    }));
}

// ================= TEST PER SHEET =================
for (const sheetName of Object.keys(sheetsMap)) {

    test(`Sheet: ${sheetName}`, async ({ page }, testInfo) => {

        const web = new WebHelper(page);

        for (const cmd of sheetsMap[sheetName]) {

            await test.step(`${cmd.action} -> ${cmd.command}`, async () => {

                let output = '';
                let passed = true;

                const command = resolver.resolve(cmd.command || '');
                const value1 = resolver.resolve(cmd.value1 || '');
                const value2 = resolver.resolve(cmd.value2 || '');
                const expected = resolver.resolve(cmd.expected || '');

                switch ((cmd.action || '').toLowerCase()) {

                    case 'powershell':
                        if (command.toLowerCase() === 'runps1') {
                            output = await ps.runPS1(value1, value2);
                        } else {
                            output = await ps.runCommand(command);
                        }
                        break;

                    case 'sql':
                        output = await sqlHelper.runQuery(command);
                        break;

                    case 'web':
                        switch (command) {

                            case 'openPage':
                                output = await web.openPage(value1);
                                break;

                            case 'inputText':
                                output = await web.inputText(value1, value2);
                                break;

                            case 'clickButton':
                                output = await web.clickButton(value1);
                                break;

                            case 'webGetUrl':
                                output = await web.webGetUrl();
                                break;

                            case 'webElementVisible':
                                output = await web.webElementVisible(value1);
                                break;

                            default:
                                output = `Unknown web command: ${command}`;
                        }
                        break;

                    default:
                        output = `Unknown action: ${cmd.action}`;
                }

                // ===== VALIDATION =====
                if (expected) {
                    passed = OutputChecker.validate(
                        output,
                        expected,
                        cmd.check,
                        cmd.value3
                    );
                }

                console.log('------------------------------');
                console.log(`Sheet: ${sheetName}`);
                console.log(`Action: ${cmd.action}`);
                console.log(`Command: ${command}`);
                console.log(`Output: ${output}`);
                console.log(`Expected: ${expected}`);
                console.log(`Passed: ${passed}`);
                console.log('------------------------------');

                await testInfo.attach(`Command: ${command}`, {
                    body:
                        `Sheet: ${sheetName}
Action: ${cmd.action}
Command: ${command}
Value1: ${value1}
Value2: ${value2}
Expected: ${expected}
Output: ${output}
Passed: ${passed}`,
                    contentType: 'text/plain'
                });

                expect(passed).toBeTruthy();
            });
        }
    });
}

// ================= CLEANUP =================
test.afterAll(async () => {
    await sqlHelper.close();
});
import * as XLSX from 'xlsx';
import { expect, test } from '@playwright/test';
import { PowershellHelper } from '../utils/pw/powershellHelper';
import { SqlHelper } from '../utils/pw/sqlHelper';
import { OutputChecker } from '../utils/pw/outputChecker';
import { VariableHelper } from '../utils/pw/variableHelper';
import WebHelper from '../utils/pw/webHelper';
import { RuntimeVariables } from '../utils/pw/RuntimeVariables';
import path from 'path';
import fs from 'fs';

test.use({
    screenshot: 'off',
    video: 'off',
    trace: 'off'
});

// ================= ENV =================
const envName = process.env.TEST_ENV || 'qa';
console.log(`======================`);
console.log(`Running tests on ENV: ${envName}`);
console.log(`======================`);


// SqlHelper с динамическим envName
const sqlHelper = new SqlHelper(envName);

// Resolver для переменных
const resolver = new VariableHelper(); // Пустой, так как переменные из Excel и PowerShell

// ================= TEST SUITE =================
const suite = process.env.TEST_SUITE || 'demo';
const excelFile = path.resolve(process.cwd(), `data/${suite}.xlsx`);

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
        value3: row[6]?.toString().trim(),
    }));
}

// ================= TEST PER SHEET =================
for (const sheetName of Object.keys(sheetsMap)) {
    test(`Sheet: ${sheetName}`, async ({ page }, testInfo) => {

        const web = new WebHelper(page);
        const ps = new PowershellHelper();

        await ps.start();
        let stopSheet = false;

        for (const cmd of sheetsMap[sheetName]) {
            if (stopSheet) break;

            await test.step(`${cmd.action} -> ${cmd.command}`, async () => {

                // RESOLVE для всех переменных, включая ${webPassword}, ${c} и т.д.
                const command = resolver.resolve(cmd.command || '');
                const value1 = resolver.resolve(cmd.value1 || '');
                const value2 = resolver.resolve(cmd.value2 || '');
                const expected = resolver.resolve(cmd.expected || '');

                let output = '';

                switch ((cmd.action || '').toLowerCase()) {
                    case 'powershell':
                        output = command.toLowerCase() === 'runps1'
                            ? await ps.runPS1(value1, value2)
                            : await ps.runCommand(command);

                        // Сохраняем результат в RuntimeVariables, если нужно
                        if (cmd.value3) {
                            RuntimeVariables.set(cmd.value3, output);
                        }
                        break;

                    case 'sql':
                        output = await sqlHelper.runQuery(command);
                        if (cmd.value3) {
                            RuntimeVariables.set(cmd.value3, output);
                        }
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

                await testInfo.attach(`Step Output: ${cmd.action} -> ${command}`, {
                    body:
                        `Sheet: ${sheetName}
Action: ${cmd.action}
Command: ${command}
Value1: ${value1}
Value2: ${value2}
Expected: ${expected}
Output: ${output}`,
                    contentType: 'text/plain'
                });

                let passed = true;
                if (expected) {
                    passed = OutputChecker.validate(output, expected, cmd.check, cmd.value3);
                }

                if (!passed) stopSheet = true;

                expect(passed).toBeTruthy();
            });
        }

        await sqlHelper.close();
        ps.stop();
    });
}
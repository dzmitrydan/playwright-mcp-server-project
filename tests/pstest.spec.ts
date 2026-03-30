import * as XLSX from 'xlsx';
import { test, expect } from '@playwright/test';
import { PowershellHelper } from '../utils/pw/powershellHelper';
import { OutputParser } from '../utils/pw/outputParser';

const ps = new PowershellHelper();

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

                const passed = cmd.expected
                    ? OutputParser.validate(output, cmd.expected, cmd.checkType)
                    : true;

                console.log(`[${sheetName}] Command: ${cmd.command}, Passed: ${passed}`);
                if (!passed) console.log('Output:', output);

                await testInfo.attach(`Sheet: ${sheetName} | Command: ${cmd.command}`, {
                    body: `Sheet: ${sheetName}\nCommand: ${cmd.command}\nOutput: ${output}\nExpected: ${cmd.expected}\nCheckType: ${cmd.checkType}\nPassed: ${passed}`,
                    contentType: 'text/plain'
                });

                expect(passed).toBeTruthy();
            });
        }
    });
}
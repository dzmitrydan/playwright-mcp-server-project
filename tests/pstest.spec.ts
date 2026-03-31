import * as XLSX from 'xlsx';
import { expect, test } from '@playwright/test';
import { PowershellHelper } from '../utils/pw/powershellHelper';
import { SqlHelper } from '../utils/pw/sqlHelper';
import { OutputChecker } from '../utils/pw/outputChecker';
import { VariableResolver } from '../utils/pw/variableResolver';

test.use({
    screenshot: 'off',
    video: 'off',
    trace: 'off'
});

const ps = new PowershellHelper();
const sqlHelper = new SqlHelper();

const resolver = new VariableResolver([
    './config/dbConfig.json',
    './config/sqlVariables.json',
    './config/powershellVariables.json'
]);

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
    test(`Test: ${sheetName}`, async ({}, testInfo) => {

        for (const cmd of sheetsMap[sheetName]) {

            await test.step(`Command: ${cmd.command}`, async () => {

                let output = '';

                const resolvedCommand = resolver.resolve(cmd.command);

                const resolvedExpected = cmd.expected
                    ? resolver.resolve(cmd.expected)
                    : cmd.expected;

                if (cmd.action === 'powershell') {
                    output = await ps.runCommand(resolvedCommand);
                }

                if (cmd.action === 'sql') {
                    output = await sqlHelper.runQuery(resolvedCommand);
                }

                const passed = resolvedExpected
                    ? OutputChecker.validate(output, resolvedExpected, cmd.checkType)
                    : true;

                console.log(`[${sheetName}] ${cmd.action}`);
                console.log(`Command: ${resolvedCommand}`);
                console.log(`Expected: ${resolvedExpected}`);
                console.log(`Output: ${output}`);
                console.log(`Passed: ${passed}`);

                await testInfo.attach(`Command: ${resolvedCommand}`, {
                    body:
                        `Sheet: ${sheetName}
Action: ${cmd.action}
Command: ${resolvedCommand}
Expected: ${resolvedExpected}
Output: ${output}
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
import {expect, test} from '@playwright/test';
import {CommandCheck, PowerShellHelper} from '../utils/powershellHelper';
import {OutputParser} from "../utils/outputParser";

test.use({ browserName: undefined });

test('PowerShell commands test', async () => {
    const ps = new PowerShellHelper();

    console.log(await ps.runCommand('Get-Date'));
    console.log(await ps.runCommand('pwd'));
    console.log(await ps.runCommand('1..10 | ForEach-Object { "Line $_" }'));
    console.log(await ps.runCommand('Get-Process'));
});

test.describe('OutputParser Utilities', () => {

    const sampleOutput = `
Hello World
This is a test output
Line with number 123
Another line
End of output
`.trim();

    test('contains() should return true if text exists', () => {
        expect(OutputParser.contains(sampleOutput, 'Hello')).toBe(true);
        expect(OutputParser.contains(sampleOutput, '123')).toBe(true);
    });

    test('contains() should return false if text does not exist', () => {
        expect(OutputParser.contains(sampleOutput, 'Missing')).toBe(false);
        expect(OutputParser.contains(sampleOutput, '456')).toBe(false);
    });

    test('getLines() should split output into lines', () => {
        const lines = OutputParser.getLines(sampleOutput);
        expect(lines.length).toBe(5);
        expect(lines[0]).toBe('Hello World');
        expect(lines[2]).toBe('Line with number 123');
    });

    test('findLine() should return the first matching line', () => {
        const line1 = OutputParser.findLine(sampleOutput, 'test');
        expect(line1).toBe('This is a test output');

        const line2 = OutputParser.findLine(sampleOutput, 'number');
        expect(line2).toBe('Line with number 123');
    });

    test('findLine() should return undefined if no match', () => {
        const line = OutputParser.findLine(sampleOutput, 'Missing');
        expect(line).toBeUndefined();
    });

});

test('Run commands from Excel and check output', async () => {
    const ps = new PowerShellHelper();

    const commands: CommandCheck[] = await ps.readCommands('./data/commands.xlsx');

    for (const cmd of commands) {
        const output = await ps.runCommand(cmd.command);

        const found = OutputParser.contains(output, cmd.expectedOutput);
        console.log(`Command: "${cmd.command}", Expected: "${cmd.expectedOutput}", Found: ${found}`);

        expect(found).toBe(true);
    }
});
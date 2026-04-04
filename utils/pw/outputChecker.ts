import * as XLSX from 'xlsx';
import { RuntimeVariables } from './RuntimeVariables';

export class OutputChecker {
    static validate(output: string, expected?: string, checkType?: string, variableName?: string): boolean {
        if (!expected || expected.trim() === '') return true;

        const out = output.trim();
        const exp = expected.trim();

        switch ((checkType || 'contains').toLowerCase()) {
            case 'equals':
                return out === exp;

            case 'contains':
                return out.toLowerCase().includes(exp.toLowerCase());

            case 'startswith':
                return out.toLowerCase().startsWith(exp.toLowerCase());

            case 'endswith':
                return out.toLowerCase().endsWith(exp.toLowerCase());

            case 'regex':
                return new RegExp(exp).test(out);

            case 'notcontains':
                return !out.toLowerCase().includes(exp.toLowerCase());

            case 'notempty':
                return out.length > 0;

            case 'softassertions':
                const errors = this.validateSoftAssertions(out, exp);
                if (errors.length > 0) {
                    console.log('------ SOFT ASSERTIONS ERRORS ------');
                    errors.forEach(e => console.log(e));
                    console.log('------------------------------------');
                    return false;
                }
                return true;

            case 'getvariable':
                return this.extractVariable(out, exp, variableName);

            default:
                return out.toLowerCase().includes(exp.toLowerCase());
        }
    }

    static extractVariable(output: string, regex: string, variableName?: string): boolean {
        if (!variableName) {
            console.log('Variable name not provided');
            return false;
        }

        let value = output.trim().replace(/\r?\n/g, '');
        if (regex && regex.trim() !== '') {
            const reg = new RegExp(regex);
            const match = output.match(reg);
            if (!match) {
                console.log(`Variable extraction failed. Regex: ${regex}`);
                return false;
            }
            value = (match[1] || match[0]).trim();
        }

        RuntimeVariables.set(variableName, value);
        console.log(`Variable extracted: ${variableName} = ${value}`);
        return true;
    }

    static validateSoftAssertions(output: string, filePath: string): string[] {
        const errors: string[] = [];
        const workbook = XLSX.readFile(filePath);
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];

        if (!rows || rows.length < 2) return errors;

        const header = rows[0].map((h: string) => h.toLowerCase());
        const expectedIdx = header.indexOf('expected');
        const checkIdx = header.indexOf('check');

        if (expectedIdx === -1 || checkIdx === -1) throw new Error('SoftAssertions Excel must contain EXPECTED and CHECK columns');

        for (let i = 1; i < rows.length; i++) {
            const row = rows[i];
            const expected = row[expectedIdx]?.toString().trim();
            const checkType = row[checkIdx]?.toString().trim();
            if (!expected) continue;
            const passed = this.validateSingle(output, expected, checkType);
            if (!passed) errors.push(`Row ${i + 1} FAILED -> Expected: "${expected}" Check: "${checkType}"`);
        }

        return errors;
    }

    static validateSingle(output: string, expected?: string, checkType?: string): boolean {
        if (!expected || expected.trim() === '') return true;
        const out = output.trim();
        const exp = expected.trim();
        switch ((checkType || 'contains').toLowerCase()) {
            case 'equals': return out === exp;
            case 'contains': return out.toLowerCase().includes(exp.toLowerCase());
            case 'startswith': return out.toLowerCase().startsWith(exp.toLowerCase());
            case 'endswith': return out.toLowerCase().endsWith(exp.toLowerCase());
            case 'regex': return new RegExp(exp).test(out);
            case 'notcontains': return !out.toLowerCase().includes(exp.toLowerCase());
            case 'notempty': return out.length > 0;
            default: return out.toLowerCase().includes(exp.toLowerCase());
        }
    }
}
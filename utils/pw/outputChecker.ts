export class OutputChecker {
    static validate(output: string, expected?: string, checkType?: string): boolean {
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
            default:
                return out.toLowerCase().includes(exp.toLowerCase());
        }
    }
}
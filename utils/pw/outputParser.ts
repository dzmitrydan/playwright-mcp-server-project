export class OutputParser {
    static validate(output: string, expected?: string, checkType?: string): boolean {

        if (!expected || expected.trim() === '') {
            return true;
        }

        const out = output.trim();
        const exp = expected.trim();

        switch ((checkType || 'contains').toLowerCase()) {
            case 'equals':
                return out.trim() === exp.trim();
            case 'contains':
                return out.toLowerCase().includes(exp.toLowerCase());
            case 'startswith':
                return out.toLowerCase().startsWith(exp.toLowerCase());
            case 'regex':
                return new RegExp(exp).test(out);
            default:
                return out.toLowerCase().includes(exp.toLowerCase());
        }
    }
}
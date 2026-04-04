export class RuntimeVariables {
    private static variables: Record<string, string> = {};

    static set(name: string, value: string) {
        this.variables[name] = value.toString().trim();
    }

    static get(name: string): string {
        return this.variables[name] || '';
    }

    static getAll(): Record<string, string> {
        return this.variables;
    }
}
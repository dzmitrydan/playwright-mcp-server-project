import * as fs from 'fs';
import * as path from 'path';
import { RuntimeVariables } from './RuntimeVariables';

export class VariableHelper {
    private variables: Record<string, any> = {};

    constructor(jsonFiles: string[] = []) {
        for (const file of jsonFiles) {
            const fullPath = path.resolve(file);
            if (!fs.existsSync(fullPath)) continue;
            const json = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
            this.flatten(json);
        }
    }

    private flatten(obj: any, prefix = '') {
        for (const key in obj) {
            const value = obj[key];
            const newKey = prefix ? `${prefix}.${key}` : key;

            if (typeof value === 'object' && value !== null) {
                this.flatten(value, newKey);
            } else {
                this.variables[key] = value;
                this.variables[newKey] = value;
            }
        }
    }

    resolve(text: string): string {
        if (!text) return text;

        return text.replace(/\$\{([^}]+)\}/g, (_, varName) => {
            let value = RuntimeVariables.get(varName);

            if (value === undefined || value === null) {
                value = this.variables[varName];
            }

            if (value === undefined || value === null) {
                console.warn(`Variable not found: ${varName}`);
                return '';
            }

            return value.toString().trim();
        });
    }
}
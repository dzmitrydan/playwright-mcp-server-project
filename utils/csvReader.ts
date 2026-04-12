import { parse } from 'csv-parse/sync';
import * as fs from 'node:fs';
import * as path from 'node:path';

export function readCSV(filePath: string) {
    const fullPath = path.resolve(filePath);
    const fileContent = fs.readFileSync(fullPath);

    return parse(fileContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
    });
}
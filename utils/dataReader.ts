import path from 'path'
import {readCSV} from "./csvReader";
import {readExcel} from './excelReader';
import * as fs from "node:fs";

export function readData(filePath: string, sheetName?: string) {
    const ext = path.extname(filePath).toLocaleLowerCase();
    switch (ext) {
        case ".csv":
            console.log("Reading CSV..");
            return readCSV(filePath);
        case ".xlsx":
            console.log("Reading EXCEL..");
            return readExcel(filePath, sheetName || 'Sheet1');
        case ".json":
            console.log("Reading JSON..");
            const JSONData = fs.readFileSync(filePath, 'utf8');
            return JSON.parse(JSONData)
        default:
            throw new Error(`Unsupported file type - ${ext}`);
    }
}
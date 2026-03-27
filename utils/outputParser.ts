export class OutputParser {
    static contains(output: string, text: string): boolean {
        return output.includes(text);
    }

    static getLines(output: string): string[] {
        return output.split('\n');
    }

    static findLine(output: string, text: string): string | undefined {
        return output.split('\n').find(line => line.includes(text));
    }
}
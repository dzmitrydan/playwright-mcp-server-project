import { spawn } from 'child_process';
import path from "path";
import fs from "fs";

export class PowershellHelper {
    runCommand(command: string): Promise<string> {
        return new Promise((resolve, reject) => {

            const shell = process.platform === 'win32'
                ? 'pwsh.exe'
                : 'pwsh';

            const ps = spawn(shell, [
                '-NoLogo',
                '-NoProfile',
                '-NonInteractive',
                '-Command',
                command
            ]);

            let output = '';
            let error = '';

            ps.stdout.on('data', (data) => {
                output += data.toString();
            });

            ps.stderr.on('data', (data) => {
                error += data.toString();
            });

            ps.on('close', () => {
                resolve((output + '\n' + error).trim());
            });

            ps.on('error', (err) => {
                reject(err);
            });
        });
    }

    runPS1(scriptPath: string, params?: string): Promise<string> {
        return new Promise((resolve, reject) => {

            const shell = process.platform === 'win32' ? 'pwsh.exe' : 'pwsh';
            const fullPath = path.resolve(process.cwd(), scriptPath);

            if (!fs.existsSync(fullPath)) {
                reject(new Error(`PowerShell script not found: ${fullPath}`));
                return;
            }

            const command = params ? `& "${fullPath}" ${params}` : `& "${fullPath}"`;

            const ps = spawn(shell, [
                '-NoLogo',
                '-NoProfile',
                '-NonInteractive',
                '-Command',
                command
            ]);

            let output = '';
            let error = '';

            ps.stdout.on('data', (data) => { output += data.toString(); });
            ps.stderr.on('data', (data) => { error += data.toString(); });

            ps.on('close', () => { resolve((output + '\n' + error).trim()); });
            ps.on('error', (err) => { reject(err); });
        });
    }

    close(): void {}
}
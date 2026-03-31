import { spawn } from 'child_process';

export class PowershellHelper {
    runCommand(command: string): Promise<string> {
        return new Promise((resolve, reject) => {
            const ps = spawn('pwsh', [
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
                if (error) {
                    resolve((output + '\n' + error).trim());
                } else {
                    resolve(output.trim());
                }
            });

            ps.on('error', (err) => {
                reject(err);
            });
        });
    }

    close(): void {}
}
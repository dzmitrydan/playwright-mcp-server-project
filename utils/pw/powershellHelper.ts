import { spawn, ChildProcessWithoutNullStreams } from 'child_process';

export class PowershellHelper {
    private ps!: ChildProcessWithoutNullStreams;
    private buffer = '';
    private started = false;

    async start(): Promise<void> {
        return new Promise((resolve, reject) => {
            const shell = process.platform === 'win32' ? 'pwsh.exe' : 'pwsh';

            this.ps = spawn(shell, [
                '-NoLogo',
                '-NoProfile',
                '-NonInteractive',
                '-Command',
                '-' // читаем команды из stdin
            ]);

            this.ps.stdout.on('data', (data) => {
                this.buffer += data.toString();
            });

            this.ps.stderr.on('data', (data) => {
                this.buffer += data.toString();
            });

            this.ps.on('error', reject);

            // отключаем ANSI/цвета
            setTimeout(() => {
                this.ps.stdin.write('$PSStyle.OutputRendering = "PlainText"\n');
                this.started = true;
                resolve();
            }, 200);
        });
    }

    async runCommand(command: string): Promise<string> {
        if (!this.started) {
            throw new Error('PowerShell session not started');
        }

        return new Promise((resolve) => {
            const marker = `__END__${Date.now()}__`;

            // выполняем команду
            this.ps.stdin.write(`${command}\n`);
            this.ps.stdin.write(`Write-Output "${marker}"\n`);

            const interval = setInterval(() => {
                if (this.buffer.includes(marker)) {

                    let output = this.buffer.split(marker)[0];
                    this.buffer = '';
                    clearInterval(interval);

                    // удалить ANSI
                    output = output.replace(/\x1B\[[0-9;?]*[a-zA-Z]/g, '');

                    // удалить prompt
                    output = output.replace(/PS .*?>/g, '');

                    // удалить пустые строки
                    output = output
                        .split('\n')
                        .map(l => l.trim())
                        .filter(l => l.length > 0)
                        .join('');

                    resolve(output.trim());
                }
            }, 50);
        });
    }

    async runPS1(scriptPath: string, params?: string): Promise<string> {
        const command = params
            ? `& "${scriptPath}" ${params}`
            : `& "${scriptPath}"`;

        return this.runCommand(command);
    }

    stop(): void {
        if (this.ps) {
            this.ps.stdin.write('exit\n');
            this.ps.kill();
            this.started = false;
        }
    }

    close(): void {
        this.stop();
    }
}
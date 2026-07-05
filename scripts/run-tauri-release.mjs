import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { spawn } from 'node:child_process';

const cargoToml = await readFile(new URL('../src-tauri/Cargo.toml', import.meta.url), 'utf8');
const packageName = cargoToml.match(/^\s*name\s*=\s*"([^"]+)"/m)?.[1];

if (!packageName) {
  throw new Error('Unable to resolve the Tauri package name from src-tauri/Cargo.toml.');
}

const binaryName = process.platform === 'win32' ? `${packageName}.exe` : packageName;
const binaryPath = join('src-tauri', 'target', 'release', binaryName);

if (!existsSync(binaryPath)) {
  throw new Error(`Release binary not found at ${binaryPath}. Run "npm run desktop:build" first.`);
}

const child = spawn(binaryPath, {
  stdio: 'inherit',
  shell: false
});

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
  }

  process.exit(code ?? 0);
});

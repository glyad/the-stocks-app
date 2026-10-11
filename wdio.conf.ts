import { fileURLToPath } from 'node:url';
import type { TauriCapabilities } from '@wdio/tauri-service';

const appBinaryPath = fileURLToPath(
  new URL(`./src-tauri/target/debug/the-stocks-app${process.platform === 'win32' ? '.exe' : ''}`, import.meta.url)
);

const capabilities: TauriCapabilities[] = [{
  browserName: 'tauri',
  'tauri:options': { application: appBinaryPath }
}];

export const config: WebdriverIO.Config = {
  runner: 'local',
  specs: ['./tests/desktop/**/*.spec.ts'],
  maxInstances: 1,
  services: [['@wdio/tauri-service', { appBinaryPath, driverProvider: 'embedded' }]],
  capabilities,
  framework: 'mocha',
  reporters: ['spec'],
  logLevel: 'info',
  waitforTimeout: 15_000,
  connectionRetryTimeout: 90_000,
  connectionRetryCount: 1,
  mochaOpts: { ui: 'bdd', timeout: 60_000 }
};

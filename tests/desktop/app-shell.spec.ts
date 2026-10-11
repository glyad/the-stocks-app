import { browser, expect } from '@wdio/globals';
import { describe, it } from 'mocha';

// Explicit shadow selectors also work with the embedded WKWebView driver.
describe('Tauri desktop app', () => {
  it('renders the stock shell inside the native webview', async () => {
    const app = browser.$('stocks-app');
    await expect(app).toBeDisplayed();
    await expect(app.shadow$('h1')).toHaveText('Stocks');
    await expect(app.shadow$('.watchlist')).toBeDisplayed();
    const chart = app.shadow$('stock-chart');
    await expect(chart.shadow$('igc-financial-chart')).toBeDisplayed();
  });

  it('connects the WebdriverIO bridge to the native Tauri backend', async () => {
    const version = await browser.tauri.execute(({ core }) =>
      core.invoke('plugin:app|version')
    );
    expect(version).toMatch(/^\d+\.\d+\.\d+/);
  });
});

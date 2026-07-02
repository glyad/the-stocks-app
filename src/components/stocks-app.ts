import { LitElement, css, html, nothing } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import './stock-chart';
import { AlphaVantageProvider } from '../services/alpha-vantage-provider';
import { MarketDataService } from '../services/market-data-service';
import { MockMarketDataProvider } from '../services/mock-provider';
import { PersistentAppStore, defaultSettings, type AppSettings } from '../services/app-store';
import { addSymbol, removeSymbol } from '../state/watchlist';
import type {
  ChartRange,
  HistoricalBar,
  MarketStatus,
  NewsItem,
  ProviderStatus,
  Quote,
  SymbolSearchResult
} from '../models/market';

const ranges: ChartRange[] = ['1D', '1W', '1M', '6M', '1Y'];

@customElement('stocks-app')
export class StocksApp extends LitElement {
  @state()
  private settings: AppSettings = defaultSettings;

  @state()
  private quotes = new Map<string, Quote>();

  @state()
  private selectedQuote: Quote | null = null;

  @state()
  private history: HistoricalBar[] = [];

  @state()
  private news: NewsItem[] = [];

  @state()
  private searchQuery = '';

  @state()
  private searchResults: SymbolSearchResult[] = [];

  @state()
  private providerStatus: ProviderStatus = 'mock';

  @state()
  private marketStatus: MarketStatus | null = null;

  @state()
  private loading = true;

  @state()
  private settingsOpen = false;

  @state()
  private apiKeyDraft = '';

  @state()
  private message = '';

  private readonly store = new PersistentAppStore();
  private readonly fallbackProvider = new MockMarketDataProvider();
  private readonly service = new MarketDataService(this.fallbackProvider, this.fallbackProvider);

  static styles = css`
    :host {
      display: block;
      width: 100%;
      height: 100%;
      color: var(--text-0);
      background:
        radial-gradient(circle at 22% 0%, rgba(90, 167, 255, 0.08), transparent 28%),
        linear-gradient(180deg, #111722 0%, #0d1117 36%, #090c11 100%);
    }

    .app {
      display: grid;
      grid-template-columns: minmax(270px, 320px) minmax(0, 1fr) minmax(300px, 360px);
      height: 100%;
      min-width: 0;
    }

    aside,
    main,
    .news-panel {
      min-height: 0;
    }

    aside {
      display: grid;
      grid-template-rows: auto auto minmax(0, 1fr);
      border-right: 1px solid var(--line);
      background: rgba(13, 17, 23, 0.84);
      backdrop-filter: blur(18px);
    }

    .topbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      padding: 18px 16px 12px;
    }

    h1,
    h2,
    h3,
    p {
      margin: 0;
    }

    h1 {
      font-size: 28px;
      font-weight: 720;
      line-height: 1.05;
    }

    .market-state {
      display: grid;
      gap: 2px;
      color: var(--text-2);
      font-size: 12px;
      text-align: right;
    }

    .status-dot {
      display: inline-block;
      width: 8px;
      height: 8px;
      margin-right: 6px;
      border-radius: 999px;
      background: var(--amber);
    }

    .status-dot.live,
    .status-dot.mock {
      background: var(--green);
    }

    .search {
      position: relative;
      padding: 0 16px 14px;
    }

    .search input,
    .field input {
      width: 100%;
      height: 38px;
      border: 1px solid var(--line);
      border-radius: 8px;
      color: var(--text-0);
      background: rgba(255, 255, 255, 0.06);
      outline: none;
      padding: 0 12px;
    }

    .search input:focus,
    .field input:focus {
      border-color: var(--focus);
      box-shadow: 0 0 0 3px rgba(121, 184, 255, 0.12);
    }

    .results {
      position: absolute;
      z-index: 10;
      top: 42px;
      right: 16px;
      left: 16px;
      overflow: hidden;
      border: 1px solid var(--line);
      border-radius: 8px;
      background: #111722;
      box-shadow: 0 18px 36px rgba(0, 0, 0, 0.38);
    }

    .result {
      display: grid;
      grid-template-columns: 64px 1fr;
      gap: 8px;
      width: 100%;
      padding: 10px 12px;
      border: 0;
      border-bottom: 1px solid var(--line);
      background: transparent;
      text-align: left;
      cursor: pointer;
    }

    .result:last-child {
      border-bottom: 0;
    }

    .result:hover {
      background: rgba(255, 255, 255, 0.06);
    }

    .watchlist {
      overflow: auto;
      padding: 4px 10px 14px;
    }

    .watch-item {
      display: grid;
      grid-template-columns: 1fr auto auto;
      align-items: center;
      gap: 10px;
      width: 100%;
      min-height: 72px;
      margin-bottom: 6px;
      padding: 10px 8px 10px 12px;
      border: 1px solid transparent;
      border-radius: 8px;
      background: transparent;
      text-align: left;
      cursor: pointer;
    }

    .watch-item:hover,
    .watch-item.active {
      border-color: var(--line);
      background: rgba(255, 255, 255, 0.06);
    }

    .symbol {
      font-size: 17px;
      font-weight: 720;
      letter-spacing: 0;
    }

    .company,
    .muted {
      overflow: hidden;
      color: var(--text-2);
      font-size: 12px;
      line-height: 1.35;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .quote-cell {
      display: grid;
      gap: 4px;
      text-align: right;
      white-space: nowrap;
    }

    .price {
      font-variant-numeric: tabular-nums;
      font-weight: 620;
    }

    .change {
      width: max-content;
      min-width: 72px;
      padding: 4px 8px;
      border-radius: 999px;
      text-align: center;
      font-size: 12px;
      font-variant-numeric: tabular-nums;
      background: rgba(36, 200, 117, 0.13);
      color: var(--green);
    }

    .change.down {
      background: rgba(255, 95, 87, 0.13);
      color: var(--red);
    }

    .remove {
      width: 28px;
      height: 28px;
      border: 0;
      border-radius: 999px;
      color: var(--text-2);
      background: transparent;
      cursor: pointer;
    }

    .remove:hover {
      color: var(--text-0);
      background: rgba(255, 255, 255, 0.08);
    }

    main {
      display: grid;
      grid-template-rows: auto auto minmax(0, 1fr);
      min-width: 0;
      padding: 24px 26px;
      overflow: auto;
    }

    .detail-header {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      align-items: start;
      gap: 24px;
      margin-bottom: 18px;
    }

    .detail-title {
      display: grid;
      gap: 8px;
    }

    .detail-title h2 {
      overflow-wrap: anywhere;
      font-size: clamp(30px, 4vw, 58px);
      line-height: 0.95;
      font-weight: 760;
    }

    .quote-large {
      display: grid;
      gap: 8px;
      text-align: right;
    }

    .quote-large .price {
      font-size: clamp(34px, 5vw, 64px);
      line-height: 0.95;
    }

    .toolbar {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      margin-bottom: 16px;
    }

    .ranges,
    .actions {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .segmented {
      min-width: 50px;
      height: 34px;
      border: 1px solid transparent;
      border-radius: 8px;
      color: var(--text-1);
      background: rgba(255, 255, 255, 0.05);
      cursor: pointer;
    }

    .segmented:hover,
    .segmented.active {
      color: var(--text-0);
      border-color: var(--line);
      background: rgba(255, 255, 255, 0.11);
    }

    .icon-button {
      min-width: 38px;
      height: 38px;
      border: 1px solid var(--line);
      border-radius: 8px;
      background: rgba(255, 255, 255, 0.06);
      cursor: pointer;
    }

    .icon-button:hover {
      background: rgba(255, 255, 255, 0.1);
    }

    .metric-grid {
      display: grid;
      grid-template-columns: repeat(4, minmax(120px, 1fr));
      gap: 10px;
      margin-top: 18px;
    }

    .metric {
      display: grid;
      gap: 6px;
      padding: 12px;
      border: 1px solid var(--line);
      border-radius: 8px;
      background: rgba(255, 255, 255, 0.045);
    }

    .metric span {
      color: var(--text-2);
      font-size: 12px;
    }

    .metric strong {
      font-size: 18px;
      font-variant-numeric: tabular-nums;
    }

    .news-panel {
      display: grid;
      grid-template-rows: auto minmax(0, 1fr);
      border-left: 1px solid var(--line);
      background: rgba(13, 17, 23, 0.72);
    }

    .news-header {
      padding: 22px 18px 14px;
      border-bottom: 1px solid var(--line);
    }

    .news-header h2 {
      font-size: 22px;
    }

    .news-list {
      overflow: auto;
      padding: 10px;
    }

    .news-card {
      display: grid;
      gap: 8px;
      padding: 14px 12px;
      border-bottom: 1px solid var(--line);
      color: inherit;
      text-decoration: none;
    }

    .news-card:hover h3 {
      color: var(--blue);
    }

    .news-card h3 {
      font-size: 15px;
      line-height: 1.28;
    }

    .news-card p {
      color: var(--text-1);
      font-size: 13px;
      line-height: 1.45;
    }

    .settings-panel {
      position: fixed;
      z-index: 20;
      top: 0;
      right: 0;
      bottom: 0;
      width: min(420px, 100vw);
      display: grid;
      grid-template-rows: auto minmax(0, 1fr) auto;
      border-left: 1px solid var(--line);
      background: #111722;
      box-shadow: -30px 0 70px rgba(0, 0, 0, 0.42);
    }

    .settings-head,
    .settings-actions {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      padding: 18px;
      border-bottom: 1px solid var(--line);
    }

    .settings-actions {
      justify-content: flex-end;
      border-top: 1px solid var(--line);
      border-bottom: 0;
    }

    .settings-body {
      display: grid;
      align-content: start;
      gap: 18px;
      overflow: auto;
      padding: 18px;
    }

    .field {
      display: grid;
      gap: 8px;
    }

    .field label {
      color: var(--text-1);
      font-size: 13px;
      font-weight: 620;
    }

    .message {
      color: var(--amber);
      font-size: 13px;
    }

    .empty-state {
      display: grid;
      place-items: center;
      min-height: 220px;
      color: var(--text-2);
    }

    @media (max-width: 1140px) {
      .app {
        grid-template-columns: minmax(250px, 300px) minmax(0, 1fr);
      }

      .news-panel {
        display: none;
      }

      .metric-grid {
        grid-template-columns: repeat(2, minmax(120px, 1fr));
      }
    }

    @media (max-width: 780px) {
      .app {
        grid-template-columns: 1fr;
      }

      aside {
        display: none;
      }

      main {
        padding: 18px;
      }

      .detail-header {
        grid-template-columns: 1fr;
      }

      .quote-large {
        text-align: left;
      }
    }
  `;

  async connectedCallback() {
    super.connectedCallback();
    await this.restoreSettings();
    await this.refreshAll();
  }

  render() {
    const selected = this.selectedQuote;

    return html`
      <div class="app">
        ${this.renderSidebar()}
        <main>
          ${selected ? this.renderDetail(selected) : html`<div class="empty-state">Select a symbol</div>`}
        </main>
        ${this.renderNewsPanel()}
      </div>
      ${this.settingsOpen ? this.renderSettings() : nothing}
    `;
  }

  private renderSidebar() {
    return html`
      <aside>
        <div class="topbar">
          <h1>Stocks</h1>
          <div class="market-state">
            <span><span class="status-dot ${this.providerStatus}"></span>${statusLabel(this.providerStatus)}</span>
            <span>${this.marketStatus?.label ?? 'Loading market'}</span>
          </div>
        </div>
        <div class="search">
          <input
            type="search"
            placeholder="Search"
            .value=${this.searchQuery}
            @input=${this.handleSearchInput}
            @keydown=${this.handleSearchKeydown}
          />
          ${this.searchResults.length > 0
            ? html`<div class="results">
                ${this.searchResults.map(
                  (result) => html`
                    <button class="result" @click=${() => this.addSearchResult(result)}>
                      <strong>${result.symbol}</strong>
                      <span class="muted">${result.name}</span>
                    </button>
                  `
                )}
              </div>`
            : nothing}
        </div>
        <div class="watchlist">
          ${this.settings.watchlist.map((symbol) => this.renderWatchItem(symbol))}
        </div>
      </aside>
    `;
  }

  private renderWatchItem(symbol: string) {
    const quote = this.quotes.get(symbol);
    const active = symbol === this.settings.selectedSymbol;

    return html`
      <button class="watch-item ${active ? 'active' : ''}" @click=${() => this.selectSymbol(symbol)}>
        <span>
          <span class="symbol">${symbol}</span>
          <span class="company">${quote?.name ?? 'Loading'}</span>
        </span>
        <span class="quote-cell">
          <span class="price">${quote ? formatMoney(quote.price) : '--'}</span>
          <span class="change ${quote && quote.change < 0 ? 'down' : ''}">
            ${quote ? formatSignedPercent(quote.changePercent) : '--'}
          </span>
        </span>
        <span
          class="remove"
          role="button"
          tabindex="0"
          title="Remove"
          @click=${(event: MouseEvent) => this.removeWatchSymbol(event, symbol)}
          @keydown=${(event: KeyboardEvent) => this.removeWatchSymbolByKey(event, symbol)}
          >x</span
        >
      </button>
    `;
  }

  private renderDetail(quote: Quote) {
    return html`
      <section class="detail-header">
        <div class="detail-title">
          <span class="muted">${quote.exchange || quote.currency} ${quote.symbol}</span>
          <h2>${quote.name}</h2>
        </div>
        <div class="quote-large">
          <span class="price">${formatMoney(quote.price)}</span>
          <span class="change ${quote.change < 0 ? 'down' : ''}">
            ${formatSignedMoney(quote.change)} (${formatSignedPercent(quote.changePercent)})
          </span>
        </div>
      </section>
      <div class="toolbar">
        <div class="ranges" role="group" aria-label="Chart range">
          ${ranges.map(
            (range) => html`
              <button
                class="segmented ${range === this.settings.chartRange ? 'active' : ''}"
                @click=${() => this.setRange(range)}
              >
                ${range}
              </button>
            `
          )}
        </div>
        <div class="actions">
          <button class="icon-button" title="Refresh" @click=${this.refreshAll}>R</button>
          <button class="icon-button" title="Settings" @click=${this.openSettings}>S</button>
        </div>
      </div>
      <stock-chart .bars=${this.history} .change=${quote.change}></stock-chart>
      <section class="metric-grid">
        <div class="metric">
          <span>Last update</span>
          <strong>${formatShortDate(quote.lastUpdated)}</strong>
        </div>
        <div class="metric">
          <span>Currency</span>
          <strong>${quote.currency}</strong>
        </div>
        <div class="metric">
          <span>Range high</span>
          <strong>${this.history.length ? formatMoney(Math.max(...this.history.map((bar) => bar.high))) : '--'}</strong>
        </div>
        <div class="metric">
          <span>Range low</span>
          <strong>${this.history.length ? formatMoney(Math.min(...this.history.map((bar) => bar.low))) : '--'}</strong>
        </div>
      </section>
      ${this.loading ? html`<p class="message">Refreshing market data...</p>` : nothing}
      ${this.message ? html`<p class="message">${this.message}</p>` : nothing}
    `;
  }

  private renderNewsPanel() {
    return html`
      <section class="news-panel">
        <div class="news-header">
          <h2>Business News</h2>
          <p class="muted">${this.selectedQuote?.symbol ?? ''} latest stories</p>
        </div>
        <div class="news-list">
          ${this.news.map(
            (item) => html`
              <a class="news-card" href=${item.url} target="_blank" rel="noreferrer">
                <span class="muted">${item.source} - ${formatRelative(item.publishedAt)}</span>
                <h3>${item.title}</h3>
                <p>${item.summary}</p>
              </a>
            `
          )}
        </div>
      </section>
    `;
  }

  private renderSettings() {
    return html`
      <section class="settings-panel" role="dialog" aria-modal="true" aria-label="Settings">
        <div class="settings-head">
          <h2>Settings</h2>
          <button class="icon-button" title="Close" @click=${this.closeSettings}>x</button>
        </div>
        <div class="settings-body">
          <div class="field">
            <label for="api-key">Alpha Vantage API key</label>
            <input
              id="api-key"
              type="password"
              autocomplete="off"
              placeholder="Paste API key"
              .value=${this.apiKeyDraft}
              @input=${(event: Event) => {
                this.apiKeyDraft = (event.currentTarget as HTMLInputElement).value;
              }}
            />
            <p class="muted">Without a key, the app stays in mock mode. Free Alpha Vantage accounts are rate limited.</p>
          </div>
          <div class="metric">
            <span>Provider</span>
            <strong>${statusLabel(this.providerStatus)}</strong>
          </div>
          <div class="metric">
            <span>Watchlist</span>
            <strong>${this.settings.watchlist.length} symbols</strong>
          </div>
        </div>
        <div class="settings-actions">
          <button class="icon-button" title="Clear cache" @click=${this.clearCache}>Clear</button>
          <button class="icon-button" title="Reset watchlist" @click=${this.resetWatchlist}>Reset</button>
          <igc-button @click=${this.saveSettings}>Save</igc-button>
        </div>
      </section>
    `;
  }

  private async restoreSettings() {
    this.settings = await this.store.load();
    this.apiKeyDraft = this.settings.apiKey;
    this.configureProvider();
  }

  private configureProvider() {
    const provider = this.settings.apiKey.trim()
      ? new AlphaVantageProvider(this.settings.apiKey)
      : this.fallbackProvider;
    this.service.setPrimaryProvider(provider);
    this.providerStatus = this.service.status;
  }

  private async refreshAll() {
    this.loading = true;
    this.message = '';

    try {
      await Promise.all([this.refreshWatchlist(), this.refreshSelected(), this.refreshMarketStatus()]);
    } finally {
      this.providerStatus = this.service.status;
      this.loading = false;
    }
  }

  private async refreshWatchlist() {
    const quotes = await Promise.all(
      this.settings.watchlist.map(async (symbol) => [symbol, await this.service.getQuote(symbol)] as const)
    );
    this.quotes = new Map(quotes);
  }

  private async refreshSelected() {
    const symbol = this.settings.selectedSymbol;
    const [quote, history, news] = await Promise.all([
      this.service.getQuote(symbol),
      this.service.getHistory(symbol, this.settings.chartRange),
      this.service.getNews(symbol)
    ]);
    this.selectedQuote = quote;
    this.history = history;
    this.news = news;
  }

  private async refreshMarketStatus() {
    this.marketStatus = await this.service.getMarketStatus();
  }

  private async selectSymbol(symbol: string) {
    this.settings = { ...this.settings, selectedSymbol: symbol };
    await this.persistSettings();
    await this.refreshSelected();
  }

  private async setRange(range: ChartRange) {
    this.settings = { ...this.settings, chartRange: range };
    await this.persistSettings();
    this.history = await this.service.getHistory(this.settings.selectedSymbol, range);
    this.providerStatus = this.service.status;
  }

  private handleSearchInput(event: Event) {
    this.searchQuery = (event.currentTarget as HTMLInputElement).value;
    window.clearTimeout(searchTimer);
    searchTimer = window.setTimeout(() => void this.runSearch(), 220);
  }

  private handleSearchKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      event.preventDefault();
      void this.runSearch();
    }
    if (event.key === 'Escape') {
      this.searchResults = [];
    }
  }

  private async runSearch() {
    const query = this.searchQuery.trim();
    if (!query) {
      this.searchResults = [];
      return;
    }

    this.searchResults = await this.service.searchSymbols(query);
    this.providerStatus = this.service.status;
  }

  private async addSearchResult(result: SymbolSearchResult) {
    const watchlist = addSymbol(this.settings.watchlist, result.symbol);
    this.settings = {
      ...this.settings,
      watchlist,
      selectedSymbol: result.symbol
    };
    this.searchQuery = '';
    this.searchResults = [];
    await this.persistSettings();
    await this.refreshAll();
  }

  private async removeWatchSymbol(event: MouseEvent, symbol: string) {
    event.stopPropagation();
    await this.removeSymbol(symbol);
  }

  private async removeWatchSymbolByKey(event: KeyboardEvent, symbol: string) {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    event.stopPropagation();
    await this.removeSymbol(symbol);
  }

  private async removeSymbol(symbol: string) {
    const nextWatchlist = removeSymbol(this.settings.watchlist, symbol);
    if (nextWatchlist.length === 0) {
      this.message = 'Keep at least one symbol in the watchlist.';
      return;
    }

    const selectedSymbol =
      this.settings.selectedSymbol === symbol ? nextWatchlist[0] : this.settings.selectedSymbol;
    this.settings = { ...this.settings, watchlist: nextWatchlist, selectedSymbol };
    await this.persistSettings();
    await this.refreshAll();
  }

  private openSettings() {
    this.apiKeyDraft = this.settings.apiKey;
    this.settingsOpen = true;
  }

  private closeSettings() {
    this.settingsOpen = false;
  }

  private async saveSettings() {
    this.settings = { ...this.settings, apiKey: this.apiKeyDraft.trim() };
    await this.persistSettings();
    this.configureProvider();
    this.settingsOpen = false;
    await this.refreshAll();
  }

  private clearCache() {
    this.service.clearCache();
    this.message = 'Cache cleared.';
  }

  private async resetWatchlist() {
    this.settings = {
      ...this.settings,
      watchlist: defaultSettings.watchlist,
      selectedSymbol: defaultSettings.selectedSymbol
    };
    await this.persistSettings();
    await this.refreshAll();
  }

  private async persistSettings() {
    await this.store.save(this.settings);
  }
}

let searchTimer = 0;

function formatMoney(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2
  }).format(value);
}

function formatSignedMoney(value: number) {
  const prefix = value > 0 ? '+' : '';
  return `${prefix}${formatMoney(value)}`;
}

function formatSignedPercent(value: number) {
  const prefix = value > 0 ? '+' : '';
  return `${prefix}${value.toFixed(2)}%`;
}

function formatShortDate(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric'
  }).format(new Date(value));
}

function formatRelative(value: string) {
  const minutes = Math.max(1, Math.round((Date.now() - new Date(value).getTime()) / 60_000));
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

function statusLabel(status: ProviderStatus) {
  return {
    mock: 'Mock data',
    live: 'Live data',
    fallback: 'Fallback data',
    error: 'Provider error'
  }[status];
}

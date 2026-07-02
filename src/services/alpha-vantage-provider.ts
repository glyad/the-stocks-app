import type {
  ChartRange,
  HistoricalBar,
  MarketDataProvider,
  MarketStatus,
  NewsItem,
  Quote,
  SymbolSearchResult
} from '../models/market';
import { ProviderUnavailableError } from '../models/market';

type Fetcher = typeof fetch;

const endpoint = 'https://www.alphavantage.co/query';

async function getFetcher(): Promise<Fetcher> {
  const isTauri = '__TAURI_INTERNALS__' in window;
  if (!isTauri) return globalThis.fetch.bind(globalThis);

  const mod = await import('@tauri-apps/plugin-http');
  return mod.fetch as unknown as Fetcher;
}

function alphaUrl(params: Record<string, string>) {
  const url = new URL(endpoint);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  return url.toString();
}

function assertUsablePayload(payload: Record<string, unknown>) {
  const message =
    payload['Error Message'] ?? payload.Information ?? payload.Note ?? payload['Realtime Currency Exchange Rate'];

  if (typeof message === 'string') {
    throw new ProviderUnavailableError(message);
  }
}

function parsePercent(value: string | undefined): number {
  if (!value) return 0;
  return Number(value.replace('%', '')) || 0;
}

function rangeLimit(range: ChartRange): number {
  return {
    '1D': 32,
    '1W': 7,
    '1M': 30,
    '6M': 126,
    '1Y': 252
  }[range];
}

export class AlphaVantageProvider implements MarketDataProvider {
  readonly name = 'Alpha Vantage';

  constructor(private readonly apiKey: string | null) {}

  get configured() {
    return Boolean(this.apiKey?.trim());
  }

  async searchSymbols(query: string): Promise<SymbolSearchResult[]> {
    if (!query.trim()) return [];
    const payload = await this.request({
      function: 'SYMBOL_SEARCH',
      keywords: query.trim()
    });

    const matches = Array.isArray(payload.bestMatches) ? payload.bestMatches : [];

    return matches.slice(0, 8).map((item) => ({
      symbol: String(item['1. symbol'] ?? ''),
      name: String(item['2. name'] ?? ''),
      exchange: String(item['4. region'] ?? ''),
      currency: String(item['8. currency'] ?? 'USD'),
      region: String(item['4. region'] ?? '')
    }));
  }

  async getQuote(symbol: string): Promise<Quote> {
    const payload = await this.request({
      function: 'GLOBAL_QUOTE',
      symbol
    });

    const quote = payload['Global Quote'];
    if (!quote || typeof quote !== 'object') {
      throw new ProviderUnavailableError(`No quote returned for ${symbol}`);
    }

    const raw = quote as Record<string, string>;

    return {
      symbol: raw['01. symbol'] || symbol,
      name: raw['01. symbol'] || symbol,
      price: Number(raw['05. price']) || 0,
      change: Number(raw['09. change']) || 0,
      changePercent: parsePercent(raw['10. change percent']),
      currency: 'USD',
      exchange: '',
      lastUpdated: raw['07. latest trading day'] || new Date().toISOString()
    };
  }

  async getHistory(symbol: string, range: ChartRange): Promise<HistoricalBar[]> {
    const payload = await this.request({
      function: 'TIME_SERIES_DAILY_ADJUSTED',
      symbol,
      outputsize: range === '1Y' ? 'full' : 'compact'
    });

    const series = payload['Time Series (Daily)'];
    if (!series || typeof series !== 'object') {
      throw new ProviderUnavailableError(`No history returned for ${symbol}`);
    }

    return Object.entries(series as Record<string, Record<string, string>>)
      .slice(0, rangeLimit(range))
      .map(([date, bar]) => ({
        timestamp: new Date(`${date}T16:00:00Z`).toISOString(),
        open: Number(bar['1. open']) || 0,
        high: Number(bar['2. high']) || 0,
        low: Number(bar['3. low']) || 0,
        close: Number(bar['4. close']) || 0,
        volume: Number(bar['6. volume']) || 0
      }))
      .reverse();
  }

  async getNews(symbol: string): Promise<NewsItem[]> {
    const payload = await this.request({
      function: 'NEWS_SENTIMENT',
      tickers: symbol,
      sort: 'LATEST',
      limit: '12'
    });

    const feed = Array.isArray(payload.feed) ? payload.feed : [];

    return feed.map((item, index) => ({
      id: String(item.url ?? `${symbol}-${index}`),
      title: String(item.title ?? 'Market update'),
      source: String(item.source ?? 'Alpha Vantage'),
      url: String(item.url ?? 'https://www.alphavantage.co/'),
      summary: String(item.summary ?? ''),
      publishedAt: parseAlphaTimestamp(String(item.time_published ?? '')),
      relatedSymbols: Array.isArray(item.ticker_sentiment)
        ? item.ticker_sentiment
            .map((ticker: { ticker?: unknown }) => String(ticker.ticker ?? ''))
            .filter(Boolean)
        : [symbol]
    }));
  }

  async getMarketStatus(): Promise<MarketStatus> {
    return {
      label: this.configured ? 'Alpha Vantage connected' : 'Mock mode',
      isOpen: false,
      updatedAt: new Date().toISOString()
    };
  }

  private async request(params: Record<string, string>): Promise<Record<string, any>> {
    if (!this.configured) {
      throw new ProviderUnavailableError('Alpha Vantage API key is not configured');
    }

    const fetcher = await getFetcher();
    const response = await fetcher(
      alphaUrl({
        ...params,
        apikey: this.apiKey?.trim() ?? ''
      })
    );

    if (!response.ok) {
      throw new ProviderUnavailableError(`Alpha Vantage returned HTTP ${response.status}`);
    }

    const payload = (await response.json()) as Record<string, unknown>;
    assertUsablePayload(payload);
    return payload as Record<string, any>;
  }
}

function parseAlphaTimestamp(value: string) {
  if (!/^\d{8}T\d{6}$/.test(value)) return new Date().toISOString();

  const year = value.slice(0, 4);
  const month = value.slice(4, 6);
  const day = value.slice(6, 8);
  const hour = value.slice(9, 11);
  const minute = value.slice(11, 13);
  const second = value.slice(13, 15);
  return new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}Z`).toISOString();
}

export type ChartRange = '1D' | '1W' | '1M' | '6M' | '1Y';

export type ProviderStatus = 'mock' | 'live' | 'fallback' | 'error';

export interface SymbolSearchResult {
  symbol: string;
  name: string;
  exchange: string;
  currency: string;
  region?: string;
}

export interface Quote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  currency: string;
  exchange: string;
  lastUpdated: string;
}

export interface HistoricalBar {
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface NewsItem {
  id: string;
  title: string;
  source: string;
  url: string;
  summary: string;
  publishedAt: string;
  relatedSymbols: string[];
}

export interface MarketStatus {
  label: string;
  isOpen: boolean;
  updatedAt: string;
}

export interface MarketDataProvider {
  readonly name: string;
  searchSymbols(query: string): Promise<SymbolSearchResult[]>;
  getQuote(symbol: string): Promise<Quote>;
  getHistory(symbol: string, range: ChartRange): Promise<HistoricalBar[]>;
  getNews(symbol: string): Promise<NewsItem[]>;
  getMarketStatus(): Promise<MarketStatus>;
}

export interface AppState {
  watchlist: string[];
  selectedSymbol: string;
  chartRange: ChartRange;
  providerStatus: ProviderStatus;
  apiKeyConfigured: boolean;
  theme: 'dark' | 'light';
}

export class ProviderUnavailableError extends Error {
  constructor(
    message: string,
    public readonly cause?: unknown
  ) {
    super(message);
    this.name = 'ProviderUnavailableError';
  }
}

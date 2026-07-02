import type {
  ChartRange,
  HistoricalBar,
  MarketDataProvider,
  MarketStatus,
  NewsItem,
  ProviderStatus,
  Quote,
  SymbolSearchResult
} from '../models/market';

type CacheValue<T> = {
  expiresAt: number;
  value: T;
};

type ProviderCall<T> = (provider: MarketDataProvider) => Promise<T>;

export class MarketDataService {
  readonly cache = new Map<string, CacheValue<unknown>>();
  status: ProviderStatus;

  constructor(
    private primary: MarketDataProvider,
    private fallback: MarketDataProvider,
    private readonly ttlMs = 5 * 60 * 1000
  ) {
    this.status = primary.name === fallback.name ? 'mock' : 'live';
  }

  setPrimaryProvider(provider: MarketDataProvider) {
    this.primary = provider;
    this.clearCache();
    this.status = provider.name === this.fallback.name ? 'mock' : 'live';
  }

  clearCache() {
    this.cache.clear();
  }

  searchSymbols(query: string): Promise<SymbolSearchResult[]> {
    if (!query.trim()) return Promise.resolve([]);
    return this.withFallback(`search:${query.trim().toUpperCase()}`, (provider) =>
      provider.searchSymbols(query)
    );
  }

  getQuote(symbol: string): Promise<Quote> {
    return this.withFallback(`quote:${symbol.toUpperCase()}`, (provider) => provider.getQuote(symbol));
  }

  getHistory(symbol: string, range: ChartRange): Promise<HistoricalBar[]> {
    return this.withFallback(`history:${symbol.toUpperCase()}:${range}`, (provider) =>
      provider.getHistory(symbol, range)
    );
  }

  getNews(symbol: string): Promise<NewsItem[]> {
    return this.withFallback(`news:${symbol.toUpperCase()}`, (provider) => provider.getNews(symbol));
  }

  getMarketStatus(): Promise<MarketStatus> {
    return this.withFallback('market-status', (provider) => provider.getMarketStatus());
  }

  private async withFallback<T>(key: string, call: ProviderCall<T>): Promise<T> {
    const cached = this.cache.get(key) as CacheValue<T> | undefined;
    if (cached && cached.expiresAt > Date.now()) {
      return cached.value;
    }

    try {
      const value = await call(this.primary);
      this.status = this.primary.name === this.fallback.name ? 'mock' : 'live';
      this.cache.set(key, { value, expiresAt: Date.now() + this.ttlMs });
      return value;
    } catch (error) {
      console.warn('Primary market provider failed, using fallback data.', error);
      const value = await call(this.fallback);
      this.status = 'fallback';
      this.cache.set(key, { value, expiresAt: Date.now() + Math.min(this.ttlMs, 60_000) });
      return value;
    }
  }
}

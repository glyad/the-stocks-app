import { describe, expect, it, vi } from 'vitest';
import { MarketDataService } from '../src/services/market-data-service';
import type { ChartRange, MarketDataProvider } from '../src/models/market';
import { ProviderUnavailableError } from '../src/models/market';
import { MockMarketDataProvider } from '../src/services/mock-provider';

function failingProvider(): MarketDataProvider {
  return {
    name: 'Failing provider',
    searchSymbols: vi.fn(async () => {
      throw new ProviderUnavailableError('rate limited');
    }),
    getQuote: vi.fn(async () => {
      throw new ProviderUnavailableError('rate limited');
    }),
    getHistory: vi.fn(async () => {
      throw new ProviderUnavailableError('rate limited');
    }),
    getNews: vi.fn(async () => {
      throw new ProviderUnavailableError('rate limited');
    }),
    getMarketStatus: vi.fn(async () => {
      throw new ProviderUnavailableError('rate limited');
    })
  };
}

describe('MarketDataService', () => {
  it('falls back when the primary provider fails', async () => {
    const service = new MarketDataService(failingProvider(), new MockMarketDataProvider());

    const quote = await service.getQuote('AAPL');

    expect(quote.symbol).toBe('AAPL');
    expect(service.status).toBe('fallback');
  });

  it('caches provider results within the TTL', async () => {
    const provider = new MockMarketDataProvider();
    const spy = vi.spyOn(provider, 'getQuote');
    const service = new MarketDataService(provider, provider, 60_000);

    await service.getQuote('MSFT');
    await service.getQuote('MSFT');

    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('uses range-specific cache keys for history', async () => {
    const provider = new MockMarketDataProvider();
    const spy = vi.spyOn(provider, 'getHistory');
    const service = new MarketDataService(provider, provider, 60_000);

    await service.getHistory('NVDA', '1M' as ChartRange);
    await service.getHistory('NVDA', '1Y' as ChartRange);

    expect(spy).toHaveBeenCalledTimes(2);
  });
});

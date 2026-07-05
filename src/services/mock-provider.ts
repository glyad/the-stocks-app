import type { ChartRange, MarketDataProvider, MarketStatus } from '../models/market';
import { getMockHistory, getMockNews, getMockQuote, searchMockSymbols } from '../data/mock-data';

const pointsByRange: Record<ChartRange, number> = {
  '1D': 32,
  '1W': 7,
  '1M': 30,
  '6M': 126,
  '1Y': 252
};

export class MockMarketDataProvider implements MarketDataProvider {
  readonly name = 'Mock market data';

  async searchSymbols(query: string) {
    return searchMockSymbols(query);
  }

  async getQuote(symbol: string) {
    return getMockQuote(symbol);
  }

  async getHistory(symbol: string, range: ChartRange) {
    return getMockHistory(symbol, pointsByRange[range]);
  }

  async getNews(symbol: string) {
    return getMockNews(symbol);
  }

  async getMarketStatus(): Promise<MarketStatus> {
    const now = new Date();
    const day = now.getDay();
    const hour = now.getHours();
    const isWeekday = day > 0 && day < 6;
    const isOpen = isWeekday && hour >= 9 && hour < 16;

    return {
      label: isOpen ? 'US market open' : 'US market closed',
      isOpen,
      updatedAt: now.toISOString()
    };
  }
}

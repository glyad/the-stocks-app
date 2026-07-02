import type { HistoricalBar, NewsItem, Quote, SymbolSearchResult } from '../models/market';

const companies: Record<string, Omit<Quote, 'price' | 'change' | 'changePercent' | 'lastUpdated'>> = {
  AAPL: { symbol: 'AAPL', name: 'Apple Inc.', currency: 'USD', exchange: 'NASDAQ' },
  MSFT: { symbol: 'MSFT', name: 'Microsoft Corporation', currency: 'USD', exchange: 'NASDAQ' },
  NVDA: { symbol: 'NVDA', name: 'NVIDIA Corporation', currency: 'USD', exchange: 'NASDAQ' },
  TSLA: { symbol: 'TSLA', name: 'Tesla, Inc.', currency: 'USD', exchange: 'NASDAQ' },
  AMZN: { symbol: 'AMZN', name: 'Amazon.com, Inc.', currency: 'USD', exchange: 'NASDAQ' },
  GOOGL: { symbol: 'GOOGL', name: 'Alphabet Inc.', currency: 'USD', exchange: 'NASDAQ' },
  META: { symbol: 'META', name: 'Meta Platforms, Inc.', currency: 'USD', exchange: 'NASDAQ' },
  JPM: { symbol: 'JPM', name: 'JPMorgan Chase & Co.', currency: 'USD', exchange: 'NYSE' }
};

const basePrices: Record<string, number> = {
  AAPL: 212.44,
  MSFT: 493.18,
  NVDA: 141.22,
  TSLA: 329.65,
  AMZN: 224.97,
  GOOGL: 183.16,
  META: 701.41,
  JPM: 286.09
};

export const defaultWatchlist = ['AAPL', 'MSFT', 'NVDA', 'TSLA', 'AMZN'];

export function getMockQuote(symbol: string): Quote {
  const normalized = symbol.toUpperCase();
  const company = companies[normalized] ?? {
    symbol: normalized,
    name: `${normalized} Holdings`,
    currency: 'USD',
    exchange: 'NASDAQ'
  };
  const seed = normalized.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const price = basePrices[normalized] ?? 42 + seed * 0.87;
  const wave = Math.sin(seed) * 4.2;
  const change = Number(wave.toFixed(2));
  const changePercent = Number(((change / price) * 100).toFixed(2));

  return {
    ...company,
    price: Number(price.toFixed(2)),
    change,
    changePercent,
    lastUpdated: new Date().toISOString()
  };
}

export function searchMockSymbols(query: string): SymbolSearchResult[] {
  const needle = query.trim().toUpperCase();
  if (!needle) return [];

  return Object.values(companies)
    .filter((company) => company.symbol.includes(needle) || company.name.toUpperCase().includes(needle))
    .map((company) => ({ ...company, region: 'United States' }));
}

export function getMockHistory(symbol: string, points = 90): HistoricalBar[] {
  const quote = getMockQuote(symbol);
  const seed = quote.symbol.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const bars: HistoricalBar[] = [];
  let close = quote.price * 0.78;

  for (let index = points - 1; index >= 0; index -= 1) {
    const date = new Date();
    date.setDate(date.getDate() - index);
    const drift = Math.sin((points - index + seed) / 6) * 2.4 + Math.cos(index / 9) * 1.2;
    const open = close;
    close = Math.max(1, close + drift);
    const high = Math.max(open, close) + Math.abs(Math.sin(index + seed)) * 1.7;
    const low = Math.min(open, close) - Math.abs(Math.cos(index + seed)) * 1.4;

    bars.push({
      timestamp: date.toISOString(),
      open: Number(open.toFixed(2)),
      high: Number(high.toFixed(2)),
      low: Number(low.toFixed(2)),
      close: Number(close.toFixed(2)),
      volume: Math.round(8_000_000 + Math.abs(Math.sin(index + seed)) * 42_000_000)
    });
  }

  return bars;
}

export function getMockNews(symbol: string): NewsItem[] {
  const quote = getMockQuote(symbol);
  const now = Date.now();

  return [
    {
      id: `${symbol}-earnings`,
      title: `${quote.name} leads active trading as investors reassess growth outlook`,
      source: 'Market Desk',
      url: 'https://www.alphavantage.co/',
      summary:
        'Analysts are watching revenue durability, margins, and capital allocation as the market prices in the next reporting cycle.',
      publishedAt: new Date(now - 36 * 60 * 60 * 1000).toISOString(),
      relatedSymbols: [quote.symbol]
    },
    {
      id: `${symbol}-sector`,
      title: `Sector peers move alongside ${quote.symbol} in broad market session`,
      source: 'Exchange Brief',
      url: 'https://www.alphavantage.co/',
      summary:
        'The move follows a mixed session across growth and defensive groups, with volume strongest near the closing hour.',
      publishedAt: new Date(now - 8 * 60 * 60 * 1000).toISOString(),
      relatedSymbols: [quote.symbol]
    },
    {
      id: `${symbol}-macro`,
      title: 'Rates, guidance, and earnings quality remain key themes for large-cap equities',
      source: 'Daily Markets',
      url: 'https://www.alphavantage.co/',
      summary:
        'Portfolio managers continue to weigh valuation against balance-sheet strength and the timing of future rate cuts.',
      publishedAt: new Date(now - 2 * 60 * 60 * 1000).toISOString(),
      relatedSymbols: [quote.symbol]
    }
  ];
}

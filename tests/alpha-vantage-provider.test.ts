import { describe, expect, it, vi } from 'vitest';
import { AlphaVantageProvider } from '../src/services/alpha-vantage-provider';

describe('AlphaVantageProvider', () => {
  it('normalizes global quote responses', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: true,
        json: async () => ({
          'Global Quote': {
            '01. symbol': 'AAPL',
            '05. price': '212.4400',
            '07. latest trading day': '2026-07-02',
            '09. change': '1.2300',
            '10. change percent': '0.5823%'
          }
        })
      }))
    );

    const provider = new AlphaVantageProvider('demo-key');
    const quote = await provider.getQuote('AAPL');

    expect(quote).toMatchObject({
      symbol: 'AAPL',
      price: 212.44,
      change: 1.23,
      changePercent: 0.5823
    });
  });

  it('throws when no API key is configured', async () => {
    const provider = new AlphaVantageProvider('');

    await expect(provider.getQuote('AAPL')).rejects.toThrow('API key');
  });
});

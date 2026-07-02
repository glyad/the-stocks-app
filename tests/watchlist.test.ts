import { describe, expect, it } from 'vitest';
import { addSymbol, removeSymbol } from '../src/state/watchlist';

describe('watchlist state helpers', () => {
  it('adds normalized symbols once', () => {
    expect(addSymbol(['AAPL'], ' msft ')).toEqual(['AAPL', 'MSFT']);
    expect(addSymbol(['AAPL'], 'aapl')).toEqual(['AAPL']);
  });

  it('removes symbols by normalized value', () => {
    expect(removeSymbol(['AAPL', 'MSFT'], ' aapl ')).toEqual(['MSFT']);
  });
});

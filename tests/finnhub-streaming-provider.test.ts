import { describe, expect, it, vi } from 'vitest';
import { FinnhubStreamingProvider } from '../src/services/finnhub-streaming-provider';

class MockWebSocket extends EventTarget {
  static instances: MockWebSocket[] = [];
  static OPEN = 1;

  readyState = MockWebSocket.OPEN;
  sent: string[] = [];

  constructor(public readonly url: string) {
    super();
    MockWebSocket.instances.push(this);
  }

  send(message: string) {
    this.sent.push(message);
  }

  close() {
    this.readyState = 3;
    this.dispatchEvent(new Event('close'));
  }

  open() {
    this.dispatchEvent(new Event('open'));
  }

  emitMessage(data: unknown) {
    this.dispatchEvent(new MessageEvent('message', { data: JSON.stringify(data) }));
  }
}

describe('FinnhubStreamingProvider', () => {
  it('subscribes symbols and normalizes trade messages', () => {
    vi.stubGlobal('WebSocket', MockWebSocket);
    MockWebSocket.instances = [];
    const provider = new FinnhubStreamingProvider('stream-key');
    const onQuote = vi.fn();
    const onStatus = vi.fn();

    const unsubscribe = provider.subscribeQuotes(['aapl', 'MSFT'], onQuote, onStatus);
    const socket = MockWebSocket.instances[0];
    socket.open();
    socket.emitMessage({
      type: 'trade',
      data: [{ s: 'AAPL', p: 212.45, t: 1_720_000_000_000, v: 100 }]
    });

    expect(socket.url).toBe('wss://ws.finnhub.io?token=stream-key');
    expect(socket.sent).toContain(JSON.stringify({ type: 'subscribe', symbol: 'AAPL' }));
    expect(socket.sent).toContain(JSON.stringify({ type: 'subscribe', symbol: 'MSFT' }));
    expect(onStatus).toHaveBeenCalledWith('connected', 'Streaming 2 symbols.');
    expect(onQuote).toHaveBeenCalledWith({
      symbol: 'AAPL',
      price: 212.45,
      timestamp: new Date(1_720_000_000_000).toISOString(),
      volume: 100
    });

    unsubscribe();
  });

  it('reports disabled state without a key', () => {
    const provider = new FinnhubStreamingProvider('');
    const onStatus = vi.fn();

    provider.subscribeQuotes(['AAPL'], vi.fn(), onStatus);

    expect(onStatus).toHaveBeenCalledWith('disabled', 'Finnhub WebSocket key is not configured.');
  });
});

import type {
  QuoteStreamProvider,
  QuoteStreamUnsubscribe,
  StreamStatusHandler,
  StreamingQuoteHandler
} from '../models/market';

type FinnhubTrade = {
  s?: unknown;
  p?: unknown;
  t?: unknown;
  v?: unknown;
};

type FinnhubMessage = {
  type?: unknown;
  data?: unknown;
  msg?: unknown;
};

const finnhubSocketUrl = 'wss://ws.finnhub.io';

export class FinnhubStreamingProvider implements QuoteStreamProvider {
  readonly name = 'Finnhub WebSocket';

  constructor(private readonly apiKey: string | null) {}

  get configured() {
    return Boolean(this.apiKey?.trim());
  }

  subscribeQuotes(
    symbols: string[],
    onQuote: StreamingQuoteHandler,
    onStatus?: StreamStatusHandler
  ): QuoteStreamUnsubscribe {
    const normalizedSymbols = [...new Set(symbols.map((symbol) => symbol.trim().toUpperCase()).filter(Boolean))];

    if (!this.configured || normalizedSymbols.length === 0) {
      onStatus?.('disabled', 'Finnhub WebSocket key is not configured.');
      return () => undefined;
    }

    let closedByClient = false;
    const socket = new WebSocket(`${finnhubSocketUrl}?token=${encodeURIComponent(this.apiKey?.trim() ?? '')}`);

    onStatus?.('connecting', 'Connecting to Finnhub WebSocket.');

    socket.addEventListener('open', () => {
      for (const symbol of normalizedSymbols) {
        socket.send(JSON.stringify({ type: 'subscribe', symbol }));
      }
      onStatus?.('connected', `Streaming ${normalizedSymbols.length} symbol${normalizedSymbols.length === 1 ? '' : 's'}.`);
    });

    socket.addEventListener('message', (event) => {
      const payload = parseMessage(event.data);
      if (!payload) return;

      if (payload.type === 'error') {
        onStatus?.('error', stringValue(payload.msg, 'Finnhub WebSocket error.'));
        return;
      }

      if (payload.type !== 'trade' || !Array.isArray(payload.data)) return;

      for (const item of payload.data.filter(isRecord)) {
        const update = normalizeTrade(item);
        if (update) onQuote(update);
      }
    });

    socket.addEventListener('error', () => {
      onStatus?.('error', 'Finnhub WebSocket connection failed.');
    });

    socket.addEventListener('close', () => {
      if (!closedByClient) {
        onStatus?.('fallback', 'Finnhub WebSocket closed; showing last cached quote data.');
      }
    });

    return () => {
      closedByClient = true;
      if (socket.readyState === WebSocket.OPEN) {
        for (const symbol of normalizedSymbols) {
          socket.send(JSON.stringify({ type: 'unsubscribe', symbol }));
        }
      }
      socket.close();
    };
  }
}

function parseMessage(data: unknown): FinnhubMessage | null {
  if (typeof data !== 'string') return null;

  try {
    const parsed = JSON.parse(data) as unknown;
    return isRecord(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function normalizeTrade(trade: FinnhubTrade) {
  const symbol = stringValue(trade.s).toUpperCase();
  const price = numberValue(trade.p);
  if (!symbol || price <= 0) return null;

  return {
    symbol,
    price,
    timestamp: new Date(numberValue(trade.t) || Date.now()).toISOString(),
    volume: numberValue(trade.v)
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function stringValue(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

function numberValue(value: unknown): number {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') return Number(value) || 0;
  return 0;
}

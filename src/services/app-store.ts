import { defaultWatchlist } from '../data/mock-data';
import type { ChartRange } from '../models/market';

export interface AppSettings {
  watchlist: string[];
  selectedSymbol: string;
  chartRange: ChartRange;
  apiKey: string;
  streamApiKey: string;
  theme: 'dark' | 'light';
}

export const defaultSettings: AppSettings = {
  watchlist: defaultWatchlist,
  selectedSymbol: defaultWatchlist[0],
  chartRange: '1M',
  apiKey: '',
  streamApiKey: '',
  theme: 'dark'
};

type StoreLike = {
  get<T>(key: string): Promise<T | undefined>;
  set(key: string, value: unknown): Promise<void>;
  save?: () => Promise<void>;
};

export class PersistentAppStore {
  private storePromise: Promise<StoreLike> | null = null;

  async load(): Promise<AppSettings> {
    const store = await this.getStore();
    const saved = await store.get<Partial<AppSettings>>('settings');
    return normalizeSettings(saved);
  }

  async save(settings: AppSettings) {
    const store = await this.getStore();
    await store.set('settings', normalizeSettings(settings));
    await store.save?.();
  }

  private async getStore(): Promise<StoreLike> {
    if (!this.storePromise) {
      this.storePromise = createStore();
    }

    return this.storePromise;
  }
}

function normalizeSettings(value: Partial<AppSettings> | undefined): AppSettings {
  const watchlist = Array.isArray(value?.watchlist) && value.watchlist.length > 0
    ? value.watchlist.map((symbol) => symbol.toUpperCase())
    : defaultSettings.watchlist;

  const selectedSymbol = value?.selectedSymbol && watchlist.includes(value.selectedSymbol.toUpperCase())
    ? value.selectedSymbol.toUpperCase()
    : watchlist[0];

  return {
    watchlist,
    selectedSymbol,
    chartRange: value?.chartRange ?? defaultSettings.chartRange,
    apiKey: value?.apiKey ?? '',
    streamApiKey: value?.streamApiKey ?? '',
    theme: value?.theme ?? defaultSettings.theme
  };
}

async function createStore(): Promise<StoreLike> {
  if ('__TAURI_INTERNALS__' in window) {
    const mod = await import('@tauri-apps/plugin-store');
    return mod.load('settings.json', { autoSave: 500, defaults: {} });
  }

  return new LocalStorageStore();
}

class LocalStorageStore implements StoreLike {
  async get<T>(key: string): Promise<T | undefined> {
    const value = localStorage.getItem(`the-stocks-app:${key}`);
    return value ? (JSON.parse(value) as T) : undefined;
  }

  async set(key: string, value: unknown): Promise<void> {
    localStorage.setItem(`the-stocks-app:${key}`, JSON.stringify(value));
  }
}

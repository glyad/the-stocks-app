# The Stocks App

A cross-platform Tauri desktop app inspired by the macOS Stocks experience. It uses Tauri v2, Vite, Lit, TypeScript, and Ignite UI for Web Components.

## Development

```bash
npm install
npm run dev
```

To run the desktop shell:

```bash
npm run tauri dev
```

## Market Data

The app uses a swappable market data provider. Alpha Vantage is the first live provider, and mock data is always available as a fallback for missing keys, network errors, and free-tier rate limits.

Enter an Alpha Vantage API key from the app settings panel. Keys are persisted locally through Tauri Store when running in the desktop shell, with `localStorage` as a browser development fallback.

## License Notes

Ignite UI for Web Components trial packages are used for development. Upgrade to licensed packages before distributing an app that uses premium Infragistics components.

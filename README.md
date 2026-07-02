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

## Quality Gates

```bash
npm run lint
npm run typecheck
npm run test
npm run build
npm run check
```

Commits use Conventional Commits and are checked by Commitlint through Husky. The expected Git Flow is:

```text
main -> develop -> feature/*
```

## Versioning and Releases

The project uses semantic versioning through `semantic-release`.

- `main` publishes stable releases and tags such as `v1.2.3`.
- `develop` publishes prereleases such as `v1.3.0-beta.1`.
- Feature branches do not publish releases.

Useful commands:

```bash
npm run release:dry-run
npm run release
```

GitHub publishing is configured in `.github/workflows/release.yml`. The workflow validates the app, builds the Tauri bundle, and publishes a GitHub release with generated notes.

`semantic-release` requires a configured GitHub remote, or an explicit `repositoryUrl`, before local dry-runs can complete. This repository currently expects the standard `origin` remote to provide that value.

During release preparation, `scripts/sync-version.mjs` keeps the Tauri package version aligned with the semantic-release version.

## Market Data

The app uses a swappable market data provider. Alpha Vantage is the first live provider, and mock data is always available as a fallback for missing keys, network errors, and free-tier rate limits.

Enter an Alpha Vantage API key from the app settings panel. Keys are persisted locally through Tauri Store when running in the desktop shell, with `localStorage` as a browser development fallback.

## License Notes

Ignite UI for Web Components trial packages are used for development. Upgrade to licensed packages before distributing an app that uses premium Infragistics components.

## Infragistics Tooling

The app depends on Ignite UI for Web Components packages. No Infragistics MCP server or Codex skill is available in this workspace, so there is no active MCP connection to configure here. If an Infragistics MCP server becomes available, add it to the Codex MCP configuration and document the server name and required credentials in this section.

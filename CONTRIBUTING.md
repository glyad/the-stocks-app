# Contributing

Thanks for improving The Stocks App.

## Workflow

- Use Git Flow: branch from `develop` into `feature/<short-name>`.
- Use Conventional Commits, for example `feat: add provider status panel`.
- Open draft pull requests early and move them to ready for review after validation passes.
- Link every meaningful feature or fix to a GitHub issue.

## Local Validation

Run these checks before requesting review:

```bash
npm run check
npm run test:e2e
cargo check --manifest-path src-tauri/Cargo.toml --locked
```

For UI changes, verify both desktop and narrow desktop layouts.

## Product Standard

- Keep the app usable without live API keys through mock fallback data.
- Prefer real rendered validation for visual components, especially charts.
- Avoid Apple branding, assets, names, or logos. The app is stocks-inspired, not an Apple clone.
- Consider modern alternatives when they reduce risk or improve user value.

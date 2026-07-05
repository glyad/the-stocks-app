# Security Policy

## Supported Versions

The project is pre-1.0. Security fixes target the active `develop` branch until the first stable release.

## Reporting A Vulnerability

Please report suspected vulnerabilities privately to the repository owner instead of opening a public issue.

Include:

- affected version or commit
- reproduction steps
- expected impact
- relevant logs or screenshots with secrets removed

## Secrets

Do not commit API keys or provider tokens. Alpha Vantage and Finnhub keys must be entered by users at runtime and stored locally through the app settings flow.

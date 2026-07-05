# Project Rules

These rules guide future work on The Stocks App.

## Collaboration

- Be creative by default: propose modern, pragmatic alternatives when they could improve the result.
- When there are materially different implementation paths, ask before choosing unless one option is clearly safer or required to unblock work.
- Explain tradeoffs in product and engineering terms, not only technical terms.
- Keep execution practical: once a direction is chosen, implement, verify, and summarize the outcome.

## Product Management

- Capture larger work as GitHub issues before implementation when a GitHub repository is available.
- Write issues with a clear problem statement, goals, non-goals, task checklist, acceptance criteria, dependencies, and validation plan.
- Use labels and assignment when repository configuration permits it.
- Keep user value visible in every feature issue.

## Development Management

- Follow Git Flow conventions: `main` for stable releases, `develop` for integration, and `feature/*` for feature work.
- Use conventional commits and semantic versioning.
- Publish versions only from `main`; merging into `develop` must run validation but must not produce a semantic-release version or release artifact.
- Open draft pull requests for feature branches until validation and review are complete.
- Link pull requests to their planning issue using closing keywords or explicit references.
- Include scope, implementation notes, testing, risks, and rollout notes in PR descriptions.

## Engineering

- Prefer existing project patterns before introducing new abstractions.
- Keep changes scoped to the requested behavior unless a broader fix is necessary.
- Use TypeScript, linting, tests, and Playwright smoke coverage for user-visible UI behavior.
- For charts and UI components, validate both DOM presence and meaningful rendered output.
- Do not commit secrets, API keys, generated debug screenshots, or local-only artifacts.

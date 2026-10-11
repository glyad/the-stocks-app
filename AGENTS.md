# Repository instructions

## Superpowers

Superpowers is enabled by default for this repository. This is explicit project authorization to apply relevant Superpowers workflows automatically, including the using-superpowers startup guidance. This authorization applies only within this repository; other repositories retain the user’s opt-in preference. Follow explicit user instructions when they override a workflow.

Prefer this repository's editable skills in `.agents/skills/superpowers-*/SKILL.md` over the globally installed plugin. Map requests for `superpowers:<name>` to the local `superpowers-<name>` skill. Read the selected skill before applying it and resolve supporting files relative to that local skill directory. Use its local prompt templates when a workflow calls for an implementer or reviewer. Repository copies do not grant authorization to message other chats or perform unrelated external actions.

See `.agents/superpowers/README.md` for customization and upstream version information.

## Git workflow

Start work branches from `develop` and integrate completed work back into `develop`. Use the branch name requested by the user; default feature branches use `feature/*`. Do not commit directly to `main` or `develop`. Use Conventional Commit messages.

## Git and GitHub skills

Use the repository-local Universal Dev Standards skills for relevant operations:

- `.agents/skills/commit-standards/SKILL.md` (skill name `commit`) for Conventional Commit messages.
- `.agents/skills/git-workflow-guide/SKILL.md` for branches, pull requests, and merges.
- `.agents/skills/checkin-assistant/SKILL.md` (skill name `checkin`) for pre-commit quality-gate reference.

The Git Flow strategy is already configured above: routine work starts from `develop` and returns to `develop`. This takes precedence over upstream examples or defaults that branch from `main`; no workflow-selection question is needed. Use English commit messages by default and preserve an exact message supplied by the user. Apply check-in guidance in conjunction with existing repository hooks and checks; the reference skill does not install an enforcement toolchain. Skills do not grant permission for GitHub mutations beyond the user's request.

See `.agents/universal-dev-standards/README.md` for installed names, source attribution, and maintenance.

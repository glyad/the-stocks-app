# Infragistics AI Tooling

This project is configured for the official Ignite UI for Web Components AI workflow:

- Ignite UI CLI MCP: `npx -y igniteui-cli mcp`
- Ignite UI Theming MCP: `npx -y igniteui-theming igniteui-theming-mcp`
- Agent skills: copied from `node_modules/igniteui-webcomponents/skills` into `.github/skills/infragistics`

Project-scoped MCP files are included for common clients:

- `.vscode/mcp.json` for VS Code GitHub Copilot Agent mode
- `.cursor/mcp.json` for Cursor
- `.mcp.json` for Claude Code-compatible clients

For GitHub Copilot cloud agent, add this JSON in the repository settings under Copilot > Cloud agent:

```json
{
  "mcpServers": {
    "igniteui-cli": {
      "type": "local",
      "command": "npx",
      "args": ["-y", "igniteui-cli", "mcp"],
      "tools": ["*"]
    },
    "igniteui-theming": {
      "type": "local",
      "command": "npx",
      "args": ["-y", "igniteui-theming", "igniteui-theming-mcp"],
      "tools": ["*"]
    }
  }
}
```

After opening the project in a supported AI client, restart or reload the client so it discovers the MCP configuration.

This Codex workspace exposes `.agents` as read-only, so the repository copy of the Infragistics skills lives under `.github/skills/infragistics`.

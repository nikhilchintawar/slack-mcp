# Slack MCP Server

A Model Context Protocol (MCP) server for searching Slack channels and messages.

## Features

- **list_channels** - List available Slack channels in the workspace
- **search_messages** - Search for messages across channels using Slack's search syntax
- **get_channel_history** - Get message history from a specific channel

## Installation

### Using npx (Recommended)

No installation required. Add directly to your config:

**Claude Desktop** (`~/Library/Application Support/Claude/claude_desktop_config.json` on macOS):

```json
{
  "mcpServers": {
    "slack": {
      "command": "npx",
      "args": ["-y", "github:nikhilchintawar/slack-mcp"],
      "env": {
        "SLACK_BOT_TOKEN": "xoxb-your-token-here"
      }
    }
  }
}
```

**Claude Code** (`~/.claude/settings.json`):

```json
{
  "mcpServers": {
    "slack": {
      "command": "npx",
      "args": ["-y", "github:nikhilchintawar/slack-mcp"],
      "env": {
        "SLACK_BOT_TOKEN": "xoxb-your-token-here"
      }
    }
  }
}
```

### Manual Installation

```bash
# Clone the repository
git clone https://github.com/nikhilchintawar/slack-mcp.git
cd slack-mcp

# Install dependencies
npm install

# Build
npm run build
```

Then add to your config:

```json
{
  "mcpServers": {
    "slack": {
      "command": "node",
      "args": ["/absolute/path/to/slack-mcp/build/index.js"],
      "env": {
        "SLACK_BOT_TOKEN": "xoxb-your-token-here"
      }
    }
  }
}
```

## Configuration

### Config File Locations

- **Claude Desktop (macOS):** `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Claude Desktop (Windows):** `%APPDATA%\Claude\claude_desktop_config.json`
- **Claude Code:** `~/.claude/settings.json`

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `SLACK_BOT_TOKEN` | Yes | Slack Bot User OAuth Token |
| `SLACK_DEFAULT_CHANNEL` | No | Default channel ID for operations |

### Slack App Setup

1. Create a Slack App at https://api.slack.com/apps
2. Go to "OAuth & Permissions"
3. Add the following Bot Token Scopes:
   - `channels:read` - List public channels
   - `channels:history` - Read messages from public channels
   - `search:read` - Search messages and files
   - `groups:read` - List private channels (optional)
   - `groups:history` - Read messages from private channels (optional)
4. Install the app to your workspace
5. Copy the "Bot User OAuth Token" (starts with `xoxb-`)

## Usage Examples

Once configured, you can use natural language to interact with Slack:

- "List all channels in my Slack workspace"
- "Search for messages about deployment in #engineering"
- "Show me the last 50 messages from #general"
- "Find messages from @john about the API"
- "Search for error messages from last week"

## Available Tools

### `list_channels`

List available Slack channels in the workspace.

| Parameter | Required | Description |
|-----------|----------|-------------|
| `includePrivate` | No | Include private channels (default: false) |
| `includeArchived` | No | Include archived channels (default: false) |
| `limit` | No | Max results (default: 100, max: 1000) |

### `search_messages`

Search for messages across Slack channels using query syntax.

| Parameter | Required | Description |
|-----------|----------|-------------|
| `query` | Yes | Search query string |
| `channel` | No | Channel ID or name to search in |
| `from` | No | Filter by sender username |
| `after` | No | Search messages after date (YYYY-MM-DD) |
| `before` | No | Search messages before date (YYYY-MM-DD) |
| `limit` | No | Max results (default: 20, max: 100) |
| `sortBy` | No | `relevance` or `timestamp` (default: relevance) |
| `sortDir` | No | `asc` or `desc` (default: desc) |

### `get_channel_history`

Get message history from a specific Slack channel.

| Parameter | Required | Description |
|-----------|----------|-------------|
| `channel` | No | Channel ID (uses env var default) |
| `oldest` | No | Start time (Unix timestamp or ISO date) |
| `latest` | No | End time (Unix timestamp or ISO date) |
| `limit` | No | Max results (default: 100, max: 1000) |
| `includeThreadReplies` | No | Include thread replies (default: false) |

## Development

```bash
# Watch mode for development
npm run dev

# Build for production
npm run build

# Test with MCP Inspector
SLACK_BOT_TOKEN=xoxb-your-token \
  npx @modelcontextprotocol/inspector node build/index.js
```

## License

MIT

#!/usr/bin/env node

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

import {
  listChannelsSchema,
  listChannels,
} from './tools/list-channels.js';
import {
  searchMessagesSchema,
  searchMessages,
} from './tools/search-messages.js';
import {
  getChannelHistorySchema,
  getChannelHistory,
} from './tools/get-channel-history.js';

const server = new McpServer({
  name: 'slack-mcp',
  version: '1.0.0',
});

// Register list_channels tool
server.tool(
  'list_channels',
  'List available Slack channels in the workspace',
  listChannelsSchema.shape,
  async (args) => {
    try {
      const result = await listChannels(listChannelsSchema.parse(args));
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return {
        content: [{ type: 'text', text: `Error listing channels: ${message}` }],
        isError: true,
      };
    }
  }
);

// Register search_messages tool
server.tool(
  'search_messages',
  'Search for messages across Slack channels using query syntax',
  searchMessagesSchema.shape,
  async (args) => {
    try {
      const result = await searchMessages(searchMessagesSchema.parse(args));
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return {
        content: [
          { type: 'text', text: `Error searching messages: ${message}` },
        ],
        isError: true,
      };
    }
  }
);

// Register get_channel_history tool
server.tool(
  'get_channel_history',
  'Get message history from a specific Slack channel',
  getChannelHistorySchema.shape,
  async (args) => {
    try {
      const result = await getChannelHistory(getChannelHistorySchema.parse(args));
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return {
        content: [
          { type: 'text', text: `Error fetching channel history: ${message}` },
        ],
        isError: true,
      };
    }
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error('Failed to start Slack MCP server:', error);
  process.exit(1);
});

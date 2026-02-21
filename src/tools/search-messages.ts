import { z } from 'zod';
import { getSlackClient } from '../utils/slack-client.js';
import { getAllowedChannelsForSearch, validateChannel } from '../utils/config.js';
import type { SearchResult, SlackMessage } from '../types.js';

export const searchMessagesSchema = z.object({
  query: z.string().min(1).describe('Search query string'),
  channel: z
    .string()
    .optional()
    .describe('Channel ID or name to search in (e.g., C1234567890 or general)'),
  from: z.string().optional().describe('Filter by sender username'),
  after: z
    .string()
    .optional()
    .describe('Search messages after this date (YYYY-MM-DD)'),
  before: z
    .string()
    .optional()
    .describe('Search messages before this date (YYYY-MM-DD)'),
  limit: z
    .number()
    .min(1)
    .max(100)
    .default(20)
    .describe('Maximum number of messages to return'),
  sortBy: z
    .enum(['relevance', 'timestamp'])
    .default('relevance')
    .describe('Sort order for results'),
  sortDir: z
    .enum(['asc', 'desc'])
    .default('desc')
    .describe('Sort direction'),
});

export type SearchMessagesInput = z.infer<typeof searchMessagesSchema>;

interface SlackSearchMatch {
  ts: string;
  text: string;
  user?: string;
  username?: string;
  channel?: { id?: string; name?: string };
  permalink?: string;
}

function mapMessage(match: SlackSearchMatch): SlackMessage {
  const ts = match.ts;
  const timestamp = parseFloat(ts) * 1000;

  return {
    ts,
    text: match.text,
    user: match.user,
    username: match.username,
    channel: match.channel?.id,
    channelName: match.channel?.name,
    timestamp,
    permalink: match.permalink,
  };
}

function buildSearchQuery(input: SearchMessagesInput, channels?: string[]): string {
  const parts: string[] = [input.query];

  // If specific channel provided, validate and use it
  if (input.channel) {
    const validatedChannel = validateChannel(input.channel);
    if (validatedChannel) {
      parts.push(`in:${validatedChannel}`);
    }
  } else if (channels && channels.length > 0) {
    // If no channel specified but allowed channels configured, search all allowed channels
    for (const channel of channels) {
      parts.push(`in:${channel}`);
    }
  }

  if (input.from) {
    parts.push(`from:${input.from}`);
  }
  if (input.after) {
    parts.push(`after:${input.after}`);
  }
  if (input.before) {
    parts.push(`before:${input.before}`);
  }

  return parts.join(' ');
}

export async function searchMessages(
  input: SearchMessagesInput
): Promise<SearchResult> {
  const client = getSlackClient();
  const allowedChannels = getAllowedChannelsForSearch();
  const query = buildSearchQuery(input, allowedChannels);

  const response = await client.search.messages({
    query,
    count: input.limit,
    sort: input.sortBy === 'relevance' ? 'score' : 'timestamp',
    sort_dir: input.sortDir,
  });

  const messages: SlackMessage[] = [];
  const matches = response.messages?.matches ?? [];

  for (const match of matches) {
    messages.push(mapMessage(match as SlackSearchMatch));
  }

  return {
    query,
    total: response.messages?.total ?? 0,
    messages,
  };
}

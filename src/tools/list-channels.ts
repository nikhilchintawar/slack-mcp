import { z } from 'zod';
import { getSlackClient } from '../utils/slack-client.js';
import type { SlackChannel } from '../types.js';

export const listChannelsSchema = z.object({
  includePrivate: z
    .boolean()
    .default(false)
    .describe('Include private channels (requires appropriate scopes)'),
  includeArchived: z
    .boolean()
    .default(false)
    .describe('Include archived channels'),
  limit: z
    .number()
    .min(1)
    .max(1000)
    .default(100)
    .describe('Maximum number of channels to return'),
});

export type ListChannelsInput = z.infer<typeof listChannelsSchema>;

interface SlackChannelResponse {
  id: string;
  name: string;
  is_private?: boolean;
  is_archived?: boolean;
  topic?: { value?: string };
  purpose?: { value?: string };
  num_members?: number;
  created?: number;
}

function mapChannel(channel: SlackChannelResponse): SlackChannel {
  return {
    id: channel.id,
    name: channel.name,
    isPrivate: channel.is_private ?? false,
    isArchived: channel.is_archived ?? false,
    topic: channel.topic?.value,
    purpose: channel.purpose?.value,
    memberCount: channel.num_members,
    createdAt: channel.created,
  };
}

export async function listChannels(
  input: ListChannelsInput
): Promise<SlackChannel[]> {
  const client = getSlackClient();
  const channels: SlackChannel[] = [];
  let cursor: string | undefined;

  const types = input.includePrivate
    ? 'public_channel,private_channel'
    : 'public_channel';

  do {
    const response = await client.conversations.list({
      types,
      exclude_archived: !input.includeArchived,
      limit: Math.min(input.limit - channels.length, 200),
      cursor,
    });

    if (response.channels) {
      for (const channel of response.channels) {
        if (channels.length >= input.limit) break;
        channels.push(mapChannel(channel as SlackChannelResponse));
      }
    }

    cursor = response.response_metadata?.next_cursor;
  } while (cursor && channels.length < input.limit);

  return channels;
}

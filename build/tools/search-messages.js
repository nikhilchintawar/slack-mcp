import { z } from 'zod';
import { getSlackClient } from '../utils/slack-client.js';
import { getAllowedChannelsForSearch, validateChannel } from '../utils/config.js';
export const searchMessagesSchema = z.object({
    query: z.string().min(1).describe('Search query string (case-insensitive text match)'),
    channel: z
        .string()
        .optional()
        .describe('Channel ID or name to search in. If not provided, searches all configured SLACK_CHANNELS.'),
    after: z
        .string()
        .optional()
        .describe('Search messages after this date/time (YYYY-MM-DD or ISO 8601)'),
    before: z
        .string()
        .optional()
        .describe('Search messages before this date/time (YYYY-MM-DD or ISO 8601)'),
    limit: z
        .number()
        .min(1)
        .max(100)
        .default(20)
        .describe('Maximum number of matching messages to return'),
});
function parseTimestamp(value) {
    if (/^\d+(\.\d+)?$/.test(value)) {
        return value;
    }
    const date = new Date(value);
    if (!isNaN(date.getTime())) {
        return (date.getTime() / 1000).toString();
    }
    throw new Error(`Invalid timestamp format: ${value}`);
}
function matchesQuery(text, query) {
    const lowerText = text.toLowerCase();
    const lowerQuery = query.toLowerCase();
    // Support simple OR queries with |
    if (lowerQuery.includes('|')) {
        const terms = lowerQuery.split('|').map((t) => t.trim());
        return terms.some((term) => lowerText.includes(term));
    }
    // Support AND queries with multiple words
    const terms = lowerQuery.split(/\s+/).filter(Boolean);
    return terms.every((term) => lowerText.includes(term));
}
function mapMessage(msg, channelId, channelName) {
    const ts = msg.ts;
    const timestamp = parseFloat(ts) * 1000;
    return {
        ts,
        text: msg.text ?? '',
        user: msg.user,
        channel: channelId,
        channelName,
        timestamp,
        threadTs: msg.thread_ts,
        replyCount: msg.reply_count,
    };
}
async function searchInChannel(client, channelId, channelName, query, oldest, latest, limit) {
    const messages = [];
    let cursor;
    const maxMessages = limit ?? 20;
    const params = {
        channel: channelId,
        limit: 200, // Fetch more to filter
    };
    if (oldest) {
        params.oldest = parseTimestamp(oldest);
    }
    if (latest) {
        params.latest = parseTimestamp(latest);
    }
    // Fetch up to 1000 messages max to search through
    let totalFetched = 0;
    const maxFetch = 1000;
    do {
        if (cursor) {
            params.cursor = cursor;
        }
        const response = await client.conversations.history(params);
        if (response.messages) {
            for (const msg of response.messages) {
                totalFetched++;
                const histMsg = msg;
                if (histMsg.text && matchesQuery(histMsg.text, query)) {
                    messages.push(mapMessage(histMsg, channelId, channelName));
                    if (messages.length >= maxMessages) {
                        return messages;
                    }
                }
            }
        }
        cursor = response.response_metadata?.next_cursor;
    } while (cursor && messages.length < maxMessages && totalFetched < maxFetch);
    return messages;
}
async function resolveChannelId(client, channelNameOrId) {
    // If it looks like a channel ID, use it directly
    if (channelNameOrId.startsWith('C') || channelNameOrId.startsWith('G')) {
        try {
            const info = await client.conversations.info({ channel: channelNameOrId });
            if (info.channel) {
                return {
                    id: channelNameOrId,
                    name: info.channel.name ?? channelNameOrId,
                };
            }
        }
        catch {
            // Fall through to name lookup
        }
    }
    // Otherwise, try to find by name
    const cleanName = channelNameOrId.replace(/^#/, '');
    let cursor;
    do {
        const response = await client.conversations.list({
            types: 'public_channel,private_channel',
            limit: 200,
            cursor,
        });
        if (response.channels) {
            for (const channel of response.channels) {
                if (channel.name === cleanName && channel.id) {
                    return { id: channel.id, name: channel.name };
                }
            }
        }
        cursor = response.response_metadata?.next_cursor;
    } while (cursor);
    return null;
}
export async function searchMessages(input) {
    const client = getSlackClient();
    const allowedChannels = getAllowedChannelsForSearch();
    // Determine which channels to search
    let channelsToSearch = [];
    if (input.channel) {
        // Validate and resolve single channel
        validateChannel(input.channel);
        const resolved = await resolveChannelId(client, input.channel);
        if (!resolved) {
            throw new Error(`Channel not found: ${input.channel}`);
        }
        channelsToSearch = [resolved];
    }
    else if (allowedChannels && allowedChannels.length > 0) {
        // Search all allowed channels
        for (const ch of allowedChannels) {
            const resolved = await resolveChannelId(client, ch);
            if (resolved) {
                channelsToSearch.push(resolved);
            }
        }
    }
    else {
        throw new Error('No channel specified and SLACK_CHANNELS not configured. ' +
            'Provide a channel parameter or set SLACK_CHANNELS environment variable.');
    }
    if (channelsToSearch.length === 0) {
        throw new Error('No valid channels found to search.');
    }
    // Search each channel and combine results
    const allMessages = [];
    const perChannelLimit = Math.ceil(input.limit / channelsToSearch.length);
    for (const channel of channelsToSearch) {
        if (allMessages.length >= input.limit)
            break;
        const remaining = input.limit - allMessages.length;
        const messages = await searchInChannel(client, channel.id, channel.name, input.query, input.after, input.before, Math.min(perChannelLimit, remaining));
        allMessages.push(...messages);
    }
    // Sort by timestamp descending
    allMessages.sort((a, b) => b.timestamp - a.timestamp);
    // Trim to limit
    const results = allMessages.slice(0, input.limit);
    return {
        query: input.query,
        total: results.length,
        messages: results,
    };
}
//# sourceMappingURL=search-messages.js.map
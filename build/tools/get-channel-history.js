import { z } from 'zod';
import { getSlackClient } from '../utils/slack-client.js';
import { getConfig } from '../utils/config.js';
export const getChannelHistorySchema = z.object({
    channel: z
        .string()
        .optional()
        .describe('Channel ID to fetch history from. Uses SLACK_DEFAULT_CHANNEL if not provided.'),
    oldest: z
        .string()
        .optional()
        .describe('Start of time range (Unix timestamp or ISO date)'),
    latest: z
        .string()
        .optional()
        .describe('End of time range (Unix timestamp or ISO date)'),
    limit: z
        .number()
        .min(1)
        .max(1000)
        .default(100)
        .describe('Maximum number of messages to return'),
    includeThreadReplies: z
        .boolean()
        .default(false)
        .describe('Include thread reply messages'),
});
function parseTimestamp(value) {
    // If already a Unix timestamp
    if (/^\d+(\.\d+)?$/.test(value)) {
        return value;
    }
    // Try to parse as date
    const date = new Date(value);
    if (!isNaN(date.getTime())) {
        return (date.getTime() / 1000).toString();
    }
    throw new Error(`Invalid timestamp format: ${value}`);
}
function mapMessage(msg, channelId) {
    const ts = msg.ts;
    const timestamp = parseFloat(ts) * 1000;
    return {
        ts,
        text: msg.text ?? '',
        user: msg.user,
        channel: channelId,
        timestamp,
        threadTs: msg.thread_ts,
        replyCount: msg.reply_count,
    };
}
export async function getChannelHistory(input) {
    const client = getSlackClient();
    const config = getConfig();
    const channelId = input.channel ?? config.defaultChannel;
    if (!channelId) {
        throw new Error('Channel ID is required. Provide it as a parameter or set SLACK_DEFAULT_CHANNEL.');
    }
    const messages = [];
    let cursor;
    let hasMore = false;
    const params = {
        channel: channelId,
        limit: Math.min(input.limit, 200),
        include_all_metadata: true,
    };
    if (input.oldest) {
        params.oldest = parseTimestamp(input.oldest);
    }
    if (input.latest) {
        params.latest = parseTimestamp(input.latest);
    }
    do {
        if (cursor) {
            params.cursor = cursor;
        }
        const response = await client.conversations.history(params);
        if (response.messages) {
            for (const msg of response.messages) {
                if (messages.length >= input.limit) {
                    hasMore = true;
                    break;
                }
                messages.push(mapMessage(msg, channelId));
            }
        }
        hasMore = response.has_more ?? false;
        cursor = response.response_metadata?.next_cursor;
    } while (cursor && messages.length < input.limit);
    // Optionally fetch thread replies
    if (input.includeThreadReplies) {
        const threadMessages = messages.filter((m) => m.replyCount && m.replyCount > 0);
        for (const threadParent of threadMessages) {
            if (messages.length >= input.limit)
                break;
            const threadResponse = await client.conversations.replies({
                channel: channelId,
                ts: threadParent.ts,
                limit: Math.min(input.limit - messages.length, 100),
            });
            if (threadResponse.messages) {
                // Skip the first message as it's the parent
                for (let i = 1; i < threadResponse.messages.length; i++) {
                    if (messages.length >= input.limit)
                        break;
                    const reply = threadResponse.messages[i];
                    messages.push(mapMessage(reply, channelId));
                }
            }
        }
    }
    return {
        channel: channelId,
        messages,
        hasMore,
    };
}
//# sourceMappingURL=get-channel-history.js.map
export interface SlackChannel {
    id: string;
    name: string;
    isPrivate: boolean;
    isArchived: boolean;
    topic?: string;
    purpose?: string;
    memberCount?: number;
    createdAt?: number;
}
export interface SlackMessage {
    ts: string;
    text: string;
    user?: string;
    username?: string;
    channel?: string;
    channelName?: string;
    timestamp: number;
    threadTs?: string;
    replyCount?: number;
    permalink?: string;
}
export interface SlackUser {
    id: string;
    name: string;
    realName?: string;
    displayName?: string;
    email?: string;
    isBot: boolean;
}
export interface SearchResult {
    query: string;
    total: number;
    messages: SlackMessage[];
}
export interface ChannelHistoryResult {
    channel: string;
    messages: SlackMessage[];
    hasMore: boolean;
}
//# sourceMappingURL=types.d.ts.map
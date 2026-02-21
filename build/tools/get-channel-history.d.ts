import { z } from 'zod';
import type { ChannelHistoryResult } from '../types.js';
export declare const getChannelHistorySchema: z.ZodObject<{
    channel: z.ZodOptional<z.ZodString>;
    oldest: z.ZodOptional<z.ZodString>;
    latest: z.ZodOptional<z.ZodString>;
    limit: z.ZodDefault<z.ZodNumber>;
    includeThreadReplies: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    includeThreadReplies: boolean;
    channel?: string | undefined;
    oldest?: string | undefined;
    latest?: string | undefined;
}, {
    limit?: number | undefined;
    channel?: string | undefined;
    oldest?: string | undefined;
    latest?: string | undefined;
    includeThreadReplies?: boolean | undefined;
}>;
export type GetChannelHistoryInput = z.infer<typeof getChannelHistorySchema>;
export declare function getChannelHistory(input: GetChannelHistoryInput): Promise<ChannelHistoryResult>;
//# sourceMappingURL=get-channel-history.d.ts.map
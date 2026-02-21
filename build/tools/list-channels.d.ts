import { z } from 'zod';
import type { SlackChannel } from '../types.js';
export declare const listChannelsSchema: z.ZodObject<{
    includePrivate: z.ZodDefault<z.ZodBoolean>;
    includeArchived: z.ZodDefault<z.ZodBoolean>;
    limit: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    includePrivate: boolean;
    includeArchived: boolean;
    limit: number;
}, {
    includePrivate?: boolean | undefined;
    includeArchived?: boolean | undefined;
    limit?: number | undefined;
}>;
export type ListChannelsInput = z.infer<typeof listChannelsSchema>;
export declare function listChannels(input: ListChannelsInput): Promise<SlackChannel[]>;
//# sourceMappingURL=list-channels.d.ts.map
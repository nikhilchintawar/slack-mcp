import { z } from 'zod';
import type { SearchResult } from '../types.js';
export declare const searchMessagesSchema: z.ZodObject<{
    query: z.ZodString;
    channel: z.ZodOptional<z.ZodString>;
    after: z.ZodOptional<z.ZodString>;
    before: z.ZodOptional<z.ZodString>;
    limit: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    query: string;
    channel?: string | undefined;
    after?: string | undefined;
    before?: string | undefined;
}, {
    query: string;
    limit?: number | undefined;
    channel?: string | undefined;
    after?: string | undefined;
    before?: string | undefined;
}>;
export type SearchMessagesInput = z.infer<typeof searchMessagesSchema>;
export declare function searchMessages(input: SearchMessagesInput): Promise<SearchResult>;
//# sourceMappingURL=search-messages.d.ts.map
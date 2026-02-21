import { z } from 'zod';
import type { SearchResult } from '../types.js';
export declare const searchMessagesSchema: z.ZodObject<{
    query: z.ZodString;
    channel: z.ZodOptional<z.ZodString>;
    from: z.ZodOptional<z.ZodString>;
    after: z.ZodOptional<z.ZodString>;
    before: z.ZodOptional<z.ZodString>;
    limit: z.ZodDefault<z.ZodNumber>;
    sortBy: z.ZodDefault<z.ZodEnum<["relevance", "timestamp"]>>;
    sortDir: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    query: string;
    sortBy: "relevance" | "timestamp";
    sortDir: "asc" | "desc";
    channel?: string | undefined;
    from?: string | undefined;
    after?: string | undefined;
    before?: string | undefined;
}, {
    query: string;
    limit?: number | undefined;
    channel?: string | undefined;
    from?: string | undefined;
    after?: string | undefined;
    before?: string | undefined;
    sortBy?: "relevance" | "timestamp" | undefined;
    sortDir?: "asc" | "desc" | undefined;
}>;
export type SearchMessagesInput = z.infer<typeof searchMessagesSchema>;
export declare function searchMessages(input: SearchMessagesInput): Promise<SearchResult>;
//# sourceMappingURL=search-messages.d.ts.map
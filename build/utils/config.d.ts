export interface SlackConfig {
    token: string;
    defaultChannel?: string;
    allowedChannels?: string[];
}
export declare function getConfig(): SlackConfig;
export declare function validateChannel(channel: string | undefined): string | undefined;
export declare function getAllowedChannelsForSearch(): string[] | undefined;
//# sourceMappingURL=config.d.ts.map
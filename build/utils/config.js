export function getConfig() {
    const token = process.env.SLACK_BOT_TOKEN;
    if (!token) {
        throw new Error('SLACK_BOT_TOKEN environment variable is required. ' +
            'Create a Slack app and add a Bot Token with the necessary scopes.');
    }
    return {
        token,
        defaultChannel: process.env.SLACK_DEFAULT_CHANNEL,
    };
}
//# sourceMappingURL=config.js.map
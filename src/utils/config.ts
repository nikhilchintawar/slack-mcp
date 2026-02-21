export interface SlackConfig {
  token: string;
  defaultChannel?: string;
  allowedChannels?: string[];
}

export function getConfig(): SlackConfig {
  const token = process.env.SLACK_BOT_TOKEN;

  if (!token) {
    throw new Error(
      'SLACK_BOT_TOKEN environment variable is required. ' +
        'Create a Slack app and add a Bot Token with the necessary scopes.'
    );
  }

  // Parse SLACK_CHANNELS as comma-separated list of channel names/IDs
  const channelsEnv = process.env.SLACK_CHANNELS;
  const allowedChannels = channelsEnv
    ? channelsEnv.split(',').map((c) => c.trim()).filter(Boolean)
    : undefined;

  return {
    token,
    defaultChannel: process.env.SLACK_DEFAULT_CHANNEL,
    allowedChannels,
  };
}

export function validateChannel(channel: string | undefined): string | undefined {
  const config = getConfig();

  // If no allowed channels configured, allow all
  if (!config.allowedChannels || config.allowedChannels.length === 0) {
    return channel;
  }

  // If no channel specified, use first allowed channel
  if (!channel) {
    return config.allowedChannels[0];
  }

  // Check if channel is in allowed list (by name or ID)
  const isAllowed = config.allowedChannels.some(
    (allowed) => allowed === channel || allowed === `#${channel}` || `#${allowed}` === channel
  );

  if (!isAllowed) {
    throw new Error(
      `Channel "${channel}" is not in the allowed list. ` +
        `Allowed channels: ${config.allowedChannels.join(', ')}`
    );
  }

  return channel;
}

export function getAllowedChannelsForSearch(): string[] | undefined {
  const config = getConfig();
  return config.allowedChannels;
}

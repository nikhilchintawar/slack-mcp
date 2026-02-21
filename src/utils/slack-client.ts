import { WebClient } from '@slack/web-api';
import { getConfig } from './config.js';

let client: WebClient | null = null;

export function getSlackClient(): WebClient {
  if (!client) {
    const config = getConfig();
    client = new WebClient(config.token);
  }
  return client;
}

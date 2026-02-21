import { WebClient } from '@slack/web-api';
import { getConfig } from './config.js';
let client = null;
export function getSlackClient() {
    if (!client) {
        const config = getConfig();
        client = new WebClient(config.token);
    }
    return client;
}
//# sourceMappingURL=slack-client.js.map
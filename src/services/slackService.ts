import {IncomingWebhook} from '@slack/webhook';

export class SlackService {
  private appName: string;
  private webhook: IncomingWebhook;

  constructor() {
    this.webhook = new IncomingWebhook(process.env.SLACK_WEBHOOK_URL || '');
    this.appName = process.env.APP_NAME || '';
  }

  async sendMessage() {
    await this.webhook.send({
      text: "I've got news for you...",
    });
  }

  async sendMessageWithAppName(message: string) {
    await this.webhook.send({
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: `App name: ${this.appName}`,
            emoji: true,
          },
        },
        {
          type: 'section',
          text: {
            type: 'plain_text',
            text: message,
            emoji: true,
          },
        },
      ],
    });
  }
}

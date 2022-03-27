import {recordWeightFromWithings} from './functions/withings';
import {recordActivityFromFitbit} from './functions/fitbit';
import {SlackService} from './services/slackService';
require('dotenv').config();

export async function recordHealthCareData(message: any, context: any) {
  if (!message.data) {
    return;
  }

  const functionName = JSON.parse(
    Buffer.from(message.data as string, 'base64').toString()
  );

  const slack = new SlackService();

  try {
    switch (functionName) {
      case 'withings':
        await recordWeightFromWithings();
        break;
      case 'fitbit':
        await recordActivityFromFitbit();
        break;
      case 'myfitnesspal':
        break;
      default:
        break;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    console.error(err.message);
    slack.sendMessageWithAppName(err.message);
  }
}

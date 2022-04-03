import {recordWeight} from './controller/withingsController';
import {recordActivity} from './controller/fitbitController';
import {recordIntakePfc} from './controller/myfitnesspalController';
import {SlackService} from './services/slackService';
require('dotenv').config();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
exports.recordHealthCareData = async (message: any, _context: any) => {
  const functionName =
    Buffer.from(message.data as string, 'base64').toString() || '';

  if (!functionName) {
    return;
  }

  try {
    switch (functionName) {
      case 'withings':
        await recordWeight();
        break;
      case 'fitbit':
        await recordActivity();
        break;
      case 'myfitnesspal':
        await recordIntakePfc();
        break;
      default:
        break;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    console.error(err.message);
    const slack = new SlackService();
    slack.sendMessageWithAppName(err.message);
  }
};

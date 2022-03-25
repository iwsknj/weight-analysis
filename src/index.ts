import {WithingsService} from './services/withingsService';
import * as dayjs from 'dayjs';
import type {HttpFunction} from '@google-cloud/functions-framework/build/src/functions';
import {SpredsheetService} from './services/spredsheetService';
import {SlackService} from './services/slackService';
require('dotenv').config();

export const helloWorld: HttpFunction = async (req, res) => {
  const slack = new SlackService();
  const withings = new WithingsService();

  try {
    await withings.init();
    await withings.refreshToken();

    const now = dayjs();
    const dayBefore = now.subtract(1, 'day');
    const dayBeforeDate = dayBefore.format('YYYY/MM/DD');
    const records = await withings.getBodyWeightRecords(
      dayBefore.hour(0).minute(0).second(0).unix(),
      dayBefore.hour(23).minute(59).second(59).unix()
    );

    if (!records) {
      return;
    }

    const dayBeforeRecords = records.find(
      record => record.formattedDate === dayBeforeDate
    );

    if (!dayBeforeRecords) {
      return;
    }

    const spredsheetService = new SpredsheetService();
    await spredsheetService.init();
    await spredsheetService.createDateRow(dayBeforeDate);
    await spredsheetService.recordWeight(
      dayBeforeDate,
      dayBeforeRecords.measures[0]
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    console.error(err.message);
    slack.sendMessageWithAppName(err.message);
  }

  res.send('Hello, World');
};

import {WithingsService} from './services/withingsService';
import * as dayjs from 'dayjs';
import type {HttpFunction} from '@google-cloud/functions-framework/build/src/functions';
import {SpredsheetService} from './services/spredsheetService';
require('dotenv').config();

export const helloWorld: HttpFunction = async (req, res) => {
  try {
    const withings = new WithingsService();
    await withings.refreshToken();

    const now = dayjs();
    const dayBefore = now.subtract(1, 'day');
    const records = await withings.getBodyWeightRecords(
      dayBefore.hour(0).minute(0).second(0).unix(),
      dayBefore.hour(23).minute(59).second(59).unix()
    );

    if (!records) {
      return;
    }

    const spredsheetService = new SpredsheetService();
    await spredsheetService.init();
    const dayBeforeDate = dayjs().subtract(1, 'day').format('YYYY/MM/DD');
    await spredsheetService.createDateRow(dayBeforeDate);
    const dayBeforeRecords = records.find(
      record => record.formattedDate === dayBeforeDate
    );

    if (!dayBeforeRecords) {
      return;
    }

    await spredsheetService.recordWeight(
      dayBeforeDate,
      dayBeforeRecords.measures[0]
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    //Slackにも送る
    console.error(err.message);
  }

  res.send('Hello, World');
};

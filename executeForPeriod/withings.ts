import * as dayjs from 'dayjs';
require('dotenv').config();

import {WithingsService} from '../src/services/withingsService';
import {SpredsheetService} from '../src/services/spredsheetService';
import {getPeriod, guideCommand} from './modules/utils';

async function main() {
  try {
    const period = getPeriod();
    const withings = new WithingsService();
    await withings.init();
    await withings.refreshToken();

    const startDateInstance = dayjs(period.startDate);
    const endDateInstance = dayjs(period.endDate);

    const records = await withings.getBodyWeightRecords(
      startDateInstance.hour(0).minute(0).second(0).unix(),
      endDateInstance.hour(23).minute(59).second(59).unix()
    );

    if (!records || records.length === 0) {
      return;
    }

    const spredsheetService = new SpredsheetService();
    await spredsheetService.init();
    await spredsheetService.recordWeights(records);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    console.log(err);
    guideCommand();
  }
}

main();

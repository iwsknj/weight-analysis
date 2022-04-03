import * as dayjs from 'dayjs';
require('dotenv').config();

import {MyfitnesspalService} from '../src/services/myfitnesspalService';
import {SpredsheetService} from '../src/services/spredsheetService';
import {getPeriod, guideCommand} from './modules/utils';
import {lowerLimitCalorie} from '../src/config';

import * as MyfitnesspalTypes from '../src/types/myfitnesspal';

async function main() {
  try {
    const period = getPeriod();
    const myfitnesspal = new MyfitnesspalService();
    await myfitnesspal.init();

    const startDateInstance = dayjs(period.startDate);
    const endDateInstance = dayjs(period.endDate);

    let targetDateInstance = startDateInstance;
    const pfcs: MyfitnesspalTypes.Pfc[] = [];
    do {
      const targetDate = targetDateInstance.format('YYYY-MM-DD');
      const pfc = await myfitnesspal.getPfc(targetDate);
      if (
        !pfc ||
        pfc.totalCalorie === '' ||
        Number(pfc.totalCalorie) <= lowerLimitCalorie
      ) {
        targetDateInstance = targetDateInstance.add(1, 'day');
        continue;
      }

      pfcs.push(pfc);
      targetDateInstance = targetDateInstance.add(1, 'day');
    } while (!endDateInstance.isBefore(targetDateInstance));

    if (pfcs.length === 0) {
      return;
    }

    const spredsheetService = new SpredsheetService();
    await spredsheetService.init();
    await spredsheetService.recordIntakePfcs(pfcs);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    console.log(err);
    guideCommand();
  }
}

main();

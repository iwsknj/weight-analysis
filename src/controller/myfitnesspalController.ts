import * as dayjs from 'dayjs';

import {MyfitnesspalService} from '../services/myfitnesspalService';
import {SpredsheetService} from '../services/spredsheetService';
import {lowerLimitCalorie} from '../config';

export async function recordIntakePfc() {
  const myfitnesspalService = new MyfitnesspalService();
  await myfitnesspalService.init();

  const now = dayjs();
  const dayBefore = now.subtract(1, 'day');

  const pfc = await myfitnesspalService.getPfc(dayBefore.format('YYYY-MM-DD'));
  // 下限値のカロリーより低かったら除外する
  if (
    !pfc ||
    pfc.totalCalorie !== '' ||
    Number(pfc.totalCalorie) <= lowerLimitCalorie
  ) {
    return;
  }

  const spredsheetService = new SpredsheetService();
  await spredsheetService.init();
  await spredsheetService.recordIntakePfc(dayBefore.format('YYYY/MM/DD'), pfc);
}

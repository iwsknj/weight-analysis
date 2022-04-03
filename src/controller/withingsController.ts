import {WithingsService} from '../services/withingsService';
import * as dayjs from 'dayjs';
import {SpredsheetService} from '../services/spredsheetService';

export async function recordWeight() {
  const withings = new WithingsService();

  await withings.init();
  await withings.refreshToken();

  const now = dayjs();
  const dayBefore = now.subtract(1, 'day');
  const dayBeforeDate = dayBefore.format('YYYY/MM/DD');
  const records = await withings.getBodyWeightRecords(
    dayBefore.hour(0).minute(0).second(0).unix(),
    dayBefore.hour(23).minute(59).second(59).unix()
  );

  if (!records || records.length === 0) {
    return;
  }

  const dayBeforeRecord = records.find(
    record => record.formattedDate === dayBeforeDate
  );

  if (!dayBeforeRecord) {
    return;
  }

  const spredsheetService = new SpredsheetService();
  await spredsheetService.init();
  await spredsheetService.recordWeight(
    dayBeforeDate,
    dayBeforeRecord.measure,
    dayBeforeRecord.bmr
  );
}

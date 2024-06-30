import {WithingsService} from '../services/withingsService';
import * as dayjs from 'dayjs';
import {SpredsheetService} from '../services/spredsheetService';

export async function recordWeight() {
  const withings = new WithingsService();

  await withings.init();
  await withings.refreshToken();

  const now = dayjs();
  const targetDate = now.format('YYYY/MM/DD');
  const records = await withings.getBodyWeightRecords(
    now.hour(0).minute(0).second(0).unix(),
    now.hour(23).minute(59).second(59).unix()
  );

  if (!records || records.length === 0) {
    return;
  }

  const record = records.find(record => record.formattedDate === targetDate);

  if (!record) {
    return;
  }

  const spredsheetService = new SpredsheetService();
  await spredsheetService.init();
  await spredsheetService.recordWeight(targetDate, record.measure, record.bmr);
}

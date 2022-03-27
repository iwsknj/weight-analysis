import {FitbitService} from '../services/fitbitService';
import * as dayjs from 'dayjs';
import {SpredsheetService} from '../services/spredsheetService';

export async function recordActivityFromFitbit() {
  const fitbit = new FitbitService();
  await fitbit.init();
  await fitbit.refreshToken();

  const now = dayjs();
  const dayBefore = now.subtract(1, 'day');
  const dayBeforeDate = dayBefore.format('YYYY/MM/DD');

  const spredsheetService = new SpredsheetService();
  await spredsheetService.init();
  await spredsheetService.createDateRow(dayBeforeDate);

  // 歩数収録して記録
  const steps = await fitbit.getSteps(dayBefore.format('YYYY-MM-DD'), '1d');
  if (steps.length > 0) {
    const dayBeforeStep = steps.find(step => step.dateTime === dayBeforeDate);

    if (dayBeforeStep) {
      await spredsheetService.recordStep(dayBeforeDate, dayBeforeStep.value);
    }
  }

  // カロリー取得して記録
  const calories = await fitbit.getCalories(
    dayBefore.format('YYYY-MM-DD'),
    '1d'
  );

  if (calories.length > 0) {
    const dayBeforeCalorie = calories.find(
      calorie => calorie.dateTime === dayBeforeDate
    );

    if (dayBeforeCalorie) {
      await spredsheetService.recordBurnedCalorie(
        dayBeforeDate,
        dayBeforeCalorie.value
      );
    }
  }
}

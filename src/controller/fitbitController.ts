import {FitbitService} from '../services/fitbitService';
import * as dayjs from 'dayjs';
import {SpredsheetService} from '../services/spredsheetService';

export async function recordActivity() {
  const fitbit = new FitbitService();
  await fitbit.init();
  await fitbit.refreshToken();

  const now = dayjs();
  const dayBefore = now.subtract(1, 'day');
  const dayBeforeDate = dayBefore.format('YYYY/MM/DD');

  const spredsheetService = new SpredsheetService();
  await spredsheetService.init();

  // 歩数収録して記録
  const steps = await fitbit.getStepsByDate(
    dayBefore.format('YYYY-MM-DD'),
    '1d'
  );

  // 歩数がない場合はつけ忘れだからカロリーも記録しない
  if (steps.length === 0) {
    return;
  }
  const dayBeforeStep = steps.find(step => step.date === dayBeforeDate);

  if (!dayBeforeStep) {
    return;
  }
  await spredsheetService.recordStep(dayBeforeDate, dayBeforeStep.value);

  // カロリー取得して記録
  const calories = await fitbit.getCaloriesByDate(
    dayBefore.format('YYYY-MM-DD'),
    '1d'
  );

  if (calories.length > 0) {
    const dayBeforeCalorie = calories.find(
      calorie => calorie.date === dayBeforeDate
    );

    if (dayBeforeCalorie) {
      await spredsheetService.recordBurnedCalorie(
        dayBeforeDate,
        dayBeforeCalorie.value
      );
    }
  }
}

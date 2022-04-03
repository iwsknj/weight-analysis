import * as dayjs from 'dayjs';
require('dotenv').config();

import {FitbitService} from '../src/services/fitbitService';
import {SpredsheetService} from '../src/services/spredsheetService';
import {getPeriod, guideCommand} from './modules/utils';
import * as FitbitTypes from '../src/types/fitbit';

async function main() {
  try {
    const period = getPeriod();
    const fitbit = new FitbitService();
    await fitbit.init();
    await fitbit.refreshToken();

    const startDateInstance = dayjs(period.startDate);
    const endDateInstance = dayjs(period.endDate);
    const startDate = startDateInstance.format('YYYY-MM-DD');
    const endDate = endDateInstance.format('YYYY-MM-DD');

    const steps = await fitbit.getStepsByDateRange(startDate, endDate);
    const calories = await fitbit.getCaloriesByDateRange(startDate, endDate);
    const stepDates = steps.map(step => step.date);
    const calorieDates = steps.map(step => step.date);

    let targetDateInstance = startDateInstance;
    const activities: FitbitTypes.ProcessedActivitiesValue[] = [];
    do {
      const targetDate = targetDateInstance.format('YYYY/MM/DD');
      const stepIndex = stepDates.indexOf(targetDate);
      let step = null;
      if (stepIndex >= 0) {
        step = steps[stepIndex].value;
      }

      const calorieIndex = calorieDates.indexOf(targetDate);
      let calorie = null;
      if (calorieIndex >= 0) {
        calorie = calories[calorieIndex].value;
      }

      activities.push({
        date: targetDate,
        step: step || '',
        calorie: calorie || '',
      });
      targetDateInstance = targetDateInstance.add(1, 'day');
    } while (!endDateInstance.isBefore(targetDateInstance));

    const spredsheetService = new SpredsheetService();
    await spredsheetService.init();
    await spredsheetService.recordActivities(activities);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    console.log(err);
    guideCommand();
  }
}

main();

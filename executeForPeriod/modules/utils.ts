import * as dayjs from 'dayjs';

export function guideCommand() {
  console.log(
    '取得したい期間の日付を指定して実行してください。\nex) ts-node [fileName] startDate(xxxx/xx/xx) endDate(xxxx/xx/xx)'
  );
}

export function getPeriod() {
  if (process.argv.length < 4) {
    throw new Error('引数が不足しています');
  }
  const startDate = process.argv[2];
  const endDate = process.argv[3];

  if (!validateDate(startDate) || !validateDate(endDate)) {
    throw new Error('正しい日付を指定してください。');
  }

  if (!validatePeriod(startDate, endDate)) {
    throw new Error('正しい期間を指定してください。');
  }

  return {startDate, endDate};
}

export function validateDate(date: string): boolean {
  const regex = /^[0-9]{4}\/[0-9]{2}\/[0-9]{2}$/;
  return date.match(regex) !== null;
}

export function validatePeriod(startDate: string, endDate: string): boolean {
  const starDateInstance = dayjs(startDate);
  const endDateInstance = dayjs(endDate);
  return starDateInstance.isBefore(endDateInstance);
}

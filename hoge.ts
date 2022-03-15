import * as dayjs from 'dayjs';
import {SpredsheetService} from './src/services/spredsheetService';
import {WorkSheet} from './src/config';
require('dotenv').config();

// const now = dayjs('2022-03-01 12:00:00');
// const yesterday = now.subtract(1, 'day');
// console.log(
//   yesterday.hour(0).minute(0).second(0).format('YYYY/MM/DD HH:mm'),
//   yesterday.hour(23).minute(59).second(59).format('YYYY/MM/DD HH:mm')
// );
async function main() {
  const spredsheetService = new SpredsheetService();
  await spredsheetService.init();

  // 行操作
  // const rows = await spredsheetService.getRows();
  // rows[0]['体重'] = 75;
  // console.log(rows[0]['体重']);
  // await rows[0].delete();

  // 行追加
  // await spredsheetService.createDateRow(
  //   dayjs().subtract(1, 'day').format('YYYY/MM/DD')
  // );
  const row = await spredsheetService.getRowByDate('2022/03/15');
  row[WorkSheet.headerColums.date.name] = 70;
}

main();

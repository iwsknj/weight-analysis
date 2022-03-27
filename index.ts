import * as dayjs from 'dayjs';
import {SpredsheetService} from './src/services/spredsheetService';
import {TokenService} from './src/services/tokenService';
import {workSheet, tokenSheet} from './src/config';
import {IncomingWebhook} from '@slack/webhook';
import {FitbitService} from './src/services/fitbitService';
import {recordActivityFromFitbit} from './src/functions/fitbit';
import BigNumber from 'bignumber.js';
require('dotenv').config();

// const now = dayjs('2022-03-01 12:00:00');
// const yesterday = now.subtract(1, 'day');
// console.log(
//   yesterday.hour(0).minute(0).second(0).format('YYYY/MM/DD HH:mm'),
//   yesterday.hour(23).minute(59).second(59).format('YYYY/MM/DD HH:mm')
// );
async function main() {
  // const tokenService = new TokenService();
  // await tokenService.init(
  //   parseInt(process.env.WITHINGS_TOKEN_SHEET_ID as string)
  // );
  // const tokens = await tokenService.getToken();
  // console.log(tokens.refreshToken);
  // tokenService.saveToken('a', 'b');
  // const spredsheetService = new SpredsheetService();
  // await spredsheetService.init();
  // 行操作
  // const rows = await spredsheetService.getRows();
  // rows[0]['体重'] = 75;
  // console.log(rows[0]['体重']);
  // await rows[0].delete();
  // 行追加
  // await spredsheetService.createDateRow(
  //   dayjs().subtract(1, 'day').format('YYYY/MM/DD')
  // );
  // const row = await spredsheetService.getRowByDate('2022/03/15');
  // row[WorkSheet.headerColums.date.name] = 70;
  /** slack */
  // // Read a url from the environment variables
  // const url = process.env.SLACK_WEBHOOK_URL || '';
  // if (!url) {
  //   return;
  // }
  // // Initialize
  // const webhook = new IncomingWebhook(url);
  // // await webhook.send({
  // //   text: "I've got news for you...",
  // // });
  // await webhook.send({
  //   blocks: [
  //     {
  //       type: 'header',
  //       text: {
  //         type: 'plain_text',
  //         text: 'This is a header block',
  //         emoji: true,
  //       },
  //     },
  //     {
  //       type: 'section',
  //       text: {
  //         type: 'plain_text',
  //         text: 'This is a plain text section block.',
  //         emoji: true,
  //       },
  //     },
  //   ],
  // });
}

// main();

async function fitbit() {
  recordActivityFromFitbit();
}

fitbit();

async function bignumber() {
  let x = new BigNumber(71.4);
  let y = new BigNumber(178);
  let z = new BigNumber(28);
  x = x.multipliedBy(13.397);
  y = y.multipliedBy(4.799);
  z = z.multipliedBy(5.677);
  console.log(
    x
      .plus(y)
      .minus(z)
      .plus(88.362)
      .decimalPlaces(0, BigNumber.ROUND_DOWN)
      .toNumber()
  );
}

// bignumber();

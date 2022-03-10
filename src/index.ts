import {Withings} from './modules/withings';
require('dotenv').config();
import dayjs from 'dayjs';

import type {HttpFunction} from '@google-cloud/functions-framework/build/src/functions';

export const helloWorld: HttpFunction = async (req, res) => {
  // try {
  //   const withings = new Withings();
  //   await withings.refreshToken();
  //   // eslint-disable-next-line @typescript-eslint/no-explicit-any
  // } catch (err: any) {
  //   console.error(err.message);
  // }

  const hoge = dayjs()
    .add(-1, 'day')
    .hour(0)
    .minute(0)
    .second(0)
    .format('YYYY-MM-DD HH:mm:ss');
  console.log(hoge);

  res.send('Hello, World');
};

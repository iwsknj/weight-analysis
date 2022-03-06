import {Withings} from './modules/withings';
require('dotenv').config();

import type {HttpFunction} from '@google-cloud/functions-framework/build/src/functions';

export const helloWorld: HttpFunction = async (req, res) => {
  try {
    const withings = new Withings();
    await withings.refreshToken();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    console.error(err.message);
  }

  res.send('Hello, World');
};

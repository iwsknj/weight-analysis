import {URLSearchParams} from 'url';
import axios, {AxiosInstance} from 'axios';
import * as cheerio from 'cheerio';
import {wrapper} from 'axios-cookiejar-support';
import {CookieJar} from 'tough-cookie';

import {myfitnesspalBaseUrl, userAgent} from '../config';
import * as MyfitnesspalTypes from '../types/myfitnesspal';

export class MyfitnesspalService {
  private csrfToken!: string;
  private axiosClient!: AxiosInstance;
  constructor() {}

  async init() {
    this.axiosClient = wrapper(
      axios.create({
        baseURL: myfitnesspalBaseUrl,
        headers: {'User-Agent': userAgent},
        withCredentials: true,
        jar: new CookieJar(),
      })
    );
    const csrfResponse = await this.axiosClient.get('/api/auth/csrf');
    this.csrfToken = csrfResponse.data.csrfToken;

    const params: MyfitnesspalTypes.LoginParams = {
      username: process.env.MYFITNESSPAL_USERNAME as string,
      password: process.env.MYFITNESSPAL_PASSWORD as string,
      csrfToken: this.csrfToken,
      redirect: false,
      json: true,
    };

    const LoginParams = new URLSearchParams();
    Object.keys(params).forEach(key => {
      LoginParams.append(
        key,
        params[key as keyof MyfitnesspalTypes.LoginParams].toString()
      );
    });

    await this.axiosClient.post('/api/auth/callback/credentials', LoginParams, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    await this.axiosClient.get('/user/auth_token?refresh=true');
  }

  async getPfc(date: string): Promise<MyfitnesspalTypes.Pfc | null> {
    const res = await this.axiosClient.get(`/food/diary?date=${date}`);
    const $ = cheerio.load(res.data);
    const $diaryTable = $('#diary-table');
    if ($diaryTable.length === 0) {
      return null;
    }

    const $totalContents = $diaryTable.find('.total');
    if (!$totalContents) {
      return null;
    }
    const valuesElement = $totalContents.children();
    const totalCalorie =
      $(valuesElement[1]).text().replace(',', '') === '0'
        ? ''
        : $(valuesElement[1]).text().replace(',', '');
    const carbo =
      $(valuesElement[2]).find('.macro-value').text() === '0'
        ? ''
        : $(valuesElement[2]).find('.macro-value').text();
    const fat =
      $(valuesElement[3]).find('.macro-value').text() === '0'
        ? ''
        : $(valuesElement[3]).find('.macro-value').text();
    const protain =
      $(valuesElement[4]).find('.macro-value').text() === '0'
        ? ''
        : $(valuesElement[4]).find('.macro-value').text();
    return {
      date: date.replace(/-/g, '/'),
      totalCalorie,
      carbo,
      fat,
      protain,
    };
  }
}

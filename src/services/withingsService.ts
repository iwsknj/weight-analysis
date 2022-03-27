import axios from 'axios';
import BigNumber from 'bignumber.js';
import * as dayjs from 'dayjs';

import {URLSearchParams} from 'url';
import {TokenService} from './tokenService';
import * as WithingsTypes from '../types/withings';
import {age, height, withingsEndPoint} from '../config';

export class WithingsService {
  tokenService!: TokenService;
  tokens!: {accessToken: string; refreshToken: string};

  constructor() {}

  async init() {
    this.tokenService = new TokenService();
    await this.tokenService.init(
      parseInt(process.env.WITHINGS_TOKEN_SHEET_ID as string)
    );
    this.tokens = await this.tokenService.getToken();
  }

  /**
   * リフレッシュトークンをもとにアクセストークンを更新し、シートに書き込む
   */
  async refreshToken() {
    const params: WithingsTypes.RefreshTokenParams = {
      action: 'requesttoken',
      grant_type: 'refresh_token',
      client_id: process.env.WITHINGS_CLIENT_ID as string,
      client_secret: process.env.WITHINGS_SECRET_KEY as string,
      refresh_token: this.tokens.refreshToken,
    };

    try {
      const searchParams = new URLSearchParams();
      Object.keys(params).forEach(key => {
        searchParams.append(
          key,
          params[key as keyof WithingsTypes.RefreshTokenParams]
        );
      });

      const response = await axios.post(
        `${withingsEndPoint}/v2/oauth2`,
        searchParams,
        {
          headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        }
      );
      if (response.data.status !== 0) {
        throw new Error(`Response status is ${response.data.status}`);
      }

      this.tokens.accessToken = response.data.body.access_token as string;
      this.tokens.refreshToken = response.data.body.refresh_token as string;
      this.tokenService.saveToken(
        this.tokens.accessToken,
        this.tokens.refreshToken
      );
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      throw new Error(
        `[Withings] トークンの更新に失敗しました。Error: ${err.message}`
      );
    }
  }

  /**
   * 指定した期間の体重データを取得する
   * @param startTimeStamp unix timestamp
   * @param endTimeStamp unix timestamp
   */
  async getBodyWeightRecords(
    startTimeStamp: number,
    endTimeStamp: number
  ): Promise<WithingsTypes.ProcessedMeasure[] | null> {
    const params: WithingsTypes.BodyWeightRequestParams = {
      action: 'getmeas',
      meastype: 1,
      category: 1,
      startdate: startTimeStamp,
      enddate: endTimeStamp,
    };

    try {
      const searchParams = new URLSearchParams();
      Object.keys(params).forEach(key => {
        searchParams.append(
          key,
          params[key as keyof WithingsTypes.BodyWeightRequestParams].toString()
        );
      });

      const response = await axios.post(
        `${withingsEndPoint}/measure`,
        searchParams,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: `Bearer ${this.tokens.accessToken}`,
          },
        }
      );
      if (response.data.status !== 0) {
        throw new Error(`Response status is ${response.data.status}`);
      }

      if (response.data.body.measuregrps.length === 0) {
        return null;
      }

      return this.processBodyWeightRecords(
        response.data.body.measuregrps as WithingsTypes.Measuregrp[]
      );

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      throw new Error(
        `[Withings] 体重の取得に失敗しました。Error: ${err.message}`
      );
    }
  }

  /**
   * 取得した体重データを加工する
   * @param measuregrps
   */
  private processBodyWeightRecords(
    measuregrps: WithingsTypes.Measuregrp[]
  ): WithingsTypes.ProcessedMeasure[] {
    return measuregrps
      .map(measuregrp => {
        const measures = measuregrp.measures.map(measure => {
          return measure.value * Math.pow(10, measure.unit);
        });

        return {
          date: measuregrp.date,
          formattedDate: dayjs.unix(measuregrp.date).format('YYYY/MM/DD'),
          measure: measures[0],
          bmr: this.calculateBmr(measures[0]),
        };
      })
      .sort((a, b) => {
        return a.date - b.date;
      });
  }

  /**
   * 体重から基礎代謝を計算する
   *
   * 式：https://keisan.casio.jp/exec/system/1161228736
   *
   * @param weight
   */
  private calculateBmr(weight: number): number {
    let x = new BigNumber(weight);
    let y = new BigNumber(height);
    let z = new BigNumber(age);
    x = x.multipliedBy(13.397);
    y = y.multipliedBy(4.799);
    z = z.multipliedBy(5.677);
    return x
      .plus(y)
      .minus(z)
      .plus(88.362)
      .decimalPlaces(0, BigNumber.ROUND_DOWN)
      .toNumber();
  }
}

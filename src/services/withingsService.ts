import {URLSearchParams} from 'url';
import * as fs from 'fs';
import axios from 'axios';
import * as dayjs from 'dayjs';

export class WithingsService {
  readonly tokensFilePath = `${__dirname}/../../auth/withingTokens.json`;

  constructor() {}

  /**
   * @description リフレッシュトークンをもとにアクセストークンを更新し、ファイルに書き込む
   */
  async refreshToken() {
    const tokensJson = this.getTokensJson();
    const params: RefreshTokenParams = {
      action: 'requesttoken',
      grant_type: 'refresh_token',
      client_id: process.env.WITHINGS_CLIENT_ID as string,
      client_secret: process.env.WITHINGS_SECRET_KEY as string,
      refresh_token: tokensJson.refreshToken,
    };

    try {
      const searchParams = new URLSearchParams();
      Object.keys(params).forEach(key => {
        searchParams.append(key, params[key as keyof RefreshTokenParams]);
      });

      const response = await axios.post(
        `${process.env.WITHINGS_ENDPOINT}/v2/oauth2`,
        searchParams,
        {
          headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        }
      );
      if (response.data.status !== 0) {
        throw new Error(`Response status is ${response.data.status}`);
      }

      const newTokens: WithingsTokens = {
        accessToken: response.data.body.access_token,
        refreshToken: response.data.body.refresh_token,
      };

      fs.writeFileSync(this.tokensFilePath, JSON.stringify(newTokens));
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      throw new Error(
        `[Withings] トークンの更新に失敗しました。Error: ${err.message}`
      );
    }
  }

  /**
   * @description 指定した期間の体重データを取得する
   * @param startTimeStamp unix timestamp
   * @param endTimeStamp unix timestamp
   */
  async getBodyWeightRecords(
    startTimeStamp: number,
    endTimeStamp: number
  ): Promise<processedMeasureGroup[] | null> {
    const tokensJson = this.getTokensJson();

    const params: BodyWeightRequestParams = {
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
          params[key as keyof BodyWeightRequestParams].toString()
        );
      });

      const response = await axios.post(
        `${process.env.WITHINGS_ENDPOINT}/measure`,
        searchParams,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: `Bearer ${tokensJson.accessToken}`,
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
        response.data.body.measuregrps as measuregrp[]
      );

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      throw new Error(
        `[Withings] 体重の取得に失敗しました。Error: ${err.message}`
      );
    }
  }

  /**
   * @description トークンのJSONファイル読み込み
   */
  private getTokensJson(): WithingsTokens {
    try {
      const rawData = fs.readFileSync(this.tokensFilePath, 'utf8');
      return JSON.parse(rawData) as WithingsTokens;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      throw new Error(
        `[Withings] トークンファイルの読み込みに失敗しました。Error: ${err.message}`
      );
    }
  }

  /**
   * @description 取得した体重データを加工する
   * @param measuregrps
   */
  private processBodyWeightRecords(
    measuregrps: measuregrp[]
  ): processedMeasureGroup[] {
    return measuregrps
      .map(measuregrp => {
        const measures = measuregrp.measures.map(measure => {
          return measure.value * Math.pow(10, measure.unit);
        });

        return {
          date: measuregrp.date,
          formattedDate: dayjs.unix(measuregrp.date).format('YYYY/MM/DD'),
          measures,
        };
      })
      .sort((a, b) => {
        return a.date - b.date;
      });
  }
}

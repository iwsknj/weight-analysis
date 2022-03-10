import {URLSearchParams} from 'url';
import * as fs from 'fs';
import axios from 'axios';
import * as dayjs from 'dayjs';

const tokensFilePath = `${__dirname}/../../auth/withingTokens.json`;

export class Withings {
  constructor() {}

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

      fs.writeFileSync(tokensFilePath, JSON.stringify(newTokens));
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      throw new Error(
        `[Withings] トークンの更新に失敗しました。Error: ${err.message}`
      );
    }
  }

  async getBodyWeightRecords(startTimeStamp: number, endTimeStamp: number) {
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

      return this.processBodyWeightRecord(
        response.data.body.measuregrps as measuregrp[]
      );

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      throw new Error(
        `[Withings] 体重の取得に失敗しました。Error: ${err.message}`
      );
    }
  }

  private getTokensJson() {
    try {
      const rawData = fs.readFileSync(tokensFilePath, 'utf8');
      return JSON.parse(rawData) as WithingsTokens;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      throw new Error(
        `[Withings] トークンファイルの読み込みに失敗しました。Error: ${err.message}`
      );
    }
  }

  private processBodyWeightRecord(
    measuregrps: measuregrp[]
  ): prodessedMeasureGroup[] {
    return measuregrps
      .map(measuregrp => {
        console.log(measuregrp.measures);
        const measures = measuregrp.measures.map(measure => {
          return measure.value * Math.pow(10, measure.unit);
        });

        return {
          date: measuregrp.date,
          formattedDate: dayjs.unix(measuregrp.date).format('YYYY/M/D'),
          measures,
        };
      })
      .sort((a, b) => {
        return a.date - b.date;
      });
  }
}

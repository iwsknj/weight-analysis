import {URLSearchParams} from 'url';
import axios from 'axios';
import * as dayjs from 'dayjs';

import {TokenService} from './tokenService';
import * as FitbitTypes from '../types/fitbit';
import {fitbitEndPoint} from '../config';

export class FitbitService {
  tokenService!: TokenService;
  tokens!: {accessToken: string; refreshToken: string};

  constructor() {}

  async init() {
    this.tokenService = new TokenService();
    await this.tokenService.init(
      parseInt(process.env.FITBIT_TOKEN_SHEET_ID as string)
    );
    this.tokens = await this.tokenService.getToken();
    if (!this.tokens.accessToken || !this.tokens.refreshToken) {
      throw new Error('[Fitbit] トークンが存在しません。');
    }
  }

  /**
   * リフレッシュトークンをもとにアクセストークンを更新し、シートに書き込む
   */
  async refreshToken() {
    const params: FitbitTypes.RefreshTokenParams = {
      grant_type: 'refresh_token',
      refresh_token: this.tokens.refreshToken,
    };

    try {
      const searchParams = new URLSearchParams();
      Object.keys(params).forEach(key => {
        searchParams.append(
          key,
          params[key as keyof FitbitTypes.RefreshTokenParams]
        );
      });

      const response = await axios.post(
        `${fitbitEndPoint}/oauth2/token`,
        searchParams,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: `Basic ${Buffer.from(
              `${process.env.FITBIT_CLIENT_ID as string}:${
                process.env.FITBIT_SECRET_KEY as string
              }`
            ).toString('base64')}`,
          },
        }
      );

      if (response.status !== 200) {
        throw new Error(response.data.errors);
      }

      this.tokens.accessToken = response.data.access_token as string;
      this.tokens.refreshToken = response.data.refresh_token as string;
      this.tokenService.saveToken(
        this.tokens.accessToken,
        this.tokens.refreshToken
      );
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      throw new Error(
        `[Fitbit] トークンの更新に失敗しました。Error: ${err.message}`
      );
    }
  }

  /**
   *
   * @param endDate YYYY-MM-DD
   * @param period サポートしている期間「1d | 7d | 30d | 1w | 1m | 3m | 6m | 1y」
   */
  async getSteps(
    endDate: string,
    period: string
  ): Promise<FitbitTypes.ActivityValue[]> {
    try {
      const response = await axios.get(
        `${fitbitEndPoint}/1/user/-/activities/steps/date/${endDate}/${period}.json`,
        {
          headers: {
            Authorization: `Bearer ${this.tokens.accessToken}`,
          },
        }
      );

      if (response.status !== 200) {
        throw new Error(response.data.errors);
      }

      return this.proccessStepRecords(response.data['activities-steps']);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      throw new Error(
        `[Fitbit] 歩数の取得に失敗しました。Error: ${err.message}`
      );
    }
  }

  /**
   * 歩数データの加工
   * 歩数が0のデータは除外
   * @param steps
   */
  private proccessStepRecords(
    steps: FitbitTypes.ActivityValue[]
  ): FitbitTypes.ActivityValue[] {
    return steps
      .filter(step => step.value !== '0')
      .map(step => {
        return {
          dateTime: step.dateTime.replace(/-/g, '/'),
          value: step.value,
        };
      });
  }

  /**
   * カロリーを取得
   * @param endDate YYYY-MM-DD
   * @param period サポートしている期間「1d | 7d | 30d | 1w | 1m | 3m | 6m | 1y」
   */
  async getCalories(
    endDate: string,
    period: string
  ): Promise<FitbitTypes.ActivityValue[]> {
    try {
      const response = await axios.get(
        `${fitbitEndPoint}/1/user/-/activities/calories/date/${endDate}/${period}.json`,
        {
          headers: {
            Authorization: `Bearer ${this.tokens.accessToken}`,
          },
        }
      );

      if (response.status !== 200) {
        throw new Error(response.data.errors);
      }

      return this.proccessCalorieRecords(response.data['activities-calories']);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      throw new Error(
        `[Fitbit] カロリーの取得に失敗しました。Error: ${err.message}`
      );
    }
  }

  /**
   * 歩数データの加工
   * 歩数が0のデータは除外
   * @param steps
   */
  private proccessCalorieRecords(
    calories: FitbitTypes.ActivityValue[]
  ): FitbitTypes.ActivityValue[] {
    return calories
      .filter(calorie => calorie.value !== '0')
      .map(calorie => {
        return {
          dateTime: calorie.dateTime.replace(/-/g, '/'),
          value: calorie.value,
        };
      });
  }
}

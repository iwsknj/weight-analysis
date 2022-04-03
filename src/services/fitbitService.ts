import {URLSearchParams} from 'url';
import axios from 'axios';

import {TokenService} from './tokenService';
import * as FitbitTypes from '../types/fitbit';
import {fitbitBaseUrl, lowerLimitStep} from '../config';

export class FitbitService {
  private tokenService!: TokenService;
  private tokens!: {accessToken: string; refreshToken: string};

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
        `${fitbitBaseUrl}/oauth2/token`,
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
   * 歩数を期間を指定して取得
   * @param endDate YYYY-MM-DD
   * @param period サポートしている期間「1d | 7d | 30d | 1w | 1m | 3m | 6m | 1y」
   */
  async getStepsByDate(
    endDate: string,
    period: string
  ): Promise<FitbitTypes.ProcessedActivityValue[]> {
    try {
      const response = await axios.get(
        `${fitbitBaseUrl}/1/user/-/activities/steps/date/${endDate}/${period}.json`,
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
   * 歩数を日付期間で取得
   * @param startDate YYYY-MM-DD
   * @param endDate YYYY-MM-DD
   */
  async getStepsByDateRange(
    startDate: string,
    endDate: string
  ): Promise<FitbitTypes.ProcessedActivityValue[]> {
    try {
      const response = await axios.get(
        `${fitbitBaseUrl}/1/user/-/activities/steps/date/${startDate}/${endDate}.json`,
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
    steps: FitbitTypes.ResponseActivityValue[]
  ): FitbitTypes.ProcessedActivityValue[] {
    return steps
      .filter(step => Number(step.value) > lowerLimitStep)
      .map(step => {
        return {
          date: step.dateTime.replace(/-/g, '/'),
          value: step.value,
        };
      });
  }

  /**
   * カロリーを期間を指定して取得
   * @param endDate YYYY-MM-DD
   * @param period サポートしている期間「1d | 7d | 30d | 1w | 1m | 3m | 6m | 1y」
   */
  async getCaloriesByDate(
    endDate: string,
    period: string
  ): Promise<FitbitTypes.ProcessedActivityValue[]> {
    try {
      const response = await axios.get(
        `${fitbitBaseUrl}/1/user/-/activities/calories/date/${endDate}/${period}.json`,
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
   * カロリーを日付期間で取得
   * @param starDate YYYY-MM-DD
   * @param endDate YYYY-MM-DD
   */
  async getCaloriesByDateRange(
    startDate: string,
    endDate: string
  ): Promise<FitbitTypes.ProcessedActivityValue[]> {
    try {
      const response = await axios.get(
        `${fitbitBaseUrl}/1/user/-/activities/calories/date/${startDate}/${endDate}.json`,
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
   * カロリーデータの加工
   * 消費カロリーが1800未満の場合は装着していないから除外
   * @param steps
   */
  private proccessCalorieRecords(
    calories: FitbitTypes.ResponseActivityValue[]
  ): FitbitTypes.ProcessedActivityValue[] {
    return calories
      .filter(calorie => Number(calorie.value) > 1800)
      .map(calorie => {
        return {
          date: calorie.dateTime.replace(/-/g, '/'),
          value: calorie.value,
        };
      });
  }
}

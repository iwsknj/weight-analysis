import axios from 'axios';
import * as fs from 'fs';
import {URLSearchParams} from 'url';

interface RefreshTokenParams {
  action: string;
  grant_type: string;
  client_id: string;
  client_secret: string;
  refresh_token: string;
}

interface WithingsTokens {
  accessToken: string;
  refreshToken: string;
}

const tokenFilePath = `${__dirname}/../../auth/withingTokens.json`;

export class Withings {
  constructor() {}

  async refreshToken() {
    let tokenJson: WithingsTokens;

    try {
      const rawData = fs.readFileSync(tokenFilePath, 'utf8');
      tokenJson = JSON.parse(rawData) as WithingsTokens;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      throw new Error(
        `[Withings] トークンファイルの読み込みに失敗しました。Error: ${err.message}`
      );
    }

    const params: RefreshTokenParams = {
      action: 'requesttoken',
      grant_type: 'refresh_token',
      client_id: process.env.WITHINGS_CLIENT_ID as string,
      client_secret: process.env.WITHINGS_SECRET_KEY as string,
      refresh_token: tokenJson.refreshToken,
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

      fs.writeFileSync(tokenFilePath, JSON.stringify(newTokens));
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      throw new Error(
        `[Withings] トークンの更新に失敗しました。Error: ${err.message}`
      );
    }
  }
}

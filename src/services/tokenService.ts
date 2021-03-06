import {GoogleSpreadsheet, GoogleSpreadsheetCell} from 'google-spreadsheet';
import {tokenSheet} from '../config';
import type {
  GoogleSpreadsheetWorksheet as GoogleSpreadsheetWorksheetType,
  GoogleSpreadsheet as GoogleSpreadsheetType,
} from 'google-spreadsheet';

export class TokenService {
  readonly tokenSpreadSheetId = process.env.TOKEN_SPREAD_SHEET_ID || '';
  readonly clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || '';
  readonly privateKey = process.env.GOOGLE_PRIVATE_KEY || '';
  doc: GoogleSpreadsheetType;
  sheet!: GoogleSpreadsheetWorksheetType;
  accessTokenCell!: GoogleSpreadsheetCell;
  refreshTokenCell!: GoogleSpreadsheetCell;

  constructor() {
    this.doc = new GoogleSpreadsheet(this.tokenSpreadSheetId);
  }

  /**
   * 初期化・環境変数チェック・ヘッダーの整合性チェック
   */
  async init(sheetId: number) {
    if (!(this.tokenSpreadSheetId && this.clientEmail && this.privateKey)) {
      throw new Error('[Spredsheet] 環境変数が不足しています。');
    }
    await this.doc.useServiceAccountAuth({
      client_email: this.clientEmail,
      private_key: this.privateKey.replace(/\\n/g, '\n'),
    });

    await this.doc.loadInfo();
    this.sheet = this.doc.sheetsById[sheetId];
    await this.sheet.loadCells();
  }

  /**
   * トークン取得
   */
  async getToken(): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    this.accessTokenCell = await this.sheet.getCellByA1(
      tokenSheet.accessTokenCell
    );
    this.refreshTokenCell = await this.sheet.getCellByA1(
      tokenSheet.refreshTokenCell
    );

    return {
      accessToken: this.accessTokenCell.formattedValue as string,
      refreshToken: this.refreshTokenCell.formattedValue as string,
    };
  }

  /**
   * トークン保存
   * @param accessToken
   * @param refreshToken
   */
  async saveToken(accessToken: string, refreshToken: string): Promise<void> {
    this.accessTokenCell.value = accessToken;
    this.refreshTokenCell.value = refreshToken;
    await this.accessTokenCell.save();
    await this.refreshTokenCell.save();
  }
}

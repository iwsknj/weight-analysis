import {GoogleSpreadsheet, GoogleSpreadsheetRow} from 'google-spreadsheet';
import {WorkSheet} from '../config';
import type {
  GoogleSpreadsheetWorksheet as GoogleSpreadsheetWorksheetType,
  GoogleSpreadsheet as GoogleSpreadsheetType,
} from 'google-spreadsheet';

export class SpredsheetService {
  readonly sheetHeaderValues = WorkSheet.headerValues;
  readonly sheetId = process.env.SHEET_ID || '';
  readonly clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || '';
  readonly privateKey = process.env.GOOGLE_PRIVATE_KEY || '';
  doc: GoogleSpreadsheetType;
  sheet!: GoogleSpreadsheetWorksheetType;
  rows!: GoogleSpreadsheetRow[];

  constructor() {
    this.doc = new GoogleSpreadsheet(this.sheetId);
  }

  /**
   * @description 初期化・環境変数チェック・ヘッダーの整合性チェック
   */
  async init() {
    if (!(this.sheetId && this.clientEmail && this.privateKey)) {
      throw new Error('[Spredsheet] 環境変数が不足しています。');
    }
    await this.doc.useServiceAccountAuth({
      client_email: this.clientEmail,
      private_key: this.privateKey.replace(/\\n/g, '\n'),
    });

    await this.doc.loadInfo();
    this.sheet = this.doc.sheetsById[WorkSheet.sheetId];
    await this.sheet.loadHeaderRow();

    // 安全のため、シートのヘッダー行が意図している値になっているか確認する
    if (
      JSON.stringify(this.sheet.headerValues) !==
      JSON.stringify(this.sheetHeaderValues)
    ) {
      const headerValuesErrorMessage = `Your sheet must have the following header columns ${this.sheetHeaderValues
        .map(v => `"${v}"`)
        .join(', ')} in the exact same order.`;
      console.error(headerValuesErrorMessage);
      throw new Error(headerValuesErrorMessage);
    }

    await this.loadRows();
  }

  /**
   * @description すべての行を読み込む
   */
  async loadRows() {
    this.rows = await this.sheet.getRows();
  }

  /**
   * @description 前日の記録があるかチェック
   * @param 日付（YYYY/MM/DD）
   */
  async existsDateRow(date: string): Promise<boolean> {
    return (
      this.rows.filter(row => row[WorkSheet.headerColums.date.name] === date)
        .length > 0
    );
  }

  /**
   * @description 指定した日付の行を取り出す
   * @param date
   */
  getRowByDate(date: string): GoogleSpreadsheetRow {
    return this.rows.filter(
      row => row[WorkSheet.headerColums.date.name] === date
    )[0];
  }

  /**
   * @description 指定した日付の行を作成する（存在していたら無視）
   * @param date
   */
  async createDateRow(date: string): Promise<void> {
    const existsDayBeforeDateRecord = await this.existsDateRow(date);
    if (!existsDayBeforeDateRecord) {
      await this.sheet.addRow({
        [WorkSheet.headerColums.date.name]: date,
      });
      await this.loadRows();
    }
  }

  /**
   * @description 指定した日付に体重を記録する
   * @param date
   * @param weight
   */
  async recordWeight(date: string, weight: number): Promise<void> {
    const row = this.getRowByDate(date);
    row[WorkSheet.headerColums.weight.name] = weight;
    await row.save();
  }
}

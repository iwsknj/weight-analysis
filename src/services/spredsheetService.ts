import {GoogleSpreadsheet, GoogleSpreadsheetRow} from 'google-spreadsheet';
import {workSheet} from '../config';
import type {
  GoogleSpreadsheetWorksheet as GoogleSpreadsheetWorksheetType,
  GoogleSpreadsheet as GoogleSpreadsheetType,
} from 'google-spreadsheet';

import * as MyfitnesspalTypes from '../types/myfitnesspal';
import * as FitbitTypes from '../types/fitbit';
import * as WithingsTypes from '../types/withings';

export class SpredsheetService {
  readonly sheetHeaderValues = workSheet.headerValues;
  readonly spreadSheetId = process.env.SPREAD_SHEET_ID || '';
  readonly clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || '';
  readonly privateKey = process.env.GOOGLE_PRIVATE_KEY || '';
  doc: GoogleSpreadsheetType;
  sheet!: GoogleSpreadsheetWorksheetType;
  rows!: GoogleSpreadsheetRow[];

  constructor() {
    this.doc = new GoogleSpreadsheet(this.spreadSheetId);
  }

  /**
   * 初期化・環境変数チェック・ヘッダーの整合性チェック
   */
  async init() {
    if (!(this.spreadSheetId && this.clientEmail && this.privateKey)) {
      throw new Error('[Spredsheet] 環境変数が不足しています。');
    }
    await this.doc.useServiceAccountAuth({
      client_email: this.clientEmail,
      private_key: this.privateKey.replace(/\\n/g, '\n'),
    });

    await this.doc.loadInfo();
    this.sheet = this.doc.sheetsById[parseInt(process.env.MAIN_SHEET_ID || '')];
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
   * すべての行を読み込む
   */
  async loadRows() {
    this.rows = await this.sheet.getRows();
    return;
  }

  /**
   * 前日の記録があるかチェック
   * @param 日付（YYYY/MM/DD）
   */
  async existsDateRow(date: string): Promise<boolean> {
    return (
      this.rows.filter(row => row[workSheet.headerColums.date.name] === date)
        .length > 0
    );
  }

  /**
   * 指定した日付の行を取り出す
   * @param date
   */
  getRowByDate(date: string): GoogleSpreadsheetRow {
    return this.rows.filter(
      row => row[workSheet.headerColums.date.name] === date
    )[0];
  }

  /**
   * 指定した日付の行を作成する（存在していたら無視）
   * @param date
   */
  async createDateRow(date: string): Promise<void> {
    const existsDayBeforeDateRecord = await this.existsDateRow(date);
    if (!existsDayBeforeDateRecord) {
      await this.sheet.addRow({
        [workSheet.headerColums.date.name]: date,
      });
      await this.loadRows();
    }
  }

  /**
   * 指定した日付に体重を記録する
   * @param date
   * @param weight
   */
  async recordWeight(date: string, weight: number, bmr: number): Promise<void> {
    await this.createDateRow(date);

    const row = this.getRowByDate(date);
    row[workSheet.headerColums.weight.name] = weight;
    row[workSheet.headerColums.bmr.name] = bmr;
    await row.save();
  }

  /**
   * 複数のアクティビティをまとめて登録する
   * @param activities
   */
  async recordWeights(
    weights: WithingsTypes.ProcessedMeasure[]
  ): Promise<void> {
    for (let i = 0; i < weights.length; i++) {
      if (await this.existsDateRow(weights[i].formattedDate)) {
        const row = this.getRowByDate(weights[i].formattedDate);
        row[workSheet.headerColums.weight.name] = weights[i].measure;
        row[workSheet.headerColums.bmr.name] = weights[i].bmr;
        await row.save();
      } else {
        await this.sheet.addRow({
          [workSheet.headerColums.date.name]: weights[i].date,
          [workSheet.headerColums.weight.name]: weights[i].measure,
          [workSheet.headerColums.bmr.name]: weights[i].bmr,
        });
      }
    }
  }

  /**
   * 指定した日付に歩数を記録する
   * @param date
   * @param step
   */
  async recordStep(date: string, step: string): Promise<void> {
    await this.createDateRow(date);

    const row = this.getRowByDate(date);
    row[workSheet.headerColums.step.name] = step;
    await row.save();
  }

  /**
   * 指定した日付に消費カロリーを記録する
   * @param date
   * @param burnedCalorie
   */
  async recordBurnedCalorie(
    date: string,
    burnedCalorie: string
  ): Promise<void> {
    await this.createDateRow(date);

    const row = this.getRowByDate(date);
    row[workSheet.headerColums.burnedCalorie.name] = burnedCalorie;
    await row.save();
  }

  /**
   * 複数のアクティビティをまとめて登録する
   * @param activities
   */
  async recordActivities(
    activities: FitbitTypes.ProcessedActivitiesValue[]
  ): Promise<void> {
    for (let i = 0; i < activities.length; i++) {
      if (await this.existsDateRow(activities[i].date)) {
        const row = this.getRowByDate(activities[i].date);
        row[workSheet.headerColums.burnedCalorie.name] = activities[i].calorie;
        row[workSheet.headerColums.step.name] = activities[i].step;
        await row.save();
      } else {
        await this.sheet.addRow({
          [workSheet.headerColums.date.name]: activities[i].date,
          [workSheet.headerColums.burnedCalorie.name]: activities[i].calorie,
          [workSheet.headerColums.step.name]: activities[i].step,
        });
      }
    }
  }

  /**
   * 摂取カロリーとPFCを記録
   * @param date
   * @param values
   */
  async recordIntakePfc(date: string, values: MyfitnesspalTypes.Pfc) {
    await this.createDateRow(date);

    const row = this.getRowByDate(date);
    row[workSheet.headerColums.intakeCalorie.name] = values.totalCalorie;
    row[workSheet.headerColums.intakeCarbo.name] = values.carbo;
    row[workSheet.headerColums.intakeFat.name] = values.fat;
    row[workSheet.headerColums.intakeProtain.name] = values.protain;
    await row.save();
  }

  /**
   * 複数の摂取カロリーとPFCを記録
   * @param date
   * @param values
   */
  async recordIntakePfcs(pfcs: MyfitnesspalTypes.Pfc[]) {
    for (let i = 0; i < pfcs.length; i++) {
      if (await this.existsDateRow(pfcs[i].date)) {
        const row = this.getRowByDate(pfcs[i].date);
        row[workSheet.headerColums.intakeCalorie.name] = pfcs[i].totalCalorie;
        row[workSheet.headerColums.intakeCarbo.name] = pfcs[i].carbo;
        row[workSheet.headerColums.intakeFat.name] = pfcs[i].fat;
        row[workSheet.headerColums.intakeProtain.name] = pfcs[i].protain;
        await row.save();
      } else {
        await this.sheet.addRow({
          [workSheet.headerColums.date.name]: pfcs[i].date,
          [workSheet.headerColums.intakeCalorie.name]: pfcs[i].totalCalorie,
          [workSheet.headerColums.intakeCarbo.name]: pfcs[i].carbo,
          [workSheet.headerColums.intakeFat.name]: pfcs[i].fat,
          [workSheet.headerColums.intakeProtain.name]: pfcs[i].protain,
        });
      }
    }
  }
}

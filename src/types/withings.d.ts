export interface RefreshTokenParams {
  action: string;
  grant_type: string;
  client_id: string;
  client_secret: string;
  refresh_token: string;
}

export interface BodyWeightRequestParams {
  action: string;
  meastype: number;
  category: number;
  startdate: number;
  enddate: number;
}

export interface WithingsTokens {
  accessToken: string;
  refreshToken: string;
}

export interface Measuregrp {
  grpid: number;
  attrib: number;
  date: number;
  created: number;
  category: number;
  deviceid: string;
  hash_deviceid: string;
  measures: Measure[];
  comment: string | null;
}

export interface Measure {
  value: number;
  type: number;
  unit: number;
  algo: number;
  fm: number;
}

export interface ProcessedMeasure {
  date: number;
  formattedDate: string;
  measure: number;
  bmr: number;
}

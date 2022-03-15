interface RefreshTokenParams {
  action: string;
  grant_type: string;
  client_id: string;
  client_secret: string;
  refresh_token: string;
}

interface BodyWeightRequestParams {
  action: string;
  meastype: number;
  category: number;
  startdate: number;
  enddate: number;
}

interface WithingsTokens {
  accessToken: string;
  refreshToken: string;
}

interface measuregrp {
  grpid: number;
  attrib: number;
  date: number;
  created: number;
  category: number;
  deviceid: string;
  hash_deviceid: string;
  measures: measure[];
  comment: string | null;
}

interface measure {
  value: number;
  type: number;
  unit: number;
  algo: number;
  fm: number;
}

interface processedMeasureGroup {
  date: number;
  formattedDate: string;
  measures: number[];
}

export interface RefreshTokenParams {
  grant_type: string;
  refresh_token: string;
}

export interface ResponseActivityValue {
  dateTime: string;
  value: string;
}

export interface ProcessedActivityValue {
  date: string;
  value: string;
}

export interface ProcessedActivitiesValue {
  date: string;
  step: string;
  calorie: string;
}

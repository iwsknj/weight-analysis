export const workSheet = {
  headerValues: [
    '日付',
    '体重',
    '基礎代謝',
    '消費カロリー',
    '摂取カロリー',
    '炭水化物',
    '脂質',
    'タンパク質',
    '歩数',
    '体温',
  ],

  headerColums: {
    date: {name: '日付', index: 0},
    weight: {name: '体重', index: 1},
    bmr: {name: '基礎代謝', index: 2},
    burnedCalorie: {name: '消費カロリー', index: 3},
    intakeCalorie: {name: '摂取カロリー', index: 4},
    intakeCarbo: {name: '炭水化物', index: 6},
    intakeFat: {name: '脂質', index: 7},
    intakeProtain: {name: 'タンパク質', index: 8},
    step: {name: '歩数', index: 9},
    bodyTemperature: {name: '体温', index: 10},
  },
};

export const tokenSheet = {
  accessTokenCell: 'B1',
  refreshTokenCell: 'B2',
};

export const age = 28;
export const height = 178;
export const lowerLimitCalorie = 1200;
export const lowerLimitStep = 1000;

export const withingsBaseUrl = 'https://wbsapi.withings.net';
export const fitbitBaseUrl = 'https://api.fitbit.com';
export const myfitnesspalBaseUrl = 'https://www.myfitnesspal.com';

export const userAgent =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.83 Safari/537.36';

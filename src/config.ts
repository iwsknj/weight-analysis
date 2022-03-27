export const workSheet = {
  headerValues: [
    '日付',
    '体重',
    '基礎代謝',
    '消費カロリー',
    '摂取カロリー',
    '歩数',
  ],

  headerColums: {
    date: {name: '日付', index: 0},
    weight: {name: '体重', index: 1},
    bmr: {name: '基礎代謝', index: 2},
    burnedCalorie: {name: '消費カロリー', index: 3},
    intakeCalorie: {name: '摂取カロリー', index: 4},
    step: {name: '歩数', index: 5},
  },
};

export const tokenSheet = {
  accessTokenCell: 'B1',
  refreshTokenCell: 'B2',
};

export const age = 28;
export const height = 178;

export const withingsEndPoint = 'https://wbsapi.withings.net';
export const fitbitEndPoint = 'https://api.fitbit.com';

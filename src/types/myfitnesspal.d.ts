export interface LoginParams {
  username: string;
  password: string;
  csrfToken: string;
  redirect: boolean;
  json: boolean;
}

export interface Pfc {
  date: string;
  totalCalorie: string;
  carbo: string;
  fat: string;
  protain: string;
}

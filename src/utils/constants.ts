import en from "assets/locales/en.json";

export const LOCALE = {
  EN: "EN"
};

export const LOCALE_STRINGS = {
  [LOCALE.EN]: en
};

export const COUNTRY_CONSTANTS = {
  [LOCALE.EN]: {
    phoneCode: "+1"
  }
};

export const DATE_FORMAT = {
  weekday: "long",
  year: "numeric",
  month: "short",
  day: "numeric",
} as any;

export const TIME_FORMAT = {
  hour: "2-digit",
  minute: "2-digit",
} as any;

export const INPUT_MASK = {
  DATE: "9999-99-99",
  PHONE: "(999) 999-9999"
}

export const STRING_FORMAT = {
  DATE: "yyyy-MM-dd"
}

export const TEXTAREA = {
  MAX: 5,
  MIN: 3
};

export const KEY_CODE = {
  ENTER: "Enter",
  TAB: "Tab",
}

export const MAX_INTEGER = 2147483647;
export const MIN_DATE = "1900-01-01";

export const REFRESH_RATE = {
  ALERT: 5000
}

export const S3 = {
  ENDPOINT: String(process.env.REACT_APP_ENDPOINT),
  ACCESS_KEY: String(process.env.REACT_APP_ACCESS_KEY),
  SECRET_KEY: String(process.env.REACT_APP_SECRET_KEY),
  BUCKET_NAME: String(process.env.REACT_APP_BUCKET_NAME),
}
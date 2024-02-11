import { Constants } from "utils";
import { Auxiliars, Checks, Combines, Sanitizes, Validations } from "helpers";

/**
 * function to convert date to ISO string with timezone
 * @param {Date} date the date to be converted
 * @param {string} time the time to be set
 * @return {string} date as ISO string
 */

export const toISOString = (date: Date | null, time?: string | null, timeZone: boolean = false): string => {
  if (!date) return "";
  const dateISO = date.toISOString();
  const dateString = dateISO.split('T')[0];
  const newTime = Validations.hasValue(time) ? time : toTimeString(toSeconds(date));
  return timeZone ? `${dateString}T${newTime}${Auxiliars.getTimeZoneOffset(date)}` : `${dateString}T${newTime}Z`;
}

/**
 * function to convert seconds to time string (00:00:00)
 * @param {number} value time to be converted (in seconds)
 * @param {boolean} seconds whether the date should include seconds
 * @return {string} an object containing the count of days, hours, minutes and seconds as string
 */

export const toTimeString = (value: number, seconds: boolean = true): string => {
  const response = toTime(value);
  if (Checks.isObject(response)) {
    const length = Object.keys(response).length;
    const mapped = Object.values(response)
      .map((item) => Auxiliars.pad(item))
      .join(":");
    return length === 1 ? "00:" + mapped : length === 3 && !seconds ? mapped.slice(0, 5) : mapped;
  }
  return "00:00:00";
};

/**
 * function to convert a given time (from date) to its equivalent in seconds
 * @param {date} value the date to be converted
 * @return {number} the time in seconds
 */

export const toSeconds = (value: Date): number => {
  if (!value) return 0;
  const hours = value.getHours();
  const minutes = value.getMinutes();
  const seconds = value.getSeconds();
  return hours * 3600 + minutes * 60 + seconds;
}

/**
 * function to convert a given time as string to its equivalent in minutes
 * @param {string} value the time as string e.g. 10:00 AM or 14:00
 * @return {number} the number of minutes e.g. 10:00 AM equals to 600
 */

export const toMinutes = (value: string | null, am: string = "AM"): number => {
  if (!value) return 0;
  const array = value.toUpperCase().split(" ");
  const time = array[0].split(':');
  const ampm = time.length === 2;
  const period = ampm ? array[1].toUpperCase() : null;
  const hour = Number(time[0]);
  const hours = hour * 60 + Number(time[1]);
  const extra = !ampm || period === am || hour === 12 ? 0 : 12 * 60;
  return hours + extra;
}

/**
* function to return the start and end date of the appointment
* @param {Date} date the date of the appointment
* @param {string} slot the time slot of the appointment
* @param {number} duration the length of the slot
* @param {string} timeZone the time zone offset
* @return {{ start: string, end: string }} the start and end date as ISO format YYYY-MM-DDTHH:MM:SSZ
*/

export const toDateStartEnd = (date: Date | null, slot: string | null, duration: number, timeZone: boolean = false): { start: string, end: string } => {
  if (!date) return { start: "", end: "" };
  const minutes = toMinutes(slot)
  const startTime = toTimeString(minutes * 60);
  const endTime = toTimeString((minutes + (duration)) * 60);
  return { start: toISOString(date, startTime, timeZone), end: toISOString(date, endTime, timeZone) };
}

/**
 * function to convert seconds to days, hours, minutes, seconds
 * @param {number} value time to be converted (in seconds)
 * @return {any} an object containing the count of days, hours, minutes and seconds or the value itself
 */

export const toTime = (value: number): any => {
  if (value <= 0) return value;
  else {
    const day = Math.floor(value / 86400);
    const hour = Math.floor((value - day * 86400) / 3600);
    const min = Math.floor((value - day * 86400 - hour * 3600) / 60);
    const sec = Math.floor(value - day * 86400 - hour * 3600 - min * 60);
    return hour > 0
      ? { hour, min, sec }
      : min > 0
        ? { min, sec }
        : { sec };
  }
};

/**
 * function to convert 24-hour time string to AM/PM format
 * @param {number} value time to be converted in seconds
 * @param {boolean} seconds whether the date should include seconds
 * @return {string} the time in AM/PM format
 */

export const toTimeAmPmString = (value: number, seconds: boolean = true, am: string = "am", pm: string = "pm"): string => {
  const timeString = toTimeString(value, seconds);
  const time = timeString.split(":");
  const hour = Number(time.shift());
  if (hour >= 12) {
    const diff = 12 - Number(hour);
    return Auxiliars.pad(Math.abs(diff === 0 ? 12 : diff)) + ":" + time.map((item) => Auxiliars.pad(item))
      .join(":") + " " + pm;
  }
  return timeString + " " + am;
};

/**
 * function to convert hsl format to hex color format
 * @param {number} h hue value 
 * @param {number} s saturation value 
 * @param {number} l lightness value 
 * @return {string} the color in HEX format
 */

export const toHexAsHsl = (h: number, s: number, l: number): string => {
  l /= 100;
  const a = (s * Math.min(l, 1 - l)) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

/**
 * function to convert hex format to hsl color format
 * @param {string} hex hex value
 * @return {string} the color in HSL format
 */

export const toHslAsHex = (
  hex: string
): { h: number; s: number; l: number } | undefined => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

  if (result && result.length > 2) {
    const r = parseInt(result[1], 16) / 255;
    const g = parseInt(result[2], 16) / 255;
    const b = parseInt(result[3], 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);

    let h = 0,
      s = 0,
      l = (max + min) / 2;

    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
      }
      h /= 6;
    }

    s = s * 100;
    s = Math.round(s);
    l = l * 100;
    l = Math.round(l);
    h = Math.round(360 * h);

    return { h, s, l };
  }
}

/**
 * function to convert rgb format to hex color format
 * @param {number} r red value 
 * @param {number} g green value 
 * @param {number} b blue value 
 * @return {string} the color in Hex format
 */

export const toHexAsRgb = (r: number, g: number, b: number): string => {
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
}

/**
 * function to convert rgb string format to hex color format
 * @param {string} rgb rgb value
 * @return {string} the color in Hex format
 */

export const toHexAsRgbString = (rgb: string): string => {
  return toHexAsRgb(...toRgbAsString(rgb));
}

/**
 * function to convert rgb string format to rgb object
 * @param {string} rgb rgb value
 * @return {[number, number, number]} the rgb object
 */

export const toRgbAsString = (rgb: string): [number, number, number] => {
  const rgbValues = rgb
    .substring(4, rgb.length - 1)
    .split(",")
    .map((value) => parseInt(value.trim(), 10));
  return [rgbValues[0], rgbValues[1], rgbValues[2]];
}

/**
 * function to convert hex string format to rgb object
 * @param {string} hex hex value
 * @return {[number, number, number]} the rgb object
 */

export const toRgbAsHex = (hex: string): [number, number, number] => {
  const bigint = parseInt(hex.replace("#", ""), 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return [r, g, b];
};

/**
 * function to format a number to a currency string
 * @param {number} amount value to be formatted
 * @param {string} currency the currency to be used
 * @param {string} locale the locale to be considered 
 * @returns {string} the formatted amount
 */

export const toMoney = (amount: number, currency: string, locale: string = Constants.LOCALE.EN): string => {
  if (isNaN(amount)) amount = 0;
  const formatter = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
  });

  return formatter.format(amount);
}

/**
 * function to format a number to a unit string
 * @param {number} amount value to be formatted
 * @param {string} unit the unit to be used 
 * @param {string} locale the locale to be considered 
 * @returns {string} the formatted amount
 */

export const toUnit = (amount: number, unit: string, locale: string = Constants.LOCALE.EN): string => {
  if (isNaN(amount)) amount = 0;
  try {
    const formatter = new Intl.NumberFormat(locale, {
      style: 'unit',
      unit: unit,
      minimumFractionDigits: 2,
    });

    return formatter.format(amount);
  } catch (error) {
    return `${amount} ${unit}`;
  }
}

/**
 * function to return a friendly date
 * @return {string} the friendly date message
 */

export const toRelativeDate = (str: string | number, t: any, locale: string = "en", dateOnly: boolean = false): string => {
  const date = new Date(str);
  const today = Sanitizes.clearTime(new Date());
  const days = Checks.inBetween(date, today);
  const dateWithoutTime = Sanitizes.clearTime(date);
  const tomorrow = Sanitizes.clearTime(new Date(today).setDate(today.getDate() + 1));
  const yesterday = Sanitizes.clearTime(new Date(today).setDate(today.getDate() - 1));

  return (Checks.isDateEquals(dateWithoutTime, today)) ? dateOnly ? t.today : Combines.interpolate(t.today_at, { time: date.toLocaleTimeString(locale, { ...Constants.TIME_FORMAT }) }) :
    (Checks.isDateEquals(dateWithoutTime, tomorrow)) ? dateOnly ? t.tomorrow : Combines.interpolate(t.tomorrow_at, { time: date.toLocaleTimeString(locale, { ...Constants.TIME_FORMAT }) }) :
      (Checks.isDateEquals(dateWithoutTime, yesterday)) ? dateOnly ? t.yesterday : Combines.interpolate(t.yesterday_at, { time: date.toLocaleTimeString(locale, { ...Constants.TIME_FORMAT }) }) :
        Math.abs(days) <= 3 ? days > 0 ? Combines.interpolate(t.day_ago, { day: Math.abs(days) }) : Combines.interpolate(t.in_day, { day: Math.abs(days) }) : dateOnly ? date.toLocaleDateString(locale, { ...Constants.DATE_FORMAT }) : date.toLocaleString(locale, { ...Constants.DATE_FORMAT, ...Constants.TIME_FORMAT });
}

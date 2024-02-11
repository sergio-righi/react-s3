import { Sanitizes, Validations } from "helpers";

/**
 * function to check if the given value is an object
 * @param {any} value object to be tested
 * @return {boolean} true if the value is an object but not an array
 */

export const isObject = (value: any): boolean => !!value && Object.prototype.toString.call(value) === "[object Object]";

/**
 * function to check if the given value is a number
 * @param {any} value number to be tested
 * @return {boolean} true if the value is a number
 */

export const isNumber = (value?: string | number): boolean => {
  return ((value != null) &&
    (value !== '') &&
    !isNaN(Number(value.toString())));
}

/**
 * function to calculate the days between two dates
 * @param {string | Date} a the date to be compared
 * @param {string | Date} b the date to be compared
 * @return {number} number of the days
 */

export const inBetween = (a: string | Date, b: string | Date): number => {
  const inBetween = new Date(b).getTime() - new Date(a).getTime();
  return Math.round(inBetween / (1000 * 60 * 60 * 24));
}

/**
 * function to compare two given dates
 * @param {string | Date} a the date to be compared
 * @param {string | Date} b the date to be compared
 * @return {boolean} if the dates are the same
 */

export const isDateEquals = (a: string | Date, b: string | Date): boolean => {
  return Sanitizes.clearTime(a).getTime() === Sanitizes.clearTime(b).getTime();
}

/**
 * function to check if the assigned date is within the given range
 * @param {date} value date to be tested
 * @param {date} min min date
 * @param {date} max max date
 * @return {boolean} true if the date is within the range
 */

export const inRange = (value: Date, min?: Date, max?: Date): boolean => {
  if (!value) return false;
  return min && max
    ? (value > min || isDateEquals(value, min)) && (value < max || isDateEquals(value, max))
    : min && !max
      ? value > min || isDateEquals(value, min)
      : !min && max
        ? value < max || isDateEquals(value, max)
        : true;
};
import { Expressions } from "helpers";

/**
 * function to remove time from date
 * @param {string} date the date to be updated
 * @return {Date} the date without time
 */

export const clearTime = (date: string | Date | number): Date => {
  const newDate = new Date(date);
  newDate.setHours(0, 0, 0, 0);
  return newDate;
}

/**
 * function to make sure the value is a number (no left zeros)
 * @param {string} value the given string
 * @return {string} the new string with only numeric characters
 */

export const toNumber = (value: string): string => value?.replace(Expressions.isNumber, "");

/**
 * function to make ensure the hex color format
 * @param {string} value the given string
 * @return {string} the new string in hex format
 */

export const toHexColor = (value: string): string => value.replace(Expressions.isHexColor, "").slice(0, 6);

/**
 * function to apply phone mask to the given string
 * @param {string} value the given string
 * @return {string} the new string in phone format
 */

export const toPhone = (value: string): string => toNumber(value)?.replace(/^(\d{3})(\d{3})(\d{4})$/, '($1) $2-$3');
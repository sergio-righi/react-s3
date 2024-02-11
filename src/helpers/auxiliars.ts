import { Conversions } from "helpers";

/**
 * function to join classNames
 * @param {any} args classes
 * @return {string} merged array of classes
 */

export const classNames = (...args: any): string => {
  return args.filter((x: any) => !!x).join(" ");
}

/**
 * function to change a position in the array (for state)
 * @param {any[]} arr array to be modified
 * @param {number} index index to be updated
 * @param {any} value value to be updated
 * @return {any[]} merged array of classes
 */

export const setArrayIndex = (arr: any[], index: number, value: any) => {
  const items = [...arr];
  items[index] = value;
  return items;
}

/**
 * function to add leading zeros
 * @param {number} value number to be filled with leading zeros
 * @param {number} size result length (default 2)
 * @return {string} value if the leading zeros
 */

export const pad = (value: number | any, size: number = 2): string => {
  return !isNaN(Number.parseFloat(value))
    ? "0".repeat(Math.max(0, size - Math.abs(value).toString().length)) +
    Math.abs(value)
    : "";
};

/**
 * function to generate an array of a given size
 * @param {number} count size of the array 
 * @return {array} array of numbers
 */

export const generateArray = (count: number): Array<number> => {
  return Array.from(Array(count).keys());
}

/**
 * function to remove all properties that contains null or undefined values
 * @param {Object} obj the object to be modified
 * @return {Object} the new object with all properties removed
 */

export const removeFromObject = (obj: any): Object => {
  const cpy = { ...obj };
  Object.keys(cpy).forEach((key: string) => {
    if (cpy[key] === null || cpy[key].toString().length === 0 || cpy[key] === 0) {
      delete cpy[key];
    }
  });
  return cpy;
}

/**
 * it simulates a asynchronous call to an API function
 * @param {Function} callback the function to be called
 */

export const asyncMethod = async (callback: Function) => {
  const delayPromise = (ms: number) => new Promise(res => setTimeout(res, ms))
  await delayPromise(500)
  return callback()
}

/**
 * get enum value by key
 * @param {enum} enumerator enum to be used
 * @param {string} key key to be searched 
 * @return 
 */

export const getEnumByKey = (enumerator: any, key: string) => {
  const indexOf = Object.values(enumerator).indexOf(key as unknown);
  return indexOf !== -1 ? Object.keys(enumerator)[indexOf] : null;
}

/**
 * it deeply merges two objects (only given properties are replaced)
 * @param {object} source the source object 
 * @param {object} replacement the object to be merged with the source
 * @return {object} the merged object
 */

export const deepInterpolation = (source: any, replacement: any): any => {
  // Create a copy of the original object to avoid modifying the original data
  const result = { ...source };

  // Recursively merge the replacement object into the original object
  const mergeObjects = (obj1: any, obj2: any) => {
    for (const key in obj2) {
      if (obj2.hasOwnProperty(key)) {
        // Check whether the property is an object for doing deep merging (if it is array, it must replace it)
        if (obj2[key] instanceof Object && obj1.hasOwnProperty(key) && obj1[key] instanceof Object && !Array.isArray(obj1[key])) {
          mergeObjects(obj1[key], obj2[key]);
        } else {
          obj1[key] = obj2[key];
        }
      }
    }
  };

  mergeObjects(result, replacement);

  return result;
}

/**
 * function to get the name of the timezone
 * @return {string} the time zone name
 */

export const getTimeZoneDescription = (): string => {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

/**
 * function to get the time offset of a given date (or current date if nothing is given)
 * @param {Date | null} date the date where the time offset should be retrieved
 * @returns {string} time offset
 */

export const getTimeZoneOffset = (date?: Date | null): string => {
  const offset = (date ?? new Date()).getTimezoneOffset();
  const behind = offset > 0;
  return `${behind ? "-" : ""}${Conversions.toTimeString(offset)}`;
};

/**
 * function to add time zone offset to a given date
 * @param {Date} date date which the offset should be added
 * @return {Date} the new date
 */

export const addTimeZoneOffset = (date?: Date | null): Date | null => {
  if (!date) return null;
  const timeZoneOffset = date.getTimezoneOffset();
  const minutes = timeZoneOffset < 0 ? -timeZoneOffset : timeZoneOffset;
  date.setMinutes(date.getMinutes() + minutes);
  return date;
}

/**
 * method that returns the propert text color according to the provided background color based on the luminance
 * @param {string} backgroundColor the background to be used as reference
 * @param {string} black the color to be used in case its black
 * @param {string} white the color to be used in case its white 
 * @return {string} the contrast color
 */

export const getContrast = (backgroundColor: string, black: string = "black", white: string = "white"): string => {
  // Helper function to calculate the luminance of an RGB color
  const getLuminance = ([r, g, b]: [number, number, number]): number => {
    const [rl, gl, bl] = [r / 255, g / 255, b / 255];
    const [rSrgb, gSrgb, bSrgb] = [
      rl <= 0.03928 ? rl / 12.92 : ((rl + 0.055) / 1.055) ** 2.4,
      gl <= 0.03928 ? gl / 12.92 : ((gl + 0.055) / 1.055) ** 2.4,
      bl <= 0.03928 ? bl / 12.92 : ((bl + 0.055) / 1.055) ** 2.4,
    ];
    return 0.2126 * rSrgb + 0.7152 * gSrgb + 0.0722 * bSrgb;
  };

  // Convert the background color to RGB format
  let rgbColor: [number, number, number];
  if (backgroundColor.startsWith("#")) {
    rgbColor = Conversions.toRgbAsHex(backgroundColor);
  } else if (backgroundColor.startsWith("rgb(")) {
    rgbColor = Conversions.toRgbAsString(backgroundColor);
  } else {
    throw new Error("Invalid background color format. Please provide a color in hex or RGB format.");
  }

  // Calculate the luminance of the background color
  const luminance = getLuminance(rgbColor);

  // Determine the recommended text color based on luminance
  return luminance > 0.5 ? black : white;
}

/**
 * function to return the respective greeting to the user according to the current time
 * @return {string} the greeting message
 */

export const greeting = (): string => {
  const hour = new Date().getHours();
  return hour < 12 ? "good_morning" : hour > 12 && hour < 18 ? "good_afternoon" : hour > 22 ? "hello" : "good_evening";
};
/**
 * function to check if a given string has any value
 * @param {string[]} params values to be tested
 * @returns {boolean} true if it has value, false otherwise
 */

export const hasValue = (...params: (string | undefined | null)[]): boolean => {
  for (const value of params) {
    if (!(!!(value !== null && value !== undefined && value.toString().trim().length > 0))) {
      return false;
    }
  }
  return true;
}

/**
 * check if the given value is a valid email
 * @param {string} emailAddress the email address to be tested
 * @returns {boolean} true if the value is an email
 */

export const isEmail = (emailAddress: string): boolean => /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(emailAddress);

/**
 * check if the given value is a valid phone number
 * @param {string} phoneNumber the phone number to be tested
 * @returns {boolean} true if the value is a phone number
 */

export const isPhone = (phoneNumber: string): boolean => /^(\+1)?\s?\(?(\d{3})\)?[- ]?(\d{3})[- ]?(\d{4})$/.test(phoneNumber);

/**
 * it  checks whether the given latitude and longitude are valid
 * @param {number} latitude coordinate latitude
 * @param {number} longitude coordinate longitude
 * @returns 
 */

export const isLatitudeLongitudeValid = (latitude: number, longitude: number): boolean => isFinite(latitude) && Math.abs(latitude) <= 90 && isFinite(longitude) && Math.abs(longitude) <= 180

/**
 * function to check if the given password meets all the rules
 * @param {string} password given password
 * @return {boolean} if the password meets all the rules
 */

export const isPasswordValid = (password: string): boolean => {
  if (!hasValue(password)) return false;
  if (password.length < 8) return false;
  if (!/[0-9]/.test(password)) return false;
  if (!/[a-z]/gi.test(password)) return false;
  if (!/[A-Z]/gi.test(password)) return false;
  if (!/[@#\\$%&*]/gi.test(password)) return false;
  return true;
}

/**
 * check if the email provided is from gmail
 * @param {string} email 
 * @returns {boolean} whether is a gmail account or not
 */

export const isGmail = (email: string): boolean => {
  const match = email.match(/^[\w\\.-]+@([\w\\.-]+)$/);
  if (match) {
    const domain = match[1];
    return domain.toLowerCase() === 'gmail.com';
  }
  return false;
}
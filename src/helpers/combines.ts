
/**
 * function to interpolate a string with their respective values
 * @param {string} str string e.g. the {{user}} must be logged in
 * @param {any} obj object e.g. { user: 'username' }
 * @return {string} the username must be logged in
 */

export const interpolate = (str: string, obj: any): string => {
  return Object.keys(obj).reduce((previousValue: string, currentValue: string) => {
    return previousValue.replaceAll(`{{${currentValue}}}`, obj[currentValue]);
  }, str);
};

/**
 * function to interpolate a URL with their respective values
 * @param {string} url string e.g. /foo/bar/:id
 * @param {any} obj object e.g. { id: 12345 }
 * @return {string} /foo/bar/12345
 */

export const interpolateURL = (url: string, obj: any): string => {
  return Object.keys(obj).reduce((previousValue: string, currentValue: string) => {
    return previousValue.replaceAll(`:${currentValue}`, obj[currentValue]);
  }, url);
};

/**
 * function to join strings into one with slashes
 * @param {string[]} params parameters to be joined e.g. foo, bar, baz
 * @return {string} foo/bar/baz
 */

export const joinURL = (...params: string[]): string => {
  return params.join('/');
}

/**
 * function to convert a given obj to query string
 * @param {string} url  string e.g. /foo/bar
 * @param {any} obj the object to be converted e.g. { id: 123, name: "xyz" }
 * @return {string} queryString e.g. "/foo/bar?id=123&name=xyz"
 */

export const toQueryString = (url: string, obj: any): string => {
  return url + "?" + Object.keys(obj).map((key) => encodeURIComponent(key) + '=' + encodeURIComponent(obj[key])).join('&');
}
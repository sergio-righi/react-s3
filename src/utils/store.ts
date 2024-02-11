import { PairValue } from "types";

const sessionStorage = {
  sessionName: 'app',

  /** 
   * function to return the session object
   * @returns {PairValue[]} either {}
   */

  get: (): PairValue[] | null => {
    return window.sessionStorage[sessionStorage.sessionName] ? JSON.parse(window.sessionStorage[sessionStorage.sessionName]) : null;
  },

  /** 
   * function to set the user session
   * @param {object} values the data to be stored
   */

  set: (values: PairValue[]): void => {
    window.sessionStorage[sessionStorage.sessionName] = JSON.stringify(values)
  },

  /** 
   * function to clear the user session
   */

  clear: (): void => {
    window.sessionStorage[sessionStorage.sessionName] = null;
  },
}

export {
  sessionStorage
}
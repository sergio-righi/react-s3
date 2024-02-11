import React, { createContext, useContext } from "react";
import { Constants, Store } from "utils";
import { Feedback, PairValue } from "types";

interface ProvidedValueType {
  user: PairValue[] | null;
  setUser: (user: any) => void;
  t: any;
  locale: string;
  locales: any;
  setLocale: (language: string) => void;
  feedback: Feedback | null;
  setFeedback: (feedback: Feedback | null) => void;
}

const initialState = {
  locale: "EN",
  translations: Constants.LOCALE_STRINGS[Constants.LOCALE.EN],
  locales: Object.keys(Constants.LOCALE),
  user: Store.sessionStorage.get() as PairValue[],
  feedback: null,
};

export const AppContext = createContext<ProvidedValueType>({
  user: initialState.user,
  setUser: () => {},
  t: initialState.translations,
  locale: initialState.locale,
  locales: initialState.locales,
  setLocale: () => {},
  feedback: initialState.feedback,
  setFeedback: () => {},
});

interface Props {
  initLocale: string;
  children?: React.ReactNode;
}

export const AppProvider = React.memo<Props>(({ initLocale, children }) => {
  const [user, setUser] = React.useState<PairValue[] | null>(initialState.user);

  const [locale, setLocale] = React.useState<string>(initLocale);
  const [feedback, setFeedback] = React.useState<Feedback | null>(
    initialState.feedback
  );

  const setUserCallback = React.useCallback((newUser: PairValue[] | null) => {
    setUser((currentUser: PairValue[] | null) => {
      if (newUser === null) {
        Store.sessionStorage.clear();
      } else {
        Store.sessionStorage.set(newUser);
      }
      return Store.sessionStorage.get();
    });
  }, []);

  const MemoizedValue = React.useMemo(() => {
    const value: ProvidedValueType = {
      locale,
      t: Constants.LOCALE_STRINGS[locale],
      locales: Constants.LOCALE_STRINGS[locale],
      setLocale,
      user,
      setUser: setUserCallback,
      feedback,
      setFeedback,
    };
    return value;
  }, [locale, user, setUserCallback, feedback]);

  return (
    <AppContext.Provider value={MemoizedValue}>{children}</AppContext.Provider>
  );
});

export const useApp = () => useContext(AppContext);

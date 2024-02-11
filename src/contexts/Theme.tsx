import React, { createContext, useContext } from "react";
import { Theme } from "themes/interfaces";
import { Light } from "themes";
import { Auxiliars } from "helpers";

type ThemeProps = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

export const ThemeContext = createContext<ThemeProps>({
  theme: Light,
  setTheme: () => {},
});

interface Props {
  initTheme: Theme;
  children?: React.ReactNode;
}

export const ThemeProvider = React.memo<Props>(
  ({ initTheme, children }: Props) => {
    const [theme, setTheme] = React.useState<Theme>(initTheme);

    const setThemeCallback = React.useCallback((newTheme: Theme) => {
      setTheme((currentTheme: Theme) =>
        Auxiliars.deepInterpolation(currentTheme, newTheme)
      );
    }, []);

    const MemoizedValue = React.useMemo(() => {
      const value: ThemeProps = {
        theme,
        setTheme: setThemeCallback,
      };
      return value;
    }, [theme, setThemeCallback]);

    return (
      <ThemeContext.Provider value={MemoizedValue}>
        {children}
      </ThemeContext.Provider>
    );
  }
);

export const useTheme = () => useContext(ThemeContext);

import "assets/scss/layouts/default.scss";

import { Box } from "@mui/material";
import { Outlet } from "react-router-dom";
import { useTheme } from "contexts";
import { ThemeProvider } from "@mui/material/styles";
import { Themes } from "utils";

export const DefaultLayout = () => {
  const { theme } = useTheme();

  return (
    <ThemeProvider theme={Themes.defaultTheme(theme)}>
      <Box>
        <Outlet />
      </Box>
    </ThemeProvider>
  );
};

import "./index.scss";

import ReactDOM from "react-dom/client";
import Routers from "router";
import { AppProvider, ThemeProvider } from "contexts";
import { Light } from "themes";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

// document.documentElement.setAttribute("theme", "dark");

root.render(
  // <React.StrictMode>
  <AppProvider initLocale={"EN"}>
    <ThemeProvider initTheme={Light}>
      <Routers />
    </ThemeProvider>
  </AppProvider>
  // </React.StrictMode>
);

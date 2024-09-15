import { BrowserRouter, Route, Routes } from "react-router-dom";
import { DefaultLayout, EmptyLayout } from "layouts";
import { Error } from "components";
import { Routes as Urls } from "utils";
import { Protected } from "middlewares";
import { Home } from "pages";

// eslint-disable-next-line import/no-anonymous-default-export
export default () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* landing page */}
        <Route index path={Urls.home} element={<Home />} />

        {/* default routes */}
        <Route path="*" element={<EmptyLayout />}>
          <Route index element={<Error.Error404 />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

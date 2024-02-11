import { Outlet } from "react-router-dom";
import { Box } from "@mui/material";

export const EmptyLayout = () => {
  return (
    <Box>
      <Outlet />
    </Box>
  );
};

import React from "react";
import { useTheme } from "contexts";
import { Box, Skeleton } from "@mui/material";

export const PlaceholderItem = () => {
  const { theme } = useTheme();

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        marginBottom: theme.spacing.sm,
      }}
    >
      <Skeleton animation="wave" variant="circular" width={40} height={40} />
      <Box
        sx={{
          flex: 1,
          display: "flex",
          mx: theme.spacing.xs,
          flexDirection: "column",
        }}
      >
        <Skeleton
          animation="wave"
          variant="rectangular"
          sx={{ width: 1, marginBottom: theme.spacing.xs }}
          height={15}
        />
        <Skeleton
          animation="wave"
          variant="rectangular"
          sx={{ width: "75%" }}
          height={10}
        />
      </Box>
      <Skeleton animation="wave" variant="circular" width={30} height={30} />
    </Box>
  );
};

import * as React from "react";
import { Box, LinearProgress, LinearProgressProps } from "@mui/material";
import { Custom } from "components";
import { useTheme } from "contexts";

type Props = LinearProgressProps & {
  value: number;
};

export const LinearProgressWithLabel = (props: Props) => {
  const { theme } = useTheme();

  return (
    <Box sx={{ display: "flex", alignItems: "center" }}>
      <Box sx={{ width: "100%", mr: 1 }}>
        <LinearProgress
          variant="determinate"
          sx={{
            width: 1,
            height: 6,
            borderRadius: theme.border.radius,
            backgroundColor: theme.palette.background.color,
            "& .MuiLinearProgress-bar": {
              borderRadius: theme.border.radius,
              backgroundColor: theme.color.accent.color,
            },
          }}
          {...props}
        />
      </Box>
      <Box sx={{ minWidth: 35 }}>
        <Custom.Typography>{`${Math.round(props.value)}%`}</Custom.Typography>
      </Box>
    </Box>
  );
};

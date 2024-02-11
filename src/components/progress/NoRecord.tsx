import { useApp, useTheme } from "contexts";
import { Box } from "@mui/material";
import { Custom } from "components";

type Props = {
  height?: number;
  message?: string;
};

export const NoRecord = (props: Props) => {
  const { theme } = useTheme();

  function render() {
    return (
      <Box
        sx={{
          width: 1,
          top: "50%",
          left: "50%",
          textAlign: "center",
          position: "absolute",
          transform: "translate(-50%, -50%)",
          color: theme.palette.font.color,
        }}
      >
        <Custom.Typography>{props.message}</Custom.Typography>
      </Box>
    );
  }

  return props.height ? <Box height={props.height}>{render()}</Box> : render();
};

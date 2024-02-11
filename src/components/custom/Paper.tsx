import React, { forwardRef } from "react";
import { Paper as MUIPaper, PaperProps } from "@mui/material";
import { useTheme } from "contexts";

type Props = PaperProps & {
  children?: React.ReactNode;
};

export const Paper = forwardRef((props: Props, ref: any) => {
  const { theme } = useTheme();

  return (
    <MUIPaper
      {...props}
      sx={{
        color: theme.palette.font.color,
        borderRadius: theme.border.radius,
        backgroundColor: theme.palette.background.accent,
        ...props.sx,
      }}
    >
      {props.children}
    </MUIPaper>
  );
});

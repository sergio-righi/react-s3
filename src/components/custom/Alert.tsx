import React from "react";
import { Alert as MUIAlert, AlertColor } from "@mui/material";
import { useTheme } from "contexts";

export type Props = {
  sx?: any;
  className?: string;
  variant: "standard" | "filled" | "outlined" | undefined;
  severity: AlertColor | undefined;
  children: React.ReactNode | any;
};

export const Alert = (props: Props) => {
  const { theme } = useTheme();

  return (
    props.children && (
      <MUIAlert
        sx={{
          ...props.sx,
          borderRadius: theme.border.radius,
        }}
        variant={props.variant}
        severity={props.severity}
        className={props.className}
      >
        {props.children}
      </MUIAlert>
    )
  );
};

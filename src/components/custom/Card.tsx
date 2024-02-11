import React from "react";
import { Card as MUICard, CardContent, CardProps } from "@mui/material";
import { useTheme } from "contexts";

type Props = CardProps & {
  children?: React.ReactNode;
};

export const Card = (props: Props) => {
  const { theme } = useTheme();

  return (
    <MUICard
      {...props}
      elevation={0}
      sx={{
        color: theme.palette.font.color,
        borderRadius: theme.border.radius,
        backgroundColor: theme.palette.background.accent,
        ...props.sx,
      }}
    >
      <CardContent>{props.children}</CardContent>
    </MUICard>
  );
};

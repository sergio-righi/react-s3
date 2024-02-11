import React from "react";
import { Avatar as MUIAvatar } from "@mui/material";
import { useTheme } from "contexts";

type Props = {
  sx?: any;
  bg?: string;
  name?: string;
  color?: string;
  small?: boolean;
};

export const Avatar = (props: Props) => {
  const { theme } = useTheme();
  const letter = props.name ? props.name[0] : "?";

  const size = props.small
    ? { width: 24, height: 24, fontSize: theme.font.sm }
    : {};

  return (
    <MUIAvatar
      sx={{
        ...size,
        textTransform: "uppercase",
        color: props.color ?? theme.color.primary.text,
        backgroundColor: props.bg ?? theme.color.primary.color,
      }}
    >
      {letter}
    </MUIAvatar>
  );
};

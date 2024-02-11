import React from "react";
import { Badge as MUIBadge, BadgeProps } from "@mui/material";
import { useTheme } from "contexts";

export type Props = BadgeProps & {
  sx?: any;
  badge: number;
  inline?: boolean;
};

export const Badge = (props: Props) => {
  const { theme } = useTheme();
  return (
    <>
      {props.badge > 0 ? (
        <MUIBadge
          sx={{
            "& .MuiBadge-badge": {
              transform: props.inline ? "none" : null,
              position: props.inline ? "relative" : null,
              color: props.sx?.color ?? theme.color.primary.text,
              backgroundColor:
                props.sx?.backgroundColor ?? theme.color.primary.color,
            },
            fontWeight: theme.font.light,
            ...props.sx,
          }}
          badgeContent={props.badge}
        >
          {props.children}
        </MUIBadge>
      ) : (
        props.children
      )}
    </>
  );
};

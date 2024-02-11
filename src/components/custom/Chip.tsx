import React from "react";
import { Chip as MUIChip, ChipProps, SxProps } from "@mui/material";
import { useTheme } from "contexts";
import { Auxiliars } from "helpers";

export type Props = ChipProps & {
  label?: string;
  selected?: boolean;
  withShadow?: boolean;
  incrementComponent?: number;
};

export const Chip = ({
  label,
  withShadow = false,
  selected = false,
  ...props
}: Props) => {
  const { theme } = useTheme();

  const backgroundColor: string = selected
    ? theme.color.accent.color
    : props.sx && "backgroundColor" in props.sx
    ? String(props.sx.backgroundColor)
    : theme.palette.theme;

  const stylesheet = {
    backgroundColor: backgroundColor,
    color: Auxiliars.getContrast(backgroundColor),
  };

  const fontSize =
    props.sx && "fontSize" in props.sx ? props.sx.fontSize : theme.font.xs;

  const fontWeight =
    props.sx && "fontWeight" in props.sx
      ? props.sx.fontWeight
      : theme.font.semiBold;

  const paddingLeft =
    label && (props.avatar || props.icon) ? theme.spacing.xs : undefined;

  function handleClick(event: React.MouseEvent<HTMLDivElement>) {
    props.onClick && props.onClick(event);
  }

  function handleDelete() {
    props.onDelete && props.onDelete(props.id ?? label);
  }

  return (
    <MUIChip
      {...props}
      label={label}
      sx={
        {
          ...stylesheet,
          fontSize: fontSize,
          fontWeight: fontWeight,
          paddingLeft: paddingLeft,
          borderRadius: theme.border.circle,
          boxShadow: withShadow ? theme.palette.shadow : undefined,
          "&:hover": stylesheet,
          "& .MuiChip-icon": {
            color: "currentColor",
          },
          "& .MuiChip-deleteIcon": {
            color: "currentColor",
            "&:hover": {
              color: "currentColor",
            },
          },
        } as SxProps
      }
      onClick={handleClick}
      onDelete={props.onDelete ? handleDelete : undefined}
    />
  );
};

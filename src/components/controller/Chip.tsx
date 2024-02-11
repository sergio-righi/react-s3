import React, { useState } from "react";
import { Stack, SxProps } from "@mui/material";
import { Custom } from "components";
import { useTheme } from "contexts";

type Props = {
  sx?: SxProps;
  wrap?: boolean;
  column?: boolean;
  sxItem?: SxProps;
  multiple?: boolean;
  disabled?: boolean;
  items: Custom.ChipProps[];
  onSelect?: (value: any[]) => void;
};

export const Chip = ({
  wrap = false,
  multiple = false,
  disabled = false,
  column = false,
  ...props
}: Props) => {
  const { theme } = useTheme();
  const [selected, setSelected] = useState<(string | number)[]>([]);

  function handleClick(event: React.MouseEvent<HTMLDivElement>) {
    const newSelected = [...selected];
    const id = String(event.currentTarget.id);
    const index = newSelected.indexOf(id);
    if (multiple) {
      if (index === -1) newSelected.push(id);
      else newSelected.splice(index, 1);
    } else {
      newSelected.splice(0, 1);
      if (index === -1) newSelected.push(id);
    }
    setSelected(newSelected);
    props.onSelect && props.onSelect(newSelected);
  }

  return (
    <Stack
      sx={props.sx}
      flexWrap={wrap ? "wrap" : undefined}
      direction={column ? "column" : "row"}
      gap={wrap ? theme.spacing.md : undefined}
    >
      {props.items.map((item: Custom.ChipProps, i: number) => (
        <Custom.Chip
          {...item}
          key={i}
          sx={props.sxItem}
          disabled={disabled}
          onClick={handleClick}
          selected={selected.indexOf(String(item.id) ?? item.label) !== -1}
        />
      ))}
    </Stack>
  );
};

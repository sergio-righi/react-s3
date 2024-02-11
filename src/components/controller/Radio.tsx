import React from "react";
import {
  RadioGroup as MUIRadioGroup,
  FormControlLabel,
  Stack,
} from "@mui/material";
import { useTheme } from "contexts";
import { Custom } from "components";

export type RadioProps = {
  value?: any;
  label: string;
};

type Props = {
  sx?: any;
  value?: any;
  name?: string;
  inline?: boolean;
  items: RadioProps[];
  onChange?: (
    event: React.ChangeEvent<HTMLInputElement>,
    value: string
  ) => void;
};

export const Radio = (props: Props) => {
  const { theme } = useTheme();

  return (
    <MUIRadioGroup
      name={props.name}
      value={props.value}
      onChange={props.onChange}
    >
      <Stack
        flexWrap="wrap"
        px={theme.spacing.md}
        direction={props.inline ? "row" : "column"}
        gap={props.inline ? theme.spacing.md : undefined}
      >
        {props.items.map((item: RadioProps, i: number) => (
          <FormControlLabel
            key={i}
            label={item.label}
            value={item.value ?? item.label}
            sx={{
              "& .MuiFormControlLabel-label": {
                fontSize: theme.font.sm,
                color: theme.palette.font.color,
              },
            }}
            control={<Custom.Radio />}
          />
        ))}
      </Stack>
    </MUIRadioGroup>
  );
};

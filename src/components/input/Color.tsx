import React, { useEffect, useState } from "react";
import { useTheme } from "contexts";
import { Box, InputAdornment, TextFieldProps } from "@mui/material";
import { Custom } from "components";
import { Sanitizes } from "helpers";
import { Field } from "types";

type Props = TextFieldProps & {
  name: string;
  label: string;
  value: string;
  validate?: Field;
};

export const Color = (props: Props) => {
  const { theme } = useTheme();
  const [currentValue, setCurrentValue] = useState<string>(props.value);

  useEffect(() => {
    setCurrentValue(Sanitizes.toHexColor(props.value));
  }, [props.value]);

  function handleValueChange(event: React.ChangeEvent<HTMLInputElement>) {
    const sanitizedValue = Sanitizes.toHexColor(event.target.value);
    setCurrentValue(sanitizedValue);
    props.onChange &&
      props.onChange({
        target: {
          name: props.name,
          value: `#${sanitizedValue}`,
        },
      } as any);
  }

  return (
    <Custom.TextField
      {...props}
      sx={{ width: 1 }}
      label={props.label}
      value={currentValue}
      onChange={handleValueChange}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <Custom.Typography variant="h4">#</Custom.Typography>
          </InputAdornment>
        ),
        endAdornment: (
          <InputAdornment position="end">
            <Box
              width={20}
              height={20}
              bgcolor={`#${currentValue}`}
              borderRadius={theme.border.radius}
            />
          </InputAdornment>
        ),
      }}
    />
  );
};

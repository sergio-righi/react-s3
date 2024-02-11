import { useEffect, useState } from "react";
import { IconButton, InputAdornment, TextFieldProps } from "@mui/material";
import { Custom } from "components";

// icons
import { AddRounded, RemoveRounded } from "@mui/icons-material";

type Props = TextFieldProps & {
  min?: number;
  max?: number;
  step?: number;
  label: string;
  value?: number;
};

export const Number = ({
  min,
  max,
  step = 1,
  label,
  value = 0,
  ...props
}: Props) => {
  const [currentValue, setCurrentValue] = useState<number>(value);

  useEffect(() => {
    setCurrentValue(value);
  }, [value]);

  function handleValueChange(newValue: number) {
    if (min !== undefined && newValue < min) {
      newValue = min;
    }

    if (max !== undefined && newValue > max) {
      newValue = max;
    }

    setCurrentValue(newValue);
    props.onChange &&
      props.onChange({
        target: { name: props.name, value: newValue },
      } as any);
  }

  function handleIncrement() {
    handleValueChange(currentValue + step);
  }

  function handleDecrement() {
    handleValueChange(currentValue - step);
  }

  return (
    <Custom.TextField
      {...props}
      sx={{ width: 1 }}
      label={label}
      value={currentValue}
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <IconButton
              aria-label="Decrement"
              onClick={handleDecrement}
              disabled={min !== undefined && value <= min}
            >
              <RemoveRounded />
            </IconButton>
            <IconButton
              aria-label="Increment"
              onClick={handleIncrement}
              disabled={max !== undefined && value >= max}
            >
              <AddRounded />
            </IconButton>
          </InputAdornment>
        ),
      }}
    />
  );
};

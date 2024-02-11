import React, { useEffect, useState } from "react";
import {
  Checkbox as MUICheckbox,
  CheckboxProps,
  FormControlLabel,
} from "@mui/material";
import { useTheme } from "contexts";
import { Validations } from "helpers";

type Props = CheckboxProps & {
  label?: string;
};

export const Checkbox = (props: Props) => {
  const { theme } = useTheme();
  const [checked, setChecked] = useState<boolean>(false);

  useEffect(() => {
    setChecked(props.checked ?? false);
  }, [props.checked]);

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    setChecked(event.target.checked);
    props.onChange &&
      props.onChange(
        {
          target: {
            name: props.name,
            value: event.target.checked,
          },
        } as any,
        event.target.checked
      );
  }

  function render(): React.ReactElement {
    return (
      <MUICheckbox
        {...props}
        edge="start"
        disableRipple
        checked={checked}
        onChange={handleChange}
      />
    );
  }

  return Validations.hasValue(props.label) ? (
    <FormControlLabel control={render()} label={props.label} />
  ) : (
    render()
  );
};

import React, { forwardRef } from "react";
import InputMask from "react-input-mask";
import { TextField as MUITextField, TextFieldProps } from "@mui/material";
import { useTheme } from "contexts";
import { Constants } from "utils";
import { Validations } from "helpers";

type Props = TextFieldProps & {
  label?: string;
  value?: any;
  mask?: string;
  multiline?: boolean;
};

export const TextField = forwardRef((props: Props, ref: React.Ref<any>) => {
  const { theme } = useTheme();

  function renderTextField() {
    const conditionalProps = !props.mask
      ? {
          value: props.value,
          onBlur: props.onBlur,
          disabled: props.disabled,
          onChange: props.onChange,
        }
      : {};

    return (
      <MUITextField
        {...props}
        {...conditionalProps}
        ref={ref}
        variant="outlined"
        autoComplete="off"
        hiddenLabel={!Validations.hasValue(props.label)}
        minRows={props.multiline ? Constants.TEXTAREA.MIN : undefined}
        maxRows={props.multiline ? Constants.TEXTAREA.MAX : undefined}
        sx={{
          width: 1,
          borderRadius: theme.border.radius,
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: theme.palette.input.accent,
          },

          "& .MuiInputBase-input": {
            borderRadius: theme.border.radius / 4,
          },
          ...props.sx,
        }}
      />
    );
  }

  return props.mask ? (
    <InputMask
      mask={props.mask}
      value={props.value}
      onBlur={props.onBlur}
      disabled={props.disabled}
      onChange={props.onChange}
    >
      {renderTextField()}
    </InputMask>
  ) : (
    renderTextField()
  );
});

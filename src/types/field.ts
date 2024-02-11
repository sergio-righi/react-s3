import { Enums } from "utils";

export type Validate = {
  ref?: string;
  fn?: (value: string) => boolean;
  regex?: RegExp;
  length?: number;
  message?: string;
}

export type Validates = {
  [key in Enums.EnumValidation]?: Validate;
};

export type Field = {
  error?: boolean;
  errorText?: string;
  helperText?: string;
  validates: Validates;
};

export type Fields = {
  [key: string]: Field;
};
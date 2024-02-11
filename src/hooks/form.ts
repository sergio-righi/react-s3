import { SelectChangeEvent } from "@mui/material";
import { useEffect, useState } from "react";
import { Field, Fields } from "types";
import { Checks, Validations } from "helpers";
import { Enums } from "utils";

export type FormValues = {
  [key: string]: any;
};

type FormHookResult<T> = {
  onBlur: (event: React.FocusEvent<HTMLInputElement>) => void;
  onInput: (name: string, value: string) => void;
  onReset: () => void;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onDropdownChange: (event: SelectChangeEvent<number>) => void;
  onCustomChange: (name: string, value: any) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => Promise<void>;
  onValidate: (fields: Fields) => { isValid: boolean, response: Fields };
  isValid: boolean;
  values: T;
};

export const useForm = <T extends FormValues>(
  initialState: T = {} as T,
  initCallback?: (values: T, isValid: boolean) => void,
  submitCallback?: (event: React.FormEvent<HTMLFormElement>, isValid: boolean) => Promise<void>,
  updateCallback?: (name: string, value: any, values: T, isValid: boolean) => void,
  validationCallback?: (values: T) => boolean,
  shallReset: boolean = false
): FormHookResult<T> => {
  const [isValid, setValid] = useState<boolean>(false);
  const [values, setValues] = useState<T>(initialState);

  useEffect(() => initCallback && initCallback(values, validate(values)), []);

  const hasNotValue = (value: string): boolean => !Validations.hasValue(value)
  const isNotEquals = (value1: string, value2: string) => !Validations.hasValue(value1) && !Validations.hasValue(value2) && value1.trim() === value2.trim();
  const isNotGraterThan = (value1: number, value2: number): boolean => Checks.isNumber(value1) && Checks.isNumber(value2) && value1 <= value2;
  const isNotLessThan = (value1: number, value2: number): boolean => Checks.isNumber(value1) && Checks.isNumber(value2) && value1 >= value2;
  const hasNotMatch = (value: string, regex: RegExp | undefined): boolean => regex ? !regex.test(value) : false;
  const hasNotMinLength = (value: string, length: number | undefined): boolean => length ? !Validations.hasValue(value) && value.trim().length <= length : false;

  const getElement = (name: string) => Object.entries(values).find(
    ([key]) => key === name
  )

  function validate(values: T): boolean {
    if (validationCallback) {
      return validationCallback(values);
    }
    return false;
  }

  function onValidate(fields: Fields): { isValid: boolean, response: Fields } {
    let isValid = true;
    const newFields: Fields = {};
    Object.keys(fields).forEach((name: string) => {
      const field: Field = fields[name];
      if (field && field.validates) {
        const [_, elmValue]: any = getElement(name);
        Object.keys(field.validates).forEach((subitem: string) => {
          const validate = field.validates[subitem as unknown as Enums.EnumValidation];
          if (validate) {
            const [_, refValue]: any = !!validate.ref ? getElement(validate.ref ?? "") : [null, null];
            switch (subitem) {
              case Enums.EnumValidation.Required:
                field.error = hasNotValue(String(elmValue));
                break;
              case Enums.EnumValidation.IsEquals:
                field.error = isNotEquals(String(elmValue), String(refValue));
                break;
              case Enums.EnumValidation.IsGraterThan:
                field.error = isNotGraterThan(Number(elmValue), Number(refValue));
                break;
              case Enums.EnumValidation.IsLessThan:
                field.error = isNotLessThan(Number(elmValue), Number(refValue));
                break;
              case Enums.EnumValidation.MinLength:
                field.error = hasNotMinLength(elmValue, Number(validate?.length))
                break;
              case Enums.EnumValidation.Regex:
                field.error = hasNotMatch(elmValue, validate?.regex)
                break;
            }
            if (field.error) {
              isValid = false;
              field.errorText = validate.message ?? "";
              return false;
            }
          }
        });
      }
      newFields[name] = field;
    });

    setValid(isValid)
    return { isValid, response: newFields };
  }

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValues = { ...values, [event.target.name]: event.target.value };
    setValues(newValues);
    updateCallback && updateCallback(event.target.name, event.target.value, newValues, validate(newValues));
  };

  const onBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    const newValues = { ...values, [event.target.name]: event.target.value };
    setValues(newValues);
    updateCallback && updateCallback(event.target.name, event.target.value, newValues, validate(newValues));
  };

  const onDropdownChange = (event: SelectChangeEvent<number>) => {
    const newValues = { ...values, [event.target.name]: event.target.value };
    setValues(newValues);
    updateCallback && updateCallback(event.target.name, event.target.value, newValues, validate(newValues));
  };

  const onInput = (name: string, value: string) => {
    const newValues = { ...values, [name]: value };
    setValues(newValues);
    updateCallback && updateCallback(name, value, newValues, validate(newValues));
  };

  const onCustomChange = (name: string, value: any) => {
    const newValues = { ...values, [name]: value };
    setValues(newValues);
    updateCallback && updateCallback(name, value, newValues, validate(newValues));
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (shallReset) {
      (event.target as any).reset();
    }
    submitCallback && await submitCallback(event, validate(values));
  };

  const onReset = () => setValues(initialState);

  return {
    onBlur,
    onInput,
    onReset,
    onChange,
    onDropdownChange,
    onCustomChange,
    onSubmit,
    onValidate,
    values,
    isValid,
  };
};
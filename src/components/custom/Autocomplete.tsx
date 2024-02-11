import React, { useState } from "react";
import { Custom } from "components";
import { useApp, useTheme } from "contexts";
import {
  AutocompleteRenderGetTagProps,
  AutocompleteRenderInputParams,
  Autocomplete as MUIAutocomplete,
  SxProps,
} from "@mui/material";
import { Constants } from "utils";
import { Validations } from "helpers";

export type Props = {
  sx?: SxProps;
  name?: string;
  label?: string;
  limitTags?: number;
  multiple?: boolean;
  placeholder?: string;
  helperText?: string;
  items?: string[];
  value?: string[];
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

export const Autocomplete = ({ multiple = true, ...props }: Props) => {
  const { t } = useApp();
  const { theme } = useTheme();
  const [inputValue, setInputValue] = React.useState("");
  const [currentValue, setCurrentValue] = useState<string[] | undefined>(
    props.value
  );

  function handleAddChip(value: string) {
    const newValue = [...(currentValue ?? []), value];
    setCurrentValue(newValue);
    handleChange(newValue);
    setInputValue("");
  }

  function handleInputChange(
    event: React.SyntheticEvent<Element, Event>,
    newInputValue: string
  ) {
    setInputValue(newInputValue);
  }

  function handleDeleteChip(value: string) {
    const newValue =
      currentValue?.filter((item: string) => item !== value) ?? [];
    setCurrentValue(newValue);
    handleChange(newValue);
  }

  function handleChange(value: string[]) {
    props.onChange &&
      props.onChange({
        target: {
          name: props.name,
          value: value,
        },
      } as any);
  }

  return (
    <>
      {multiple && (
        <MUIAutocomplete
          multiple
          disableCloseOnSelect
          onChange={(
            event: React.SyntheticEvent<Element, Event>,
            value: readonly string[]
          ) =>
            props.onChange &&
            props.onChange({
              target: {
                name: props.name,
                value: value,
              },
            } as any)
          }
          noOptionsText={""}
          options={props.items || []}
          getOptionLabel={(option: string) => option}
          defaultValue={currentValue}
          renderTags={(
            value: string[],
            getTagProps: AutocompleteRenderGetTagProps
          ) =>
            value.map((option: string, index: number) => (
              <Custom.Chip
                label={option}
                sx={{
                  backgroundColor: theme.palette.background.color,
                }}
                {...getTagProps({ index })}
              />
            ))
          }
          renderOption={(
            props: React.HTMLAttributes<HTMLLIElement>,
            option: string,
            { selected }
          ) => (
            <li {...props}>
              <Custom.Checkbox style={{ marginRight: 8 }} checked={selected} />
              {option}
            </li>
          )}
          renderInput={(params: AutocompleteRenderInputParams) => (
            <Custom.TextField
              {...params}
              name={props.name}
              label={props.label}
              helperText={props.helperText}
              placeholder={props.placeholder}
            />
          )}
        />
      )}
      {!multiple && (
        <MUIAutocomplete
          multiple
          freeSolo
          autoSelect
          options={[]}
          value={currentValue}
          inputValue={inputValue}
          onInputChange={handleInputChange}
          onChange={(
            event: React.SyntheticEvent<Element, Event>,
            value: readonly string[]
          ) => {
            props.onChange &&
              props.onChange({
                target: {
                  name: props.name,
                  value: value,
                },
              } as any);
          }}
          renderTags={(
            value: string[],
            getTagProps: AutocompleteRenderGetTagProps
          ) =>
            value.map((option: string, index: number) => (
              <Custom.Chip
                label={option}
                sx={{
                  backgroundColor: theme.palette.background.color,
                }}
                {...getTagProps({ index })}
                onDelete={() => handleDeleteChip(option)}
              />
            ))
          }
          onKeyDown={(event: React.KeyboardEvent<HTMLDivElement>) => {
            const hasPressed =
              event.key === Constants.KEY_CODE.ENTER ||
              event.key === Constants.KEY_CODE.TAB;
            if (hasPressed && Validations.hasValue(inputValue)) {
              event.preventDefault();
              handleAddChip(inputValue.trim());
            }
          }}
          renderInput={(params: AutocompleteRenderInputParams) => (
            <Custom.TextField
              {...params}
              name={props.name}
              label={props.label}
              helperText={props.helperText}
              placeholder={props.placeholder}
            />
          )}
        />
      )}
    </>
  );
};

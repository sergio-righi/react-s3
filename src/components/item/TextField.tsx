import React, { useEffect, useState } from "react";
import {
  IconButton,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { Custom } from "components";
import { useApp } from "contexts";

// icons
import {
  ContentCopyRounded,
  EditRounded,
  EditOffRounded,
} from "@mui/icons-material";

type Props = {
  name?: string;
  mask?: string;
  value?: string;
  copyable?: boolean;
  editable?: boolean;
  placeholder?: string;
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
  onChange?: (event: React.FocusEvent<HTMLInputElement>) => void;
};

export const TextField = ({
  value = "",
  copyable = false,
  editable = false,
  ...props
}: Props) => {
  const [isEditable, setIsEditable] = useState<boolean>(false);
  const [currentValue, setCurrentValue] = useState<string>(value);

  useEffect(() => {
    if (isEditable) return;
    props.onChange &&
      props.onChange({
        target: { name: props.name, value: currentValue },
      } as any);
  }, [isEditable]);

  useEffect(() => {
    setCurrentValue(value);
  }, [value]);

  function handleCopyClipboardClick() {
    navigator.clipboard.writeText(currentValue);
  }

  function handleChange(event: React.FocusEvent<HTMLInputElement>) {
    setCurrentValue(String(event.target.value));
  }

  return (
    <ListItem
      secondaryAction={
        <>
          {isEditable && (
            <IconButton onClick={() => setIsEditable(!isEditable)}>
              {isEditable ? <EditOffRounded /> : <EditRounded />}
            </IconButton>
          )}
          {copyable && !isEditable && (
            <IconButton onClick={handleCopyClipboardClick}>
              <ContentCopyRounded />
            </IconButton>
          )}
        </>
      }
    >
      {props.leading && <ListItemIcon>{props.leading}</ListItemIcon>}
      {isEditable && (
        <ListItemText>
          <Custom.TextField
            mask={props.mask}
            sx={{
              width: 1,
              margin: 0,
              padding: 0,
              "& .MuiInputBase-input": {
                padding: 0,
              },
              "& .MuiOutlinedInput-notchedOutline": {
                border: "0 !important",
              },
            }}
            required
            value={currentValue}
            onChange={handleChange}
          />
        </ListItemText>
      )}
      {!isEditable && (
        <ListItemText primary={currentValue ?? props.placeholder} />
      )}
    </ListItem>
  );
};

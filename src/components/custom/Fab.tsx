import React, { forwardRef, useEffect, useState } from "react";
import { Fab as MUIFab, FabProps } from "@mui/material";
import { useApp, useTheme } from "contexts";
import { Validations } from "helpers";

// icons
import {
  AddRounded,
  EditRounded,
  DeleteRounded,
  FilterAltRounded,
  CloseRounded,
} from "@mui/icons-material";

type Props = FabProps & {
  top?: boolean;
  bottom?: boolean;
  right?: boolean;
  left?: boolean;
  closable?: boolean;
  state?: boolean;
  onStateChange?: (state: boolean) => void;
  icon?: "add" | "edit" | "delete" | "filter" | "close";
};

export const Fab = forwardRef(
  (
    {
      closable = false,
      state = false,
      top = false,
      bottom = false,
      right = false,
      left = false,
      onStateChange,
      icon,
      ...props
    }: Props,
    ref: React.Ref<HTMLButtonElement>
  ) => {
    const { t } = useApp();
    const { theme } = useTheme();

    const [currentState, setCurrentState] = useState<boolean>(state);

    const text =
      icon === "add"
        ? t.action.add
        : icon === "edit"
        ? t.action.edit
        : icon === "delete"
        ? t.action.delete
        : icon === "filter"
        ? t.action.filter
        : "";

    const mr = Validations.hasValue(text) ? theme.spacing.xs : 0;

    useEffect(() => {
      setCurrentState(state);
    }, [state]);

    function handleClick(event: React.MouseEvent<HTMLButtonElement>) {
      setCurrentState((currentState: boolean) => {
        const newState = !currentState;
        onStateChange && onStateChange(newState);
        return newState;
      });
    }

    return (
      <MUIFab
        ref={ref}
        variant="extended"
        sx={{
          position: "fixed",
          boxShadow: theme.palette.shadow,
          borderRadius: theme.border.radius,
          top: top ? theme.spacing.default : undefined,
          left: left ? theme.spacing.default : undefined,
          right: right ? theme.spacing.default : undefined,
          bottom: bottom ? theme.spacing.default : undefined,
        }}
        onClick={handleClick}
      >
        {closable && currentState ? (
          <CloseRounded sx={{ mr }} />
        ) : icon === "add" ? (
          <AddRounded sx={{ mr }} />
        ) : icon === "edit" ? (
          <EditRounded sx={{ mr }} />
        ) : icon === "delete" ? (
          <DeleteRounded sx={{ mr }} />
        ) : (
          <FilterAltRounded sx={{ mr }} />
        )}{" "}
        {text}
      </MUIFab>
    );
  }
);

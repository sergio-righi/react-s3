import { ChangeEvent } from "react";
import { useTheme } from "contexts";
import { Switch as MUISwitch } from "@mui/material";

type Props = {
  checked: boolean;
  onChange?: (event: ChangeEvent<HTMLInputElement>, checked: boolean) => void;
};

export const Switch = (props: Props) => {
  const { theme } = useTheme();
  return (
    <MUISwitch
      // sx={{
      //   "& .Mui-checked": {
      //     color: theme.color.accent.color,
      //     "& .MuiSwitch-thumb": {
      //       backgroundColor: theme.color.accent.color,
      //     },
      //     "& .MuiSwitch-track": {
      //       backgroundColor: theme.color.accent.color,
      //     },
      //   },
      //   "& .Mui-checked + .MuiSwitch-track": {
      //     backgroundColor: theme.color.accent.color + "!important",
      //   },
      // }}
      edge="end"
      checked={props.checked}
      onChange={props.onChange}
    />
  );
};

Switch.defaultProps = {
  checked: false,
};

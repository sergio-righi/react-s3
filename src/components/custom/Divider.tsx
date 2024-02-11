import { Divider as MUIDivider, DividerProps } from "@mui/material";
import { useTheme } from "contexts";

type Props = DividerProps & {};

export const Divider = (props: Props) => {
  const { theme } = useTheme();

  return (
    <MUIDivider sx={{ width: 1, backgroundColor: theme.palette.border }} />
  );
};

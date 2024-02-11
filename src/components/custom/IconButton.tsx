import {
  Box,
  IconButton as MUIIconButton,
  IconButtonProps,
  Stack,
} from "@mui/material";
import { useTheme } from "contexts";
import { Custom } from "components";

type Props = IconButtonProps & {
  label?: string;
  outlined?: boolean;
  iconColor?: string;
  onClick?: () => void;
  children: React.ReactNode;
};

export const IconButton = ({
  label,
  outlined = false,
  iconColor,
  ...props
}: Props) => {
  const { theme } = useTheme();

  const textColor = iconColor ?? theme.palette.font.accent;
  const stylesheet = outlined
    ? {
        display: "inline-block",
        borderRadius: theme.border.circle,
        border: `1px solid ${textColor}`,
      }
    : {};

  return label ? (
    <Box
      onClick={props.onClick}
      sx={{ cursor: !!props.onClick ? "pointer" : "initial" }}
    >
      <Stack
        alignItems="center"
        justifyContent="start"
        spacing={theme.spacing.sm}
      >
        <Box {...stylesheet}>
          <MUIIconButton {...props} sx={{ color: textColor }}>
            {props.children}
          </MUIIconButton>
        </Box>
        {label && (
          <Box display="inline-flex" maxWidth={48}>
            <Custom.Typography align="center" variant="h6" color={textColor}>
              {label}
            </Custom.Typography>
          </Box>
        )}
      </Stack>
    </Box>
  ) : (
    <MUIIconButton {...props}>{props.children}</MUIIconButton>
  );
};

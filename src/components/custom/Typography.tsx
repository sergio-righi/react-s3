import { useTheme } from "contexts";
import { Typography as MUITyphography, TypographyProps } from "@mui/material";

type Props = TypographyProps & {
  component?: React.ElementType;
  href?: any;
  size?: number;
  align?: "center" | "right" | "left" | "justify";
  as?: "header" | "subheader" | "small" | "medium" | "large" | "span" | "p";
  weight?:
    | "thin"
    | "extraLight"
    | "light"
    | "normal"
    | "medium"
    | "semiBold"
    | "bold"
    | "extraBold"
    | "black";
};

export const Typography = ({ align = "left", ...props }: Props) => {
  const { theme } = useTheme();

  const h1 = { fontSize: theme.font.xxl, fontWeight: theme.font.bold };
  const h2 = { fontSize: theme.font.xl, fontWeight: theme.font.bold };
  const h3 = { fontSize: theme.font.lg, fontWeight: theme.font.bold };
  const h4 = { fontSize: theme.font.md, fontWeight: theme.font.bold };
  const h5 = { fontSize: theme.font.sm, fontWeight: theme.font.normal };
  const h6 = { fontSize: theme.font.xs, fontWeight: theme.font.normal };

  const p = { fontSize: theme.font.sm, fontWeight: theme.font.normal };
  const span = { fontSize: theme.font.xs, fontWeight: theme.font.normal };
  const small = { fontSize: theme.font.xxs, fontWeight: theme.font.normal };

  const stylesheet =
    props.variant === "h1" || props.as === "large"
      ? h1
      : props.variant === "h2" || props.as === "medium"
      ? h2
      : props.variant === "h3" || props.as === "header"
      ? h3
      : props.variant === "h4"
      ? h4
      : props.variant === "h5"
      ? h5
      : props.variant === "h6" || props.as === "subheader"
      ? h6
      : props.as === "small"
      ? small
      : props.as === "span"
      ? span
      : props.as === "p"
      ? p
      : undefined;

  return (
    <MUITyphography
      {...props}
      href={props.href}
      textAlign={align}
      component={props.component ?? "span"}
      fontSize={props.size ?? stylesheet?.fontSize}
      color={props.color ?? theme.palette.font.color}
      fontWeight={props.weight ?? stylesheet?.fontWeight}
    >
      {props.children}
    </MUITyphography>
  );
};

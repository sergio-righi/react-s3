/* eslint-disable quotes */
import {
  Color,
  ColorSchema,
  ColorStatus,
} from "themes/interfaces";

export default {
  primary: { color: "#9A9A9A", text: "#ffffff" } as ColorSchema,
  accent: { color: "#2C2C2C", text: "#ffffff" } as ColorSchema,
  secondary: { color: "#999999", text: "#ffffff" } as ColorSchema,
  status: {
    warning: { color: "#FEDB60", text: "#404040" } as ColorSchema,
    success: { color: "#57A75B", text: "#ffffff" } as ColorSchema,
    error: { color: "#E15858", text: "#ffffff" } as ColorSchema,
  } as ColorStatus,
  disabled: { color: "#b3b3b3", accent: "#959595" } as ColorSchema,
  overlay: "rgba(0, 0, 0, 0.5)",
  black: "#000000",
  white: "#ffffff"
} as Color;

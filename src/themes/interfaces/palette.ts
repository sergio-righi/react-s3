import { ColorFont, ColorSchema } from "themes/interfaces";

export interface Palette {
  theme: string;
  border: string;
  shadow: string;
  font: ColorFont;
  input: ColorSchema;
  background: ColorSchema;
}

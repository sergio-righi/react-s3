import type { Border, Color, Component, Font, Spacing, Palette } from 'themes/interfaces';

export interface Theme {
  id: number;
  font: Font;
  color: Color;
  border: Border;
  palette: Palette;
  spacing: Spacing;
  component: Component;
}

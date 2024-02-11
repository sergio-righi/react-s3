import { Slider as MUISlider, SliderProps } from "@mui/material";

type Props = SliderProps & {};

export const Slider = (props: Props) => {
  function marks(): { label: string; value: number }[] {
    const { min = 0, max, step } = props;
    if (!max || !step) return [];

    const maxMarks = 10;
    const range = max - min;
    const interval = Math.ceil(range / maxMarks); // Calculate the interval between marks

    const marks: { label: string; value: number }[] = [];

    for (let i = min + step; i <= max; i += interval) {
      marks.push({ label: i > 1000 ? `${i / 1000}k` : i.toString(), value: i });
    }

    return marks;
  }

  return <MUISlider {...props} marks={marks()} valueLabelDisplay="auto" />;
};

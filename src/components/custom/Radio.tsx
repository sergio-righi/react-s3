import { Radio as MUIRadio, RadioProps } from "@mui/material";

type Props = RadioProps & {};

export const Radio = (props: Props) => {
  return <MUIRadio {...props} edge="start" disableRipple name={props.name} />;
};

Radio.defaultProps = {};

import "assets/scss/components/embedded.scss";

import { Box } from "@mui/material";
import { forwardRef } from "react";
import { useTheme } from "contexts";

type Props = {
  src: string;
  title: string;
  hidden?: boolean;
  sharpBorder?: boolean;
};

export const Embedded = forwardRef(
  (
    { hidden = false, sharpBorder = false, ...props }: Props,
    ref: React.Ref<HTMLIFrameElement>
  ) => {
    const { theme } = useTheme();

    return (
      <Box
        display={hidden ? "none" : undefined}
        className="al-embed-responsive square"
        borderRadius={sharpBorder ? undefined : theme.border.radius}
      >
        <iframe
          ref={ref}
          src={props.src}
          title={props.title}
          allowFullScreen={true}
          allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
        />
      </Box>
    );
  }
);

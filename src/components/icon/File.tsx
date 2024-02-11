import React from "react";

// icons
import {
  AudioFileRounded,
  ImageRounded,
  PictureAsPdfRounded,
  TextSnippetRounded,
  VideoFileRounded,
} from "@mui/icons-material";

type Props = {
  name: string;
};

export const File = (props: Props) => {
  return <TextSnippetRounded />;
};

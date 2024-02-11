import { useState, useRef } from "react";
import { useTheme } from "contexts";
import { Box, IconButton, Stack } from "@mui/material";
import { Custom } from "components";

// icons
import { CheckRounded, ClearRounded } from "@mui/icons-material";

export interface InlineSegment {
  name: string;
  value: string;
  mask?: string;
}

interface Props {
  text: string;
  segments: InlineSegment[];
  onSave: (segments: InlineSegment[]) => void;
}

export const InlineEdit = (props: Props) => {
  const { theme } = useTheme();
  const inputRef = useRef<HTMLInputElement>(null);
  const [editedText, setEditedText] = useState("");
  const [editingSegment, setEditingSegment] = useState<string | null>(null);

  function handleEditClick(segmentName: string, segmentValue: string) {
    setEditingSegment(segmentName);
    setEditedText(segmentValue);
  }

  function handleSaveClick() {
    if (editingSegment !== null) {
      const updatedSegments = props.segments.map((item: InlineSegment) =>
        item.name === editingSegment ? { ...item, value: editedText } : item
      );
      props.onSave(updatedSegments);
      setEditingSegment(null);
      setEditedText("");
    }
  }

  function handleCancelClick() {
    setEditingSegment(null);
    setEditedText("");
  }

  const stylesheet = {
    fontWeight: theme.font.bold,
    color: theme.color.accent.color,
  };

  const replacedText = props.text
    .split(/({{[a-zA-Z]+}})/g)
    .map((part: string, index: number) => {
      const match = part.match(/{{([a-zA-Z]+)}}/);
      if (match) {
        const segment = props.segments.find(
          (item: InlineSegment) => item.name === match[1]
        );
        if (segment) {
          return (
            <Box component="span" key={index}>
              {editingSegment === segment.name ? (
                <Stack
                  direction="row"
                  display="inline-flex"
                  alignItems="center"
                >
                  <Custom.TextField
                    value={editedText}
                    inputRef={inputRef}
                    mask={segment.mask}
                    sx={{
                      "& .MuiInputBase-input": {
                        padding: 0,
                        ...stylesheet,
                      },
                      "& .MuiOutlinedInput-notchedOutline": {
                        border: 0,
                      },
                      "& .Mui-focused .MuiOutlinedInput-notchedOutline": {
                        border: 0 + "!important",
                      },
                    }}
                    onChange={(e) => setEditedText(e.target.value)}
                  />
                  <IconButton onClick={handleSaveClick}>
                    <CheckRounded />
                  </IconButton>
                  <IconButton onClick={handleCancelClick} size="small">
                    <ClearRounded />
                  </IconButton>
                </Stack>
              ) : (
                <Custom.Typography
                  sx={{ ...stylesheet, cursor: "pointer" }}
                  onClick={() => handleEditClick(segment.name, segment.value)}
                >
                  {segment.value}
                </Custom.Typography>
              )}
            </Box>
          );
        }
      }
      return part;
    });

  return <div>{replacedText}</div>;
};

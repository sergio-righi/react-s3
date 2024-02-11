import React, { useRef, useState } from "react";
import { Box, Stack } from "@mui/material";
import { Custom } from "components";
import { useApp, useTheme } from "contexts";
import { Combines, Validations } from "helpers";

// icons
import { AttachFileRounded } from "@mui/icons-material";

interface Props {
  name: string;
  label: string;
  accept?: string;
  multiple?: boolean;
  helperText?: string;
  placeholder?: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const File = ({ multiple = false, ...props }: Props) => {
  const { theme } = useTheme();

  const inputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);

  function handleFileInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    const files = event.target.files;
    if (files && files.length > 0) {
      setSelectedFiles(files);
      props.onChange({
        target: {
          name: props.name,
          value: multiple ? files : files[0],
        },
      } as any);
    }
  }

  function handleChooseFileClick() {
    if (inputRef.current) {
      inputRef.current.click();
    }
  }

  return (
    <Box width={1}>
      <input
        type="file"
        ref={inputRef}
        name={props.name}
        accept={props.accept}
        multiple={multiple}
        style={{ display: "none" }}
        onChange={handleFileInputChange}
      />
      <Box
        height={theme.component.input.height}
        onClick={handleChooseFileClick}
        sx={{
          borderWidth: 1,
          borderRadius: 1,
          cursor: "pointer",
          px: theme.spacing.sm,
          borderStyle: "solid",
          borderColor: theme.palette.input.accent,
          "&:hover": {
            borderColor: theme.color.accent.color,
          },
        }}
      >
        <Stack
          height={1}
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <Custom.Typography variant="h5" className="o-ellipsis">
            {selectedFiles
              ? multiple
                ? Combines.interpolate(props.placeholder ?? "{{count}}", {
                    count: selectedFiles.length,
                  })
                : selectedFiles[0].name
              : props.label}
          </Custom.Typography>
          <AttachFileRounded color="inherit" />
        </Stack>
      </Box>
      {Validations.hasValue(props.helperText) && (
        <Box
          mx={theme.component.input.helperText.mx}
          mt={theme.component.input.helperText.mt}
        >
          <Custom.Typography
            variant="h6"
            color={theme.palette.font.accent}
            letterSpacing={theme.component.input.helperText.letterSpacing}
          >
            {props.helperText}
          </Custom.Typography>
        </Box>
      )}
    </Box>
  );
};

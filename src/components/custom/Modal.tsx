import React, { useEffect } from "react";
import { Box, Modal as MUIModal, SxProps, Stack } from "@mui/material";
import { useTheme } from "contexts";
import { Custom } from "components";

// icons
import { CloseRounded } from "@mui/icons-material";

type Props = {
  sx?: SxProps;
  title: string;
  open: boolean;
  message?: string;
  children: React.ReactNode;
  onClose?: () => void;
  onOpen?: () => void;
};

export const Modal = ({
  open = false,
  title,
  message,
  children,
  onOpen,
  onClose,
  ...props
}: Props) => {
  const { theme } = useTheme();

  useEffect(() => {
    if (open) onOpen && onOpen();
  }, [open]);

  function handleClose(): void {
    onClose && onClose();
  }

  return (
    <MUIModal
      open={open}
      onClose={handleClose}
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Custom.Paper
        sx={{
          width: "80%",
          maxHeight: "80%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          px={theme.spacing.xl}
          py={theme.spacing.md}
          justifyContent="space-between"
        >
          <Custom.Typography variant="h4">{title}</Custom.Typography>
          <Custom.IconButton onClick={onClose}>
            <CloseRounded />
          </Custom.IconButton>
        </Stack>
        <Custom.Divider />
        <Box p={theme.spacing.xl} sx={{ overflowY: "auto" }}>
          {children}
        </Box>
      </Custom.Paper>
    </MUIModal>
  );
};

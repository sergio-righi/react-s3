import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import { Custom } from "components";

type Props = {
  open?: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel?: () => void;
};

export const Confirmation = ({
  open = false,
  title,
  message,
  ...props
}: Props) => {
  function handleConfirm() {
    props.onConfirm();
  }

  function handleCancel() {
    props.onCancel && props.onCancel();
  }

  return (
    <Dialog open={open} onClose={handleCancel} maxWidth="xs" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{message}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Custom.Button onClick={handleCancel} secondary>
          No
        </Custom.Button>
        <Custom.Button onClick={handleConfirm}>Yes</Custom.Button>
      </DialogActions>
    </Dialog>
  );
};

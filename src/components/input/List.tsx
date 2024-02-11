import { useEffect, useState } from "react";
import {
  Box,
  TextFieldProps,
  List as MUIList,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  ListSubheader,
  IconButton,
  InputAdornment,
  Stack,
} from "@mui/material";
import { useTheme } from "contexts";
import { Custom, Progress } from "components";
import { Constants } from "utils";
import { Validations } from "helpers";

// icons
import {
  AddRounded,
  CloseRounded,
  EditRounded,
  DeleteRounded,
} from "@mui/icons-material";

type Props = TextFieldProps & {
  label: string;
  title: string;
  value: string[];
};

export const List = (props: Props) => {
  const { theme } = useTheme();

  const [currentIndex, setCurrentIndex] = useState<number>(-1);
  const [currentValue, setCurrentValue] = useState<string>("");
  const [items, setItems] = useState<string[]>(props.value);

  useEffect(() => {
    // setCurrentValue(props.value);
  }, [props.value]);

  function handleInputChange(newValue: string) {
    setCurrentValue(newValue);
  }

  function handleAddItem() {
    if (Validations.hasValue(currentValue)) {
      const updatedItems = [...items];
      if (currentIndex !== -1) {
        updatedItems[currentIndex] = currentValue;
        setCurrentIndex(-1);
      } else {
        updatedItems.push(currentValue);
      }
      setItems(updatedItems);
      setCurrentValue("");
      props.onChange &&
        props.onChange({
          target: { name: props.name, value: updatedItems },
        } as any);
    }
  }

  function handleDeleteItem(index: number) {
    const updatedItems = items.filter((_, i: number) => i !== index);
    setItems(updatedItems);
    props.onChange &&
      props.onChange({
        target: { name: props.name, value: updatedItems },
      } as any);
  }

  function handleEditItem(index: number) {
    setCurrentValue(items[index]);
    setCurrentIndex(index);
  }

  function handleCancel() {
    setCurrentIndex(-1);
  }

  return (
    <Box width={1}>
      <Custom.TextField
        label={props.label}
        value={currentValue}
        onChange={(event) => handleInputChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === Constants.KEY_CODE.ENTER) {
            event.preventDefault();
            handleAddItem();
          }
        }}
        helperText={props.helperText}
        placeholder={props.placeholder}
        fullWidth
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              {currentIndex === -1 && (
                <IconButton aria-label="Add" onClick={handleAddItem}>
                  <AddRounded />
                </IconButton>
              )}
              {currentIndex !== -1 && (
                <IconButton aria-label="Reset" onClick={handleCancel}>
                  <CloseRounded />
                </IconButton>
              )}
            </InputAdornment>
          ),
        }}
      />
      {items.length > 0 ? (
        <MUIList
          sx={{
            overflow: "hidden",
            mt: theme.spacing.md,
            position: "relative",
            borderBottomLeftRadius: theme.border.radius,
            borderBottomRightRadius: theme.border.radius,
          }}
          subheader={
            <ListSubheader
              component="div"
              sx={{
                bgcolor: theme.palette.background.accent,
                borderTopLeftRadius: theme.border.radius,
                borderTopRightRadius: theme.border.radius,
              }}
            >
              {props.title}
            </ListSubheader>
          }
        >
          {items.map((item: string, i: number) => (
            <ListItem
              key={i}
              divider
              sx={{
                bgcolor: theme.palette.background.accent,
              }}
            >
              <ListItemText primary={item} />
              <ListItemSecondaryAction>
                <Stack direction="row" spacing={theme.spacing.sm}>
                  <IconButton
                    edge="end"
                    aria-label="Edit"
                    onClick={() => handleEditItem(i)}
                  >
                    <EditRounded />
                  </IconButton>
                  <IconButton
                    edge="end"
                    aria-label="Delete"
                    onClick={() => handleDeleteItem(i)}
                  >
                    <DeleteRounded />
                  </IconButton>
                </Stack>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </MUIList>
      ) : (
        <Box
          height={60}
          borderRadius={1}
          position="relative"
          mt={theme.spacing.md}
          bgcolor={theme.palette.background.color}
        >
          <Progress.NoRecord />
        </Box>
      )}
    </Box>
  );
};

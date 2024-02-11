import React, { useEffect, useState } from "react";
import { useTheme } from "contexts";
import {
  AccordionDetails,
  AccordionSummary,
  Accordion as MUIAccordion,
} from "@mui/material";

// icons
import { ExpandMoreRounded } from "@mui/icons-material";

type Props = {
  expanded?: boolean;
  children: React.ReactNode;
  header?: React.ReactNode | string;
  onChange?: (
    event: React.SyntheticEvent<Element, Event>,
    expanded: boolean
  ) => void;
};

export const Accordion = (props: Props) => {
  const { theme } = useTheme();
  const [expanded, setExpanded] = useState<boolean>(props.expanded ?? false);

  useEffect(() => setExpanded(props.expanded ?? false), [props.expanded]);

  function handleChange(
    event: React.SyntheticEvent<Element, Event>,
    expanded: boolean
  ) {
    setExpanded(expanded);
    props.onChange && props.onChange(event, expanded);
  }

  return (
    <MUIAccordion
      elevation={0}
      expanded={expanded}
      onChange={handleChange}
      sx={{
        backgroundColor: theme.palette.theme,
        borderWidth: expanded ? 2 : 1,
        borderStyle: "solid",
        borderColor: expanded
          ? theme.color.accent.color
          : theme.palette.input.accent,
        "&:hover": {
          borderColor: expanded
            ? theme.color.accent.color
            : theme.palette.font.color,
        },
      }}
    >
      <AccordionSummary
        expandIcon={
          <ExpandMoreRounded sx={{ color: theme.palette.font.color }} />
        }
      >
        {props.header}
      </AccordionSummary>
      <AccordionDetails>{props.children}</AccordionDetails>
    </MUIAccordion>
  );
};

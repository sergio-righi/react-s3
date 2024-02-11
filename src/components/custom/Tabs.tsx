import React from "react";
import { Box, Tabs as MUITabs, Tab as MUITab } from "@mui/material";
import { Custom } from "components";

type TabContentProps = {
  index: number;
  value: number;
  children?: React.ReactNode;
};

const TabContent = ({ children, value, index, ...props }: TabContentProps) => {
  return (
    <Box
      width={1}
      position="relative"
      hidden={value !== index}
      id={`tab-content-${index}`}
    >
      {value === index && children}
    </Box>
  );
};

export type TabProps = {
  key: string;
  label: string;
  children: React.ReactNode;
};

type Props = {
  items: TabProps[];
  selectedIndex?: number;
};

export const Tabs = ({ selectedIndex = 0, ...props }: Props) => {
  const [currentIndex, setCurrentIndex] = React.useState(selectedIndex);

  function handleChange(_: React.SyntheticEvent, index: number) {
    setCurrentIndex(index);
  }

  return (
    <Box width={1} height={1} position="relative">
      <MUITabs value={currentIndex} variant="fullWidth" onChange={handleChange}>
        {props.items.map((item: TabProps, i: number) => (
          <MUITab key={item.key} value={i} label={item.label} />
        ))}
      </MUITabs>
      <Custom.Divider />
      {props.items.map((item: TabProps, i: number) => (
        <TabContent key={i} value={currentIndex} index={i}>
          {item.children}
        </TabContent>
      ))}
    </Box>
  );
};

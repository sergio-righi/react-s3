import React, { useState, useEffect, useRef } from "react";
import { IconButton, Stack } from "@mui/material";
import { useTheme } from "contexts";

// icons
import { ArrowBackRounded, ArrowForwardRounded } from "@mui/icons-material";

type Props = {
  step?: number;
  centeredId?: string;
  children: React.ReactNode[];
};

export const HorizontalScroll = (props: Props) => {
  const { theme } = useTheme();
  const cardContainerRef = useRef<any>(null);
  const [scrollPosition, setScrollPosition] = useState<number>(0);

  const step = props.step ?? 300;

  useEffect(() => {
    if (props.centeredId && cardContainerRef.current) {
      const centeredCardElement = cardContainerRef.current.querySelector(
        `#${props.centeredId}`
      );
      if (centeredCardElement) {
        const containerWidth = cardContainerRef.current.clientWidth;
        const cardPosition = centeredCardElement.getBoundingClientRect().left;
        handleScroll(containerWidth / 2 - cardPosition + scrollPosition);
      }
    }
  }, [props.centeredId]);

  useEffect(() => {
    if (cardContainerRef.current) {
      cardContainerRef.current.scrollTo({
        left: scrollPosition,
        behavior: "smooth",
      });
    }
  }, [scrollPosition]);

  function handleScroll(newPosition: number) {
    if (cardContainerRef.current) {
      const { offsetWidth, scrollWidth } = cardContainerRef.current;
      setScrollPosition(
        newPosition < 0
          ? 0
          : newPosition > scrollWidth - offsetWidth
          ? scrollWidth - offsetWidth
          : newPosition
      );
    }
  }

  const handleDragStart = (e: any) => {
    e.preventDefault();
    if (cardContainerRef.current) {
      cardContainerRef.current.style.scrollBehavior = "auto";
      const startX = e.clientX || e.touches[0].clientX;
      const scrollStart = cardContainerRef.current.scrollLeft;

      const handleDragMove = (event: any) => {
        const currentX = event.clientX || event.touches[0].clientX;
        const deltaX = startX - currentX;
        handleScroll(scrollStart + deltaX);
      };

      const handleDragEnd = () => {
        cardContainerRef.current.style.scrollBehavior = "smooth";
        document.removeEventListener("mousemove", handleDragMove);
        document.removeEventListener("mouseup", handleDragEnd);
        document.removeEventListener("touchmove", handleDragMove);
        document.removeEventListener("touchend", handleDragEnd);
      };

      document.addEventListener("mousemove", handleDragMove);
      document.addEventListener("mouseup", handleDragEnd);
      document.addEventListener("touchmove", handleDragMove);
      document.addEventListener("touchend", handleDragEnd);
    }
  };

  return (
    <Stack width={1} direction="row" spacing={theme.spacing.md}>
      {/* <IconButton
        sx={{ color: palette.font.color }}
        onClick={() => handleScroll(scrollPosition - step)}
      >
        <ArrowBackRounded />
      </IconButton> */}
      <Stack
        direction="row"
        ref={cardContainerRef}
        alignItems="flex-start"
        spacing={theme.spacing.md}
        onMouseDown={handleDragStart}
        onTouchStart={handleDragStart}
        onScroll={(e: any) => handleScroll(e.target.scrollLeft)}
        sx={{
          overflowX: "auto",
          scrollBehavior: "smooth",
          msOverflowStyle: "none",
          scrollbarWidth: "none",
          "&::-webkit-scrollbar": {
            display: "none",
          },
        }}
      >
        {props.children}
      </Stack>
      {/* <IconButton
        sx={{ color: palette.font.color }}
        onClick={() => handleScroll(scrollPosition + step)}
      >
        <ArrowForwardRounded />
      </IconButton> */}
    </Stack>
  );
};

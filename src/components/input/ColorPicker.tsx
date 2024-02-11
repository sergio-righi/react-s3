import "assets/scss/components/color_picker.scss";

import React, { useEffect, useState, useRef } from "react";
import { Box, Stack } from "@mui/material";
import { Auxiliars, Conversions } from "helpers";
import { useTheme } from "contexts";

type Props = {
  color: string;
  onChange: (color: string) => void;
};

type ColorGradientProps = {
  hue: number;
  saturation: number;
  lightness: number;
  onChange: (color: string) => void;
};

type SliderProps = {
  min: number;
  max: number;
  value: number;
  onChange: (value: HSLColor) => void;
};

type HSLColor = {
  h: number;
  s: number;
  l: number;
};

const ColorSlider = (props: SliderProps) => {
  const { theme } = useTheme();

  const handleSliderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(event.target.value, 10);
    props.onChange({ h: newValue, s: 100, l: 50 });
  };

  const currentColor = `hsl(${props.value}, 100%, 50%)`;

  return (
    <Box className="al-slider">
      <input
        type="range"
        min={props.min}
        max={props.max}
        value={props.value}
        onChange={handleSliderChange}
        style={{ color: currentColor }}
      />
      <Box
        height={10}
        className="background"
        borderRadius={theme.border.radius}
      />
    </Box>
  );
};

const ColorGradient = (props: ColorGradientProps) => {
  const { theme } = useTheme();
  const pickerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const baseColor = Conversions.toHexAsHsl(
    props.hue,
    props.saturation,
    props.lightness
  );

  const [position, setPosition] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const [selectedColor, setSelectedColor] = useState<string>(baseColor);

  useEffect(() => {
    const { canvas, context } = getCanvas();
    if (canvas && context) {
      if (pickerRef.current) {
        const { clientWidth = 1, clientHeight = 1 } = pickerRef.current;

        const indicatorX = (props.hue / 360) * clientWidth;
        const indicatorY = (props.saturation / 100) * clientHeight;

        setPosition({ x: indicatorX, y: indicatorY });
      }
      setSelectedColor(baseColor);
    }
  }, []);

  useEffect(() => {
    const { canvas, context } = getCanvas();
    if (canvas && context) {
      const gradient = context.createLinearGradient(
        0,
        0,
        canvas.width,
        canvas.height
      );
      gradient.addColorStop(0, "white");
      gradient.addColorStop(0.5, baseColor);
      gradient.addColorStop(1, "black");
      context.fillStyle = gradient;
      context.fillRect(0, 0, canvas.width, canvas.height);

      handleChange(getColorPixel(position));
    }
  }, [props.hue]);

  function getCanvas(): {
    canvas: HTMLCanvasElement | null;
    context: CanvasRenderingContext2D | null;
  } {
    if (!canvasRef.current) return { canvas: null, context: null };
    const context = canvasRef.current.getContext("2d");
    if (!context) return { canvas: canvasRef.current, context: null };
    return { canvas: canvasRef.current, context };
  }

  function getColorPixel(position: {
    x: number;
    y: number;
  }): string | undefined {
    if (pickerRef.current) {
      const { clientWidth = 1, clientHeight = 1 } = pickerRef.current;

      const pixelX = Math.floor((position.x * 300) / clientWidth);
      const pixelY = Math.floor((position.y * 150) / clientHeight);

      const { context } = getCanvas();
      if (context) {
        const pixel = context.getImageData(pixelX, pixelY, 1, 1).data;
        return Conversions.toHexAsRgb(pixel[0], pixel[1], pixel[2]);
      }
    }
  }

  function getCanvasPosition(
    event: React.MouseEvent
  ): { x: number; y: number } | undefined {
    const { canvas } = getCanvas();
    if (canvas) {
      const canvasBounds = canvas.getBoundingClientRect();
      const canvasX = event.clientX - canvasBounds.left;
      const canvasY = event.clientY - canvasBounds.top;
      return { x: canvasX, y: canvasY };
    }
  }

  function handleColorClick(event: React.MouseEvent) {
    const position = getCanvasPosition(event);
    if (position) {
      const newColor = getColorPixel(position);
      if (newColor) {
        setPosition(position);
        handleChange(newColor);
      }
    }
  }

  function handleManualColorChange(event: React.ChangeEvent<HTMLInputElement>) {
    const color = event.target.value;
    const formatted = color.startsWith("#") ? color : `#${color}`;
    const hex = formatted.slice(0, 7);
    handleChange(hex);
  }

  function handleChange(hex: string | undefined) {
    if (hex) {
      props.onChange(hex);
      setSelectedColor(hex);
    }
  }

  return (
    <Stack
      direction="row"
      className="al-picker"
      borderRadius={theme.border.radius}
    >
      <Box className="preview" bgcolor={selectedColor}>
        <Box
          type="text"
          component="input"
          value={selectedColor}
          onChange={handleManualColorChange}
          sx={{
            width: 70,
            py: theme.spacing.xs,
            px: theme.spacing.xs,
            borderRadius: theme.border.radius,
            left: theme.spacing.sm * theme.spacing.factor,
            bottom: theme.spacing.sm * theme.spacing.factor,
          }}
        />
      </Box>
      <Box className="color" ref={pickerRef}>
        <Box ref={canvasRef} component="canvas" onClick={handleColorClick} />
        <Box
          className="indicator"
          left={position.x}
          top={position.y}
          borderColor={Auxiliars.getContrast(selectedColor)}
        />
      </Box>
    </Stack>
  );
};

export const ColorPicker = (props: Props) => {
  const { theme } = useTheme();
  const [hue, setHue] = useState<number>(0);
  const [lightness, setLightness] = useState<number>(100);
  const [saturation, setSaturation] = useState<number>(50);
  const [selectedColor, setSelectedColor] = useState<string>(
    props.color ?? "#ff0000"
  );

  useEffect(() => {
    setHSLColor(Conversions.toHslAsHex(selectedColor));
  }, []);

  function handleGradientColorChange(color: string) {
    setSelectedColor(color);
    setHSLColor(Conversions.toHslAsHex(color));
  }

  function handleBaseColorChange(value: HSLColor) {
    setHue(value.h);
  }

  function setHSLColor(value: HSLColor | undefined) {
    if (!value) return;
    setHue(value.h);
    setSaturation(value.s);
    setLightness(value.l);
  }

  return (
    <Stack className="al-color-picker" spacing={theme.spacing.sm}>
      <ColorGradient
        hue={hue}
        saturation={saturation}
        lightness={lightness}
        onChange={handleGradientColorChange}
      />
      <ColorSlider
        min={0}
        max={360}
        value={hue}
        onChange={handleBaseColorChange}
      />
    </Stack>
  );
};

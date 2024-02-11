import "assets/scss/components/code.scss";

import React, { useRef, useState } from "react";
import { useTheme } from "contexts";
import { Auxiliars } from "helpers";
import { Box } from "@mui/material";

type Props = {
  name?: string;
  count: number;
  required?: boolean;
  autofocus?: boolean;
  value?: number | string;
  onInput?: (name: string, value: string) => void;
};

export const VerificationCode = (props: Props) => {
  const { theme } = useTheme();
  const [currentValue, setCurrentValue] = useState<string[]>(
    Array.from({ length: props.count }, () => "")
  );
  const [currentIndex, setCurrentIndex] = useState<number>(-1);

  const elms = useRef<HTMLInputElement[] | null>([]);
  const isDone = currentValue.length === Number(props.count);

  function handleFocus(
    event: React.FocusEvent<HTMLInputElement>,
    index: number
  ) {
    event.target.select();
    setCurrentIndex(index);
  }

  function handleInput(
    event: React.FormEvent<HTMLInputElement>,
    index: number
  ) {
    const [first, ...rest] = event.currentTarget.value;
    const newValue = currentValue;
    newValue[index] = first ?? "";
    setCurrentValue(newValue);

    if (first) {
      if (index === props.count - 1) {
        if (isDone) {
          elms.current?.at(index)?.blur();
          props.onInput && props.onInput(props.name ?? "", newValue.join(""));
        }
      } else {
        const elm = elms.current?.at(index + 1);
        if (elm) {
          elm.focus();
          elm.value = rest.join("");
          elm.dispatchEvent(new Event("input", { bubbles: true }));
          setCurrentIndex(index + 1);
        }
      }
    }
  }

  function handleKeydown(
    event: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) {
    if (event.keyCode === 8 && event.currentTarget.value === "") {
      elms.current?.at(Math.max(0, index - 1))?.focus();
    }
  }

  return (
    <Box className="al-code">
      {Auxiliars.generateArray(props.count).map((_, i: number) => {
        return (
          <input
            required
            key={i}
            ref={(elm: HTMLInputElement) =>
              elms.current && (elms.current[i] = elm)
            }
            onFocus={(event: React.FocusEvent<HTMLInputElement>) =>
              handleFocus(event, i)
            }
            onInput={(event: React.FormEvent<HTMLInputElement>) =>
              handleInput(event, i)
            }
            onKeyDown={(event: React.KeyboardEvent<HTMLInputElement>) =>
              handleKeydown(event, i)
            }
            autoComplete="off"
            autoFocus={i === 0}
            value={currentValue[i]}
            style={{
              color: theme.palette.font.color,
              backgroundColor: theme.palette.background.color,
              outlineColor: currentIndex === i ? theme.color.primary.color : "",
            }}
          />
        );
      })}
    </Box>
  );
};

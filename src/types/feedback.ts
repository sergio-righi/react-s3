import { Enums } from "utils";

export type Feedback = {
  message: string | null;
  severity: Enums.EnumFeedback | null;
}
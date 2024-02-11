
enum EnumTheme {
  Light = 1,
  Dark = 2,
}

enum EnumFeedback {
  Success = "success",
  Error = "error",
  Info = "info"
}

enum EnumValidation {
  Required = "required",
  IsGraterThan = "isGraterThan",
  IsLessThan = "isLessThan",
  IsEquals = "isEquals",
  MinLength = "minLength",
  Function = "function",
  Regex = "regex"
}

export {
  EnumTheme,
  EnumFeedback,
  EnumValidation
}
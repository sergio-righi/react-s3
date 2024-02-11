import { Navigate } from "react-router-dom";

export const Protected = ({
  condition,
  redirectTo,
  children,
}: {
  condition: boolean;
  redirectTo: string;
  children: any;
}) => {
  // return condition ? <Navigate to={redirectTo} replace /> : children;
  return children;
};

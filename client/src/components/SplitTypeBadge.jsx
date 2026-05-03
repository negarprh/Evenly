import { Badge } from "./Badge";

export const SplitTypeBadge = ({ splitType }) => (
  <Badge tone={splitType === "custom" ? "warm" : "info"}>
    {splitType === "custom" ? "Custom split" : "Equal split"}
  </Badge>
);

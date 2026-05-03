import { Badge } from "./Badge";

export const StatusBadge = ({ settled }) => (
  <Badge tone={settled ? "success" : "warm"}>{settled ? "Settled" : "Still open"}</Badge>
);

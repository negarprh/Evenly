export const Card = ({ className = "", children, glow = false }) => (
  <section className={`panel ${glow ? "surface-glow" : ""} ${className}`.trim()}>{children}</section>
);

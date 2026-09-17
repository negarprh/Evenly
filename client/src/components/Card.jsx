export const Card = ({ className = "", children, glow = false }) => (
  <section className={`panel ${glow ? "page-heading" : ""} ${className}`.trim()}>{children}</section>
);

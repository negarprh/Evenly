export const Avatar = ({ user, size = "md" }) => {
  const sizes = {
    xs: "h-7 w-7 text-[10px]",
    sm: "h-8 w-8 text-[11px]",
    md: "h-10 w-10 text-xs",
    lg: "h-12 w-12 text-sm"
  };

  return (
    <div
      className={`${sizes[size]} flex shrink-0 items-center justify-center rounded-full border border-white/80 font-bold text-white shadow-sm`}
      style={{ backgroundColor: user?.avatarColor || "#0f766e" }}
      title={user?.name}
    >
      {user?.avatarInitials || user?.name?.slice(0, 2).toUpperCase() || "EV"}
    </div>
  );
};

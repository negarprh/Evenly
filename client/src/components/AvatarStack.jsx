import { Avatar } from "./Avatar";

export const AvatarStack = ({ users = [], max = 4, size = "sm" }) => {
  const visible = users.slice(0, max);
  const remaining = Math.max(users.length - visible.length, 0);

  return (
    <div className="flex items-center">
      <div className="flex -space-x-2">
        {visible.map((user) => (
          <div key={user._id || user.id || user.email} className="rounded-full ring-2 ring-white">
            <Avatar user={user} size={size} />
          </div>
        ))}
      </div>
      {remaining > 0 ? (
        <span className="ml-3 text-xs font-semibold text-slate-500">+{remaining} more</span>
      ) : null}
    </div>
  );
};

import { useEffect, useRef, useState } from "react";
import { ChevronDown, LayoutGrid, LogOut, Plus, UserCircle2, UsersRound } from "lucide-react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Avatar } from "../components/Avatar";
import { Button } from "../components/Button";
import { LogoMark } from "../components/LogoMark";
import { useAuth } from "../contexts/AuthContext";

const navigation = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutGrid },
  { to: "/groups", label: "Groups", icon: UsersRound }
];

export const AppLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef(null);

  useEffect(() => {
    if (!profileMenuOpen) return undefined;

    const onPointerDown = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setProfileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [profileMenuOpen]);

  const navClass = ({ isActive }) =>
    `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
      isActive ? "bg-amber-50 text-amber-800" : "text-slate-600 hover:bg-white hover:text-ink"
    }`;

  const goToProfile = () => {
    setProfileMenuOpen(false);
    navigate("/profile");
  };

  const doLogout = () => {
    setProfileMenuOpen(false);
    logout();
  };

  return (
    <div className="min-h-screen bg-paper">
      <aside className="sidebar-gradient fixed inset-y-0 left-0 hidden w-[288px] border-r border-white/70 px-5 py-6 lg:flex lg:flex-col">
        <Link to="/dashboard" className="rounded-2xl px-3 py-2">
          <LogoMark />
        </Link>

        <div className="mt-8">
          <div className="px-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Navigate</div>
          <nav className="mt-3 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink key={item.to} className={navClass} to={item.to}>
                  <Icon size={18} />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>
        </div>

        <div className="mt-6 rounded-[24px] border border-white/70 bg-white/85 p-4">
          <div className="text-sm font-semibold text-slate-500">Quick action</div>
          <div className="mt-3 text-sm leading-6 text-slate-500">
            Start a new shared space whenever a roommate setup, trip, or household budget needs clarity.
          </div>
          <Button className="mt-4 w-full" onClick={() => navigate("/groups/new")}>
            <Plus size={16} />
            Start a shared group
          </Button>
        </div>

        <div className="mt-auto rounded-[24px] border border-white/70 bg-white/90 p-4">
          <div className="flex items-center gap-3">
            <Avatar user={user} />
            <div className="min-w-0">
              <div className="truncate font-semibold text-ink">{user?.name}</div>
              <div className="truncate text-sm text-slate-500">{user?.email}</div>
            </div>
          </div>
          <p className="mt-4 text-xs text-slate-500">
            Use the profile menu in the top-right corner to update your details or log out.
          </p>
        </div>
      </aside>

      <div className="lg:pl-[288px]">
        <header className="sticky top-0 z-20 border-b border-white/70 bg-paper/90 backdrop-blur">
          <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 md:px-8">
            <div className="flex items-center justify-between gap-4">
              <Link to="/dashboard" className="lg:hidden">
                <LogoMark compact={false} />
              </Link>

              <div className="hidden lg:block">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Shared money made calmer</div>
                <div className="display-font text-2xl font-semibold text-ink">
                  {location.pathname.startsWith("/groups/") && !location.pathname.endsWith("/new")
                    ? "Group space"
                    : location.pathname === "/groups"
                      ? "Your groups"
                      : location.pathname === "/groups/new"
                        ? "Start a shared group"
                        : location.pathname === "/profile"
                          ? "Your profile"
                          : "Dashboard"}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button className="hidden sm:inline-flex" onClick={() => navigate("/groups/new")}>
                  <Plus size={16} />
                  Start a shared group
                </Button>

                <div className="relative" ref={profileMenuRef}>
                  <button
                    className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/85 px-2 py-2 text-sm font-semibold text-slate-700 transition hover:bg-white"
                    onClick={() => setProfileMenuOpen((open) => !open)}
                    type="button"
                  >
                    <Avatar user={user} size="sm" />
                    <span className="hidden pr-1 sm:block">{user?.name}</span>
                    <ChevronDown size={16} className="text-slate-500" />
                  </button>

                  {profileMenuOpen ? (
                    <div className="absolute right-0 z-30 mt-2 w-52 rounded-2xl border border-line bg-white p-2 shadow-card">
                      <button
                        className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                        onClick={goToProfile}
                        type="button"
                      >
                        <UserCircle2 size={16} />
                        Profile
                      </button>
                      <button
                        className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                        onClick={doLogout}
                        type="button"
                      >
                        <LogOut size={16} />
                        Log out
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="no-scrollbar flex gap-2 overflow-x-auto lg:hidden">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink key={item.to} className={navClass} to={item.to}>
                    <Icon size={16} />
                    {item.label}
                  </NavLink>
                );
              })}
              <button
                className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-white hover:text-ink"
                onClick={goToProfile}
                type="button"
              >
                <UserCircle2 size={16} />
                Profile
              </button>
            </div>
          </div>
        </header>

        <main className="px-4 py-6 md:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

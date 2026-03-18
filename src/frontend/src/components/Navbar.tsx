import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BarChart3, Bell, ChevronDown } from "lucide-react";
import type { UserProfile } from "../backend.d";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

const NAV_LINKS = [
  { label: "Dashboard", active: false },
  { label: "My KRAs", active: false },
  { label: "Task Tracking", active: true },
  { label: "Reports", active: false },
  { label: "Team", active: false },
  { label: "Settings", active: false },
];

interface NavbarProps {
  profile: UserProfile | null;
}

export function Navbar({ profile }: NavbarProps) {
  const { clear } = useInternetIdentity();

  const initials = profile?.name
    ? profile.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-card border-b border-border h-14 flex items-center px-6 shadow-xs">
      {/* Brand */}
      <div className="flex items-center gap-2 mr-8">
        <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
          <BarChart3 size={16} className="text-primary-foreground" />
        </div>
        <span className="font-bold text-base text-card-foreground tracking-tight">
          KRAFlow
        </span>
      </div>

      {/* Nav links */}
      <nav
        className="flex items-center gap-1 flex-1"
        aria-label="Main navigation"
      >
        {NAV_LINKS.map((link) => (
          <button
            key={link.label}
            data-ocid={`nav.${link.label.toLowerCase().replace(" ", "_")}.link`}
            type="button"
            className={`px-3 h-14 text-sm font-medium transition-colors relative ${
              link.active
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {link.label}
            {link.active && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t" />
            )}
          </button>
        ))}
      </nav>

      {/* Right */}
      <div className="flex items-center gap-3">
        <button
          data-ocid="nav.notifications.button"
          type="button"
          className="w-8 h-8 flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          aria-label="Notifications"
        >
          <Bell size={16} />
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger
            data-ocid="nav.user.dropdown_menu"
            className="flex items-center gap-2 cursor-pointer select-none"
          >
            <Avatar className="w-7 h-7">
              <AvatarFallback className="text-xs bg-primary text-primary-foreground font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium text-foreground">
              {profile?.name ?? "User"}
            </span>
            <ChevronDown size={14} className="text-muted-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              data-ocid="nav.logout.button"
              onClick={clear}
              className="cursor-pointer"
            >
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import {
  LayoutGrid,
  CalendarDays,
  Users,
  UserCircle2,
  Search,
  MessageSquare,
  Menu,
} from "lucide-react";
import { NavSearch } from "@/components/nav-search";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "Feed",    href: "/member/feed",    icon: LayoutGrid   },
  { label: "Events",  href: "/member/events",  icon: CalendarDays },
  { label: "Members", href: "/member/members", icon: Users        },
  { label: "Profile", href: "/member/profile", icon: UserCircle2  },
] as const;


function NavLink({
  href,
  label,
  icon: Icon,
  active,
  mobile = false,
}: {
  href: string;
  label: string;
  icon: React.ElementType;
  active: boolean;
  mobile?: boolean;
}) {
  if (mobile) {
    return (
      <Link
        href={href}
        className={cn(
          "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
          active
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
        )}
      >
        <Icon className="h-5 w-5 shrink-0" />
        {label}
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className={cn(
        "group relative flex h-14 items-center gap-2 px-5 text-sm font-semibold transition-colors",
        active
          ? "text-primary"
          : "text-muted-foreground hover:text-foreground"
      )}
    >
      <Icon
        className={cn(
          "h-5 w-5 transition-transform group-hover:scale-110",
          active && "text-primary"
        )}
      />
      <span className="hidden xl:inline">{label}</span>

      {/* Active underline indicator */}
      <span
        className={cn(
          "absolute bottom-0 left-0 h-[3px] w-full rounded-full bg-primary transition-opacity",
          active ? "opacity-100" : "opacity-0 group-hover:opacity-30"
        )}
      />
    </Link>
  );
}

// ─── Layout ───────────────────────────────────────────────────────────────────

export default function UserLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* ── Top Navigation Bar ─────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b bg-card shadow-sm">
        <div className="mx-auto flex h-14 max-w-screen-xl items-center gap-2 px-4">

          {/* ── Logo ─────────────────────────────────────────────────── */}
          <Link
            href="/user/feed"
            className="mr-2 flex shrink-0 items-center gap-2 font-bold text-primary"
          >
            {/* Compact logo mark */}
            <img src="/NP_TRANSPARENT.png" alt="Your avatar" className="h-8 w-8 rounded-full" />
          </Link>

          {/* ── Search (desktop) ─────────────────────────────────────── */}
          <div className="hidden md:block">
            <NavSearch />
          </div>

          {/* ── Desktop Center Nav ───────────────────────────────────── */}
          <nav className="hidden flex-1 items-center justify-center gap-1 md:flex">
            {NAV_ITEMS.map(({ href, label, icon }) => (
              <NavLink
                key={href}
                href={href}
                label={label}
                icon={icon}
                active={pathname === href || pathname.startsWith(href + "/")}
              />
            ))}
          </nav>

          {/* ── Right Actions ────────────────────────────────────────── */}
          <div className="ml-auto flex items-center gap-1">
            {/* Search icon — mobile only */}
            <Button
              size="icon"
              variant="ghost"
              className="rounded-full md:hidden"
              aria-label="Search"
            >
              <Search className="h-4 w-4" />
            </Button>

            {/* Avatar / Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-8 w-8 rounded-full p-0 focus-visible:ring-2 focus-visible:ring-primary"
                  aria-label="Open profile menu"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/avatar.png" alt="Your avatar" />
                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                      MT
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel className="font-normal">
                  <p className="text-sm font-semibold">Mark Tristan</p>
                  <p className="text-xs text-muted-foreground">@marktristan</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/user/profile">View Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/user/profile/settings">Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive focus:text-destructive">
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Hamburger */}
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  className="rounded-full md:hidden"
                  aria-label="Open menu"
                >
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0">
                <SheetHeader className="border-b px-4 py-3">
                  <SheetTitle className="flex items-center gap-2 text-base font-bold text-primary">
                    <img src="/NP_TRANSPARENT.png" alt="Your avatar" className="h-8 w-8 rounded-full" />
                    No-Peripherals
                  </SheetTitle>
                </SheetHeader>

                {/* Mobile Search */}
                <div className="px-4 py-3 border-b">
                  <NavSearch variant="sheet" />
                </div>

                {/* Mobile Nav */}
                <nav className="flex flex-col gap-1 p-3">
                  {NAV_ITEMS.map(({ href, label, icon }) => (
                    <NavLink
                      key={href}
                      href={href}
                      label={label}
                      icon={icon}
                      active={pathname === href || pathname.startsWith(href + "/")}
                      mobile
                    />
                  ))}
                </nav>

                {/* Mobile Footer */}
                <div className="absolute bottom-0 left-0 right-0 border-t p-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src="/avatar.png" alt="Your avatar" />
                      <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                        MT
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 overflow-hidden">
                      <p className="truncate text-sm font-semibold">Mark Tristan</p>
                      <p className="truncate text-xs text-muted-foreground">@marktristan</p>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* ── Page Content ───────────────────────────────────────────────────── */}
      <main className="flex-1">{children}</main>

      {/* ── Mobile Bottom Tab Bar ──────────────────────────────────────────── */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-card md:hidden">
        <div className="flex h-16 items-center justify-around px-2">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex flex-1 flex-col items-center justify-center gap-0.5 py-1 text-[10px] font-medium transition-colors",
                  active ? "text-primary" : "text-muted-foreground"
                )}
              >
                <span
                  className={cn(
                    "flex h-7 w-14 items-center justify-center rounded-full transition-colors",
                    active && "bg-primary/10"
                  )}
                >
                  <Icon className="h-5 w-5" />
                </span>
                {label}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Bottom padding so content doesn't hide behind bottom tab bar on mobile */}
      <div className="h-16 md:hidden" aria-hidden="true" />
    </div>
  );
}
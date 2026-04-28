"use client";

import Link from "next/link";
import { redirect, usePathname } from "next/navigation";
import { ReactNode, useEffect } from "react";
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
import { supabase } from "@/utils/supabase/client";
import React from "react";

const NAV_ITEMS = [
  { label: "Dashboard",    href: "/member/dashboard",    icon: LayoutGrid   },
  { label: "Events",  href: "/member/events",  icon: CalendarDays },
  { label: "Members", href: "/member/members", icon: Users        },
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


export default function UserLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [user, setUser] = React.useState({
    name: "",
    email: "",
    avatar: "",
  });

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) console.error(error)
    console.log("Signed out")
    redirect('/auth/login')
  }

  const loadUser = async () => {
    const { data: authData } = await supabase.auth.getUser()
    const authUser = authData.user

    if (!authUser) return

    const { data: profile } = await supabase
      .from("users")
      .select("full_name, profile_path, email")
      .eq("id", authUser.id)
      .single()

      console.log('profile')

    setUser({
      name: profile?.full_name ?? authUser.email,
      email: profile?.email ?? authUser.email,
      avatar: profile?.profile_path ?? "/avatars/default.png",
    })
  }

  useEffect(() => {
    loadUser()
  }, [])

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-50 border-b bg-card shadow-sm">
        <div className="mx-auto flex h-14 max-w-screen-xl items-center gap-2 px-4">

          <Link
            href="/user/feed"
            className="mr-2 flex shrink-0 items-center gap-2 font-bold text-primary"
          >
            <img src="/NP_TRANSPARENT.png" alt="Your avatar" className="h-8 w-8 rounded-full" />
          </Link>

          <div className="hidden md:block">
            <NavSearch isAdmin={false} />
          </div>


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

          <div className="ml-auto flex items-center gap-1">

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-8 w-8 rounded-full p-0 focus-visible:ring-2 focus-visible:ring-primary"
                  aria-label="Open profile menu"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar} alt="Your avatar" />
                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                      {user.name?.toUpperCase().slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel className="font-normal">
                  <p className="text-sm font-semibold">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/member/settings">Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={handleLogout}>
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
                  <NavSearch variant="sheet" isAdmin={false} />
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
                      <AvatarImage src={user.avatar} alt="Your avatar" />
                      <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                        {user.name?.toUpperCase().slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 overflow-hidden">
                      <p className="truncate text-sm font-semibold">{user.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      {/*Mobile */}
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

      <div className="h-16 md:hidden" aria-hidden="true" />
    </div>
  );
}
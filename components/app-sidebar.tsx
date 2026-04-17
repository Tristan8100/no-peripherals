"use client"

import * as React from "react"
import { createClient } from "@supabase/supabase-js"

import {
  IconCamera,
  IconChartBar,
  IconDashboard,
  IconFolder,
  IconUsers,
  IconFileDescription,
  IconFileAi,
  IconInnerShadowTop,
  IconListDetails,
  IconCalendar,
} from "@tabler/icons-react"

import { NavMain } from "./nav-main"
import { NavUser } from "./nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { supabase } from "@/utils/supabase/client"
import Link from "next/link"
import Image from "next/image"

export function AppSidebar({ role, ...props }: React.ComponentProps<typeof Sidebar> & { role: "user" | "admin" | "member" }) {
  const [user, setUser] = React.useState<any>(null)

  const data = React.useMemo(() => {
    if (role === "admin") {
      return {
        navMain: [
          { title: "Dashboard", url: "/admin/dashboard", icon: IconDashboard },
          { title: "Feed", url: "/admin/posts", icon: IconListDetails },
          { title: "Users", url: "/admin/users", icon: IconUsers },
          { title: "Events", url: "/admin/events", icon: IconCalendar },
        ],
      }
    }

    if (role === "member") {
      return {
        navMain: [
          { title: "Dashboard", url: "/member/dashboard", icon: IconDashboard },
          { title: "Feed", url: "/member/posts", icon: IconListDetails },
          { title: "Events", url: "/member/events", icon: IconCalendar },
        ],
      }
    }

    // default = user
    return {
      navMain: [
        { title: "Home", url: "/user/dashboard", icon: IconDashboard },
        { title: "Feed", url: "/user/posts", icon: IconListDetails },
      ],
    }
  }, [role])

  React.useEffect(() => {
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

    loadUser()
  }, [])

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <Link href="/">
                <Image src="/NP_TRANSPARENT.png" alt="No Peripherals" width={40} height={40}/>
                <span className="text-base font-semibold">No Peripherals</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>

      <SidebarFooter>
        <NavUser
          user={
            user ?? {
              name: "Loading...",
              email: "",
              avatar: "/avatars/default.png",
            }
          }
        />
      </SidebarFooter>
    </Sidebar>
  )
}
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { IconMusic, IconBell } from "@tabler/icons-react"
import { NavSearch } from "./nav-search"

export function SiteHeader() {
  return (
    <header className="flex h-(--header-height) shrink-0 items-center border-b bg-background/80 backdrop-blur-sm">
      <div className="flex w-full items-center gap-3 px-4 lg:px-6">

        <SidebarTrigger className="-ml-1" />

        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-5"
        />

        <div className="flex items-center gap-2">
          <IconMusic className="size-4 text-muted-foreground" />
          <h1 className="text-base font-semibold tracking-tight hidden md:block">
            Band Dashboard
          </h1>
        </div>

        <span className="hidden md:block text-xs text-muted-foreground">
          Manage members, events, and performances
        </span>
        <div className="ml-auto flex items-center gap-2">
          <NavSearch isAdmin />
        </div>
      </div>
    </header>
  )
}
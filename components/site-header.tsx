import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { IconMusic, IconBell } from "@tabler/icons-react"

export function SiteHeader() {
  return (
    <header className="flex h-(--header-height) shrink-0 items-center border-b bg-background/80 backdrop-blur-sm">
      <div className="flex w-full items-center gap-3 px-4 lg:px-6">

        {/* Sidebar toggle */}
        <SidebarTrigger className="-ml-1" />

        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-5"
        />

        {/* Title section */}
        <div className="flex items-center gap-2">
          <IconMusic className="size-4 text-muted-foreground" />
          <h1 className="text-base font-semibold tracking-tight">
            Band Dashboard
          </h1>
        </div>

        {/* Optional subtitle (context awareness) */}
        <span className="hidden md:block text-xs text-muted-foreground">
          Manage members, events, and performances
        </span>

        {/* Right actions */}
        <div className="ml-auto flex items-center gap-2">

        </div>
      </div>
    </header>
  )
}
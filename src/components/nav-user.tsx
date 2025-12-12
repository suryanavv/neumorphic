import {
  IconDotsVertical,
  IconLogout,
  IconMail,
  IconStethoscope,
  IconPhone,
  IconShield,
} from "@tabler/icons-react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

export function NavUser({
  user,
  onLogout,
  onPageChange,
  userType,
}: {
  user: {
    name: string
    email: string
    avatar: string
    role?: string
    phone?: string
  }
  onLogout?: () => void
  onPageChange?: (page: string) => void
  userType?: 'admin' | 'doctor'
}) {
  const { isMobile } = useSidebar()

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground hover:bg-sidebar-accent rounded-xl transition-all duration-200"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
                  {user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold text-foreground">{userType === 'doctor' ? `Dr. ${user.name}` : user.name}</span>
                <span className="truncate text-xs text-muted-foreground">
                  {user.role?.replace(/^Dr\.\s*/i, '') || user.email}
                </span>
              </div>
              <IconDotsVertical className="ml-auto size-4 text-muted-foreground" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-64 rounded-xl border border-border bg-card shadow-elevated"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-3 px-3 py-4 text-left text-sm bg-gradient-to-r from-slate-50 to-slate-100 rounded-t-xl">
                <Avatar className="h-12 w-12 rounded-xl shadow-sm">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-lg">
                    {user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold text-foreground">{userType === 'doctor' ? `Dr. ${user.name}` : user.name}</span>
                  <span className="truncate text-xs flex items-center gap-1 text-muted-foreground" style={{ textTransform: 'none' }}>
                    <IconMail className="w-3 h-3" />
                    {user.email}
                  </span>
                  {user.role && (
                    <span className="truncate text-xs flex items-center gap-1 text-muted-foreground">
                      <IconStethoscope className="w-3 h-3" />
                      {user.role.replace(/^Dr\.\s*/i, '')}
                    </span>
                  )}
                  {user.phone && (
                    <span className="truncate text-xs flex items-center gap-1 text-muted-foreground">
                      <IconPhone className="w-3 h-3" />
                      {user.phone}
                    </span>
                  )}
                </div>
              </div>
            </DropdownMenuLabel>
            {userType === 'admin' && onPageChange && (
              <>
                <DropdownMenuSeparator className="mx-2" />
                <DropdownMenuItem
                  onClick={() => onPageChange("mfa-settings")}
                  className="mx-2 rounded-lg cursor-pointer hover:bg-slate-100 focus:bg-slate-100 transition-colors"
                >
                  <IconShield className="text-primary" />
                  MFA Settings
                </DropdownMenuItem>
              </>
            )}
            <DropdownMenuSeparator className="mx-2" />
            <DropdownMenuItem
              onClick={onLogout}
              className="mx-2 mb-2 rounded-lg cursor-pointer hover:bg-red-50 focus:bg-red-50 text-red-600 hover:text-red-700 transition-colors"
            >
              <IconLogout />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

import { type Icon } from "@tabler/icons-react"
import { useState, useEffect, useRef } from "react"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function NavMain({
  items,
  onPageChange,
  currentPage,
}: {
  items: {
    title: string
    url: string
    icon?: Icon
    page?: string
  }[]
  onPageChange?: (page: string) => void
  currentPage?: string
}) {
  const [activeTabRect, setActiveTabRect] = useState<{ top: number; height: number } | null>(null)
  const menuRefs = useRef<(HTMLLIElement | null)[]>([])
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (currentPage) {
      const activeIndex = items.findIndex(item => item.page === currentPage)
      if (activeIndex !== -1 && menuRefs.current[activeIndex]) {
        const rect = menuRefs.current[activeIndex]?.getBoundingClientRect()
        const containerRect = containerRef.current?.getBoundingClientRect()
        if (rect && containerRect) {
          setActiveTabRect({
            top: rect.top - containerRect.top,
            height: rect.height,
          })
        }
      }
    }
  }, [currentPage, items])

  return (
    <SidebarGroup>
      <SidebarGroupContent ref={containerRef} className="flex flex-col gap-1 relative">
        <SidebarMenu>
          {items.map((item, index) => (
            <SidebarMenuItem key={item.title} ref={(el) => { menuRefs.current[index] = el; }}>
              <SidebarMenuButton
                tooltip={item.title}
                onClick={() => item.page && onPageChange?.(item.page)}
                isActive={currentPage === item.page}
                className="rounded-lg transition-all duration-200"
              >
                {item.icon && <item.icon />}
                <span>{item.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>

          {activeTabRect && (
          <div
              className="absolute left-0 w-1 bg-primary rounded-r-full pointer-events-none transition-all duration-200"
            style={{
                top: activeTabRect.top + 4,
                height: activeTabRect.height - 8,
              }}
            />
          )}
      </SidebarGroupContent>
    </SidebarGroup>
  )
}

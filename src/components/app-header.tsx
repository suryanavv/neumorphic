import { SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { useCounts } from "@/contexts/counts-context"
import { AuthStorage } from "@/api/auth"

// Static app config
const app = {
  name: "Maartha Clinic"
}

// Static navigation items for doctor (used for page title lookup)
const doctorNavItems = [
  { title: "Appointments", page: "appointments" },
  { title: "Analytics", page: "dashboard" },
  { title: "Patients", page: "patients" },
  { title: "Logs", page: "logs" },
  { title: "Front Desk", page: "front-desk" },
  { title: "Refill Requests", page: "refill-requests" },
  { title: "Clinic Availability", page: "settings" },
  { title: "Calendar Integrations", page: "calendar-integrations" }
]

// Admin navigation items
const adminNavItems = [
  { title: "Analytics", page: "dashboard" },
  { title: "Appointments", page: "appointments" },
  { title: "Doctors", page: "doctors" },
  { title: "Patients", page: "patients" },
  { title: "Logs", page: "logs" }
]

interface AppHeaderProps {
  currentPage?: string
  userType?: 'admin' | 'doctor'
  doctorsCount?: number
  userData?: any
}

export function AppHeader({ currentPage, userType = 'doctor', doctorsCount, userData }: AppHeaderProps) {
  const { frontDeskCount, refillRequestsCount } = useCounts()

  // Get the appropriate navigation items based on user type
  const navItems = userType === 'admin' ? adminNavItems : doctorNavItems

  // Map page keys to display names with counts
  const getPageTitle = (page: string) => {
    const navItem = navItems.find(item => item.page === page)
    if (!navItem) return userType === 'admin' ? "EzMedTech" : app.name

    let title = navItem.title

    // Add counts for specific pages
    if (page === 'doctors' && doctorsCount !== undefined) {
      title += ` (${doctorsCount})`
    } else if (userType === 'doctor') {
      if (page === 'front-desk' && frontDeskCount !== null) {
        title += ` (${frontDeskCount})`
      } else if (page === 'refill-requests' && refillRequestsCount !== null) {
        title += ` (${refillRequestsCount})`
      }
    }

    return title
  }

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/50">
      {/* Admin Impersonation Banner */}
      {AuthStorage.isAdminImpersonating() && userType === 'doctor' && userData && (
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-2 text-center text-sm font-medium text-white">
          <div className="flex items-center justify-center gap-3">
            <span>👑 Admin logged in as {userData.name || `${userData.first_name || ''} ${userData.last_name || ''}`.trim()}</span>
            <Button
              onClick={() => {
                AuthStorage.clearAll()
                window.location.reload()
              }}
              size="sm"
              className="bg-white/20 hover:bg-white/30 text-white border-0 rounded-full text-xs font-medium transition-colors"
            >
              Exit Impersonation
            </Button>
          </div>
        </div>
      )}

      <div className="flex h-16 shrink-0 items-center justify-between gap-4 px-6">
        <div className="flex items-center gap-3">
          <SidebarTrigger className="-ml-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors" />
          <div className="h-6 w-px bg-slate-200"></div>
          <span className="text-lg font-semibold text-slate-900">
            {currentPage ? getPageTitle(currentPage) : (userType === 'admin' ? "EzMedTech" : app.name)}
          </span>
        </div>
        <div className="flex items-center gap-4">
          {/* Branding - Powered by EzMedTech */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-full">
            <img
              src="/logo.svg"
              alt={userType === 'admin' ? "EzMedTech Logo" : "EzMedTech Logo"}
              className="w-5 h-5 object-contain"
            />
            <div className="flex flex-col">
              <span className="text-[10px] font-medium text-slate-500 leading-tight">
                Powered by
              </span>
              <span className="text-xs font-semibold text-slate-700 leading-tight">
                EzMedTech
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}


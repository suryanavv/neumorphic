import "./App.css"
import { useState, Suspense, lazy, useEffect } from "react"
import {
  SidebarProvider,
} from "@/components/ui/sidebar"
import { AuthStorage, AuthAPI } from "@/api/auth"
import { CountsProvider, useCounts } from "@/contexts/counts-context"

// Dynamic imports for shared components
const AppSidebar = lazy(() => import("@/components/app-sidebar").then(module => ({ default: module.AppSidebar })))
const AppHeader = lazy(() => import("@/components/app-header").then(module => ({ default: module.AppHeader })))

const getApiBaseUrl = (): string => {
  return import.meta.env.VITE_API_BASE_URL
}

// Inner component to access counts context
function AppContent({
  currentPage,
  pageParams,
  navigateToPage,
  handleLogout,
  clinicData,
  userData,
  userType,
  renderContent
}: {
  currentPage: string
  pageParams: any
  navigateToPage: (pageOrObject: string | { page: string; params?: any }) => void
  handleLogout: () => void
  clinicData: any
  userData: any
  userType: string
  renderContent: () => React.ReactNode
}) {
  const { doctorsCount } = useCounts()

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 64)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <Suspense fallback={
        <div className="w-64 bg-background border-r animate-pulse">
          <div className="h-16 border-b"></div>
          <div className="p-4 space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-8 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      }>
        <AppSidebar
          variant="floating"
          onPageChange={navigateToPage}
          currentPage={currentPage}
          onLogout={handleLogout}
          clinicData={clinicData}
          userData={userData}
          userType={userType as 'admin' | 'doctor'}
        />
      </Suspense>
      <main className="flex-1">
        <Suspense fallback={
          <div className="h-16 bg-background border-b animate-pulse flex items-center px-4">
            <div className="h-8 w-32 bg-muted rounded"></div>
          </div>
        }>
          <AppHeader currentPage={currentPage} userType={userType as 'admin' | 'doctor'} doctorsCount={doctorsCount ?? undefined} userData={userData} />
        </Suspense>
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col my-2">
            <div className="flex flex-col">
              {renderContent()}

            </div>
          </div>
        </div>
      </main>
    </SidebarProvider>
  )
}

// Lazy load page components for code splitting
const DoctorAnalyticsPage = lazy(() => import("@/components/doctorpages/analytics-page").then(module => ({ default: module.AnalyticsPage })))
const DoctorAppointmentPage = lazy(() => import("@/components/doctorpages/appointment-page").then(module => ({ default: module.AppointmentPage })))
const DoctorPatientsPage = lazy(() => import("@/components/doctorpages/patients-page").then(module => ({ default: module.PatientsPage })))
const DoctorLogsPage = lazy(() => import("@/components/doctorpages/logs-page").then(module => ({ default: module.LogsPage })))
const DoctorFrontDeskPage = lazy(() => import("@/components/doctorpages/front-desk-page").then(module => ({ default: module.FrontDeskPage })))
const DoctorRefillRequestsPage = lazy(() => import("@/components/doctorpages/refill-requests-page").then(module => ({ default: module.RefillRequestsPage })))
const DoctorSettingsPage = lazy(() => import("@/components/doctorpages/settings-page").then(module => ({ default: module.SettingsPage })))
const DoctorCalendarIntegrations = lazy(() => import("@/components/doctorpages/calendar-integrations").then(module => ({ default: module.CalendarIntegrations })))

const AdminAnalyticsPage = lazy(() => import("@/components/adminpages/analytics-page").then(module => ({ default: module.AnalyticsPage })))
const AdminAppointmentPage = lazy(() => import("@/components/adminpages/appointment-page").then(module => ({ default: module.AppointmentPage })))
const AdminDoctorsPage = lazy(() => import("@/components/adminpages/doctors-page").then(module => ({ default: module.DoctorsPage })))
const AdminPatientsPage = lazy(() => import("@/components/adminpages/patients-page").then(module => ({ default: module.PatientsPage })))
const AdminLogsPage = lazy(() => import("@/components/adminpages/logs-page").then(module => ({ default: module.LogsPage })))
const AdminMFASettingsPage = lazy(() => import("@/components/adminpages/mfa-settings-page").then(module => ({ default: module.MFASettingsPage })))

const LoginPage = lazy(() => import("@/components/login-page").then(module => ({ default: module.LoginPage })))

export default function App() {
  const [currentPage, setCurrentPage] = useState("dashboard")
  const [pageParams, setPageParams] = useState<any>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [userData, setUserData] = useState<any>(null)
  const [clinicData, setClinicData] = useState<any>(null)

  // Get user type to determine which components to use
  const userType = (AuthStorage.getUserType() || 'doctor') as 'admin' | 'doctor'
  const isAdmin = userType === 'admin'

  // Validate current page based on user type
  useEffect(() => {
    if (isAuthenticated) {
      const adminPages = ['dashboard', 'appointments', 'doctors', 'patients', 'logs', 'mfa-settings']
      const doctorPages = ['dashboard', 'appointments', 'patients', 'logs', 'front-desk', 'refill-requests', 'settings', 'calendar-integrations']

      const validPages = isAdmin ? adminPages : doctorPages

      if (!validPages.includes(currentPage)) {
        console.log(`⚠️ Invalid page "${currentPage}" for ${isAdmin ? 'admin' : 'doctor'} user, redirecting to dashboard`)
        setCurrentPage('dashboard')
      }
    }
  }, [currentPage, isAuthenticated, isAdmin])

  // Function to fetch clinic data
  const fetchClinicData = async (clinicId: number) => {
    try {
      console.log('🏥 Fetching clinic data for clinic ID:', clinicId)
      const response = await fetch(`${getApiBaseUrl()}/dashboard/clinics/${clinicId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${AuthStorage.getToken()}`,
        },
      })

      if (response.ok) {
        const clinic = await response.json()
        console.log('✅ Clinic data fetched:', clinic)
        setClinicData(clinic)
        AuthStorage.setClinicData(clinic) // Store clinic data in localStorage
        return clinic
      } else {
        console.warn('⚠️ Failed to fetch clinic data:', response.status)
        return null
      }
    } catch (error) {
      console.error('💥 Error fetching clinic data:', error)
      return null
    }
  }

  // Function to fetch full doctor profile (includes phone number)
  const fetchDoctorData = async (doctorId: number, currentUserData?: any) => {
    try {
      console.log('👨‍⚕️ Fetching doctor data for doctor ID:', doctorId)
      const response = await fetch(`${getApiBaseUrl()}/dashboard/doctors/${doctorId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${AuthStorage.getToken()}`,
        },
      })

      if (response.ok) {
        const doctor = await response.json()
        console.log('✅ Doctor data fetched:', doctor)
        console.log('📱 Phone fields in response:', {
          phone: doctor.phone,
          phone_number: doctor.phone_number,
          mobile_phone: doctor.mobile_phone,
          contact_number: doctor.contact_number
        })
        // Merge with existing userData to get complete profile including phone
        const baseData = currentUserData || userData || {}
        const updatedUserData = { ...baseData, ...doctor }
        console.log('👤 Updated user data with phone:', updatedUserData)
        setUserData(updatedUserData)
        AuthStorage.setUserData(updatedUserData) // Update stored user data
        return doctor
      } else {
        console.warn('⚠️ Failed to fetch doctor data:', response.status)
        return null
      }
    } catch (error) {
      console.error('💥 Error fetching doctor data:', error)
      return null
    }
  }

  // Enhanced page navigation function that handles page and optional parameters
  const navigateToPage = (pageOrObject: string | { page: string; params?: any }) => {
    if (typeof pageOrObject === 'string') {
      setCurrentPage(pageOrObject)
      setPageParams(null)
    } else {
      setCurrentPage(pageOrObject.page)
      setPageParams(pageOrObject.params || null)
    }
  }

  // Expose navigation function globally for use in page components
  useEffect(() => {
    window.navigateToPage = navigateToPage
    return () => {
      delete window.navigateToPage
    }
  }, [])

  // Check for stored authentication token on app load
  useEffect(() => {
    const checkStoredAuth = async () => {
      console.log('🔍 Checking stored authentication...')

      // Check for SSO login URL parameters first
      const urlParams = new URLSearchParams(window.location.search)
      const ssoToken = urlParams.get('token')

      if (ssoToken && window.location.pathname === '/sso-login') {
        console.log('🔗 SSO login detected, processing...')
        try {
          const response = await AuthAPI.ssoLogin({ token: ssoToken })
          console.log('💾 Storing SSO auth data...')
          AuthStorage.setToken(response.access_token)
          AuthStorage.setUserType('doctor') // SSO typically returns doctor user
          AuthStorage.setUserData(response.doctor)

          setUserData(response.doctor)

          // Fetch clinic and full doctor data
          if (response.doctor?.clinic_id) {
            await fetchClinicData(response.doctor.clinic_id)
          }
          // Fetch full doctor profile (includes phone number)
          if (response.doctor?.id) {
            await fetchDoctorData(response.doctor.id, response.doctor)
          }

          console.log('✅ SSO login successful, redirecting to appointments')

          // Clear URL parameters and redirect
          window.history.replaceState({}, document.title, '/')
          setIsAuthenticated(true)
          setCurrentPage("appointments") // SSO login is typically for doctors
          setIsLoading(false)
          return
        } catch (error) {
          console.error('💥 SSO login failed:', error)
          // Clear URL parameters and continue with normal flow
          window.history.replaceState({}, document.title, '/')
          setIsLoading(false)
          return
        }
      }

      const token = AuthStorage.getToken()
      const userType = AuthStorage.getUserType()
      const storedUserData = AuthStorage.getUserData()

      console.log('📦 Stored token exists:', !!token)
      console.log('👤 Stored user type:', userType)

      if (token && userType && storedUserData) {
        console.log('🔐 Validating stored token...')
        try {
          // Validate the stored token
          const isValid = await AuthAPI.validateToken(token)
          console.log('✅ Token validation result:', isValid)

          if (isValid) {
            console.log('🎉 Token valid, auto-logging in user')
            setUserData(storedUserData)

            // Fetch clinic data if user has clinic_id
            if (storedUserData?.clinic_id) {
              await fetchClinicData(storedUserData.clinic_id)
            }
            // Fetch full doctor profile (includes phone number) on refresh
            if (userType === 'doctor' && storedUserData?.id) {
              await fetchDoctorData(storedUserData.id, storedUserData)
            }
            // Note: For admin users, we don't fetch clinic/doctor data since they should see app branding

            setIsAuthenticated(true)
            setCurrentPage(userType === 'admin' ? 'dashboard' : 'appointments')
          } else {
            console.log('❌ Token invalid, clearing stored data')
            // Token is invalid, clear stored data
            AuthStorage.clearAll()
            setUserData(null)
            setClinicData(null)
          }
        } catch (error) {
          console.error('💥 Token validation error:', error)
          AuthStorage.clearAll()
          setUserData(null)
          setClinicData(null)
        }
      } else {
        console.log('ℹ️ No stored token or user type found')
        setUserData(null)
        setClinicData(null)
      }

      console.log('🏁 Setting loading to false')
      setIsLoading(false)
    }

    checkStoredAuth()
  }, [])

  const handleLogin = async (type: 'admin' | 'doctor', userData?: any) => {
    console.log('🔑 Login successful, setting up user data...', { type, userData })

    setUserData(userData)

    // Fetch clinic data only for doctors (admins see app branding)
    if (type === 'doctor' && userData?.clinic_id) {
      await fetchClinicData(userData.clinic_id)
    }
    // Fetch full doctor profile (includes phone number)
    if (type === 'doctor' && userData?.id) {
      await fetchDoctorData(userData.id, userData)
    }
    // Note: Admin users will see "EZ MedTech" branding, no clinic/doctor data needed

    setIsAuthenticated(true)
    setCurrentPage(type === 'admin' ? 'dashboard' : 'appointments')
  }

  const handleLogout = () => {
    console.log('🚪 Logging out user, clearing stored data...')
    AuthStorage.clearAll()
    console.log('✅ Auth data cleared')
    setIsAuthenticated(false)
    setUserData(null)
    setClinicData(null)
    setCurrentPage("dashboard")
  }


  const renderContent = () => {
    const LoadingFallback = () => (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="">Loading...</div>
      </div>
    )


    switch (currentPage) {
      case "dashboard":
        return (
          <Suspense fallback={<LoadingFallback />}>
            {isAdmin ? <AdminAnalyticsPage onPageChange={navigateToPage} /> : <DoctorAnalyticsPage onPageChange={navigateToPage} />}
          </Suspense>
        )
      case "patients":
        return (
          <Suspense fallback={<LoadingFallback />}>
            {isAdmin ? <AdminPatientsPage /> : <DoctorPatientsPage />}
          </Suspense>
        )
      case "appointments":
        return (
          <Suspense fallback={<LoadingFallback />}>
            {isAdmin ? <AdminAppointmentPage /> : <DoctorAppointmentPage />}
          </Suspense>
        )
      case "logs":
        return (
          <Suspense fallback={<LoadingFallback />}>
            {isAdmin ? <AdminLogsPage /> : <DoctorLogsPage />}
          </Suspense>
        )
      case "doctors":
        return (
          <Suspense fallback={<LoadingFallback />}>
            {isAdmin ? <AdminDoctorsPage pageParams={pageParams} /> : <DoctorPatientsPage />}
          </Suspense>
        )
      case "front-desk":
        return (
          <Suspense fallback={<LoadingFallback />}>
            <DoctorFrontDeskPage />
          </Suspense>
        )
      case "refill-requests":
        return (
          <Suspense fallback={<LoadingFallback />}>
            <DoctorRefillRequestsPage />
          </Suspense>
        )
      case "settings":
        return (
          <Suspense fallback={<LoadingFallback />}>
            <DoctorSettingsPage />
          </Suspense>
        )
      case "calendar-integrations":
        return (
          <Suspense fallback={<LoadingFallback />}>
            <DoctorCalendarIntegrations />
          </Suspense>
        )
      case "mfa-settings":
        return (
          <Suspense fallback={<LoadingFallback />}>
            {isAdmin ? <AdminMFASettingsPage onPageChange={navigateToPage} /> : <DoctorAppointmentPage />}
          </Suspense>
        )
      default:
        return (
          <Suspense fallback={<LoadingFallback />}>
            {isAdmin ? <AdminAppointmentPage /> : <DoctorAppointmentPage />}
          </Suspense>
        )
    }
  }

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-lg">Loading...</div>
        </div>
      </div>
    )
  }

  // Show login page if not authenticated
  if (!isAuthenticated) {
    return (
      <Suspense fallback={
        <div className="flex items-center justify-center h-screen">
          <div className="">Loading...</div>
        </div>
      }>
        <LoginPage onLogin={handleLogin} />
      </Suspense>
    )
  }

  return (
    <CountsProvider>
      <AppContent
        currentPage={currentPage}
        pageParams={pageParams}
        navigateToPage={navigateToPage}
        handleLogout={handleLogout}
        clinicData={clinicData}
        userData={userData}
        userType={userType}
        renderContent={renderContent}
      />
    </CountsProvider>
  )
}

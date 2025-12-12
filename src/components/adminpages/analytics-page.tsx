import { IconCalendar, IconMedicalCross, IconUsers, IconBone, IconBrain, IconFlask, IconUser, IconHeart, IconHeartbeat, IconArrowRight, IconTrendingUp, IconClock } from "@tabler/icons-react"
import { PieChart, Pie, Cell, Bar, BarChart, XAxis, Tooltip } from "recharts"
import { useState, useEffect } from "react"
import { getErrorMessage } from "@/lib/errors"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
} from "@/components/ui/chart"
import type {
  ChartConfig,
} from "@/components/ui/chart"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AdminAnalyticsAPI } from "@/api/admin"
import { AdminDoctorsAPI } from "@/api/admin"
import type { DashboardStats, AgeDistributionItem, AppointmentTrendItem } from "@/api/doctor/analytics"

// Helper function to get icon by department
const getIconByDepartment = (department: string) => {
  switch (department.toLowerCase()) {
    case 'cardiology':
    case 'cardiologist':
      return <IconHeart className="text-2xl text-indigo-600" />
    case 'general physician':
      return <IconHeartbeat className="text-2xl text-indigo-600" />
    case 'neurology':
      return <IconBrain className="text-2xl text-indigo-600" />
    case 'orthopedic':
      return <IconBone className="text-2xl text-indigo-600" />
    case 'endocrinology':
      return <IconFlask className="text-2xl text-indigo-600" />
    default:
      return <IconUser className="text-2xl text-indigo-600" />
  }
}

const patientChartConfig = {
  value: {
    label: "Patients",
  },
} satisfies ChartConfig

const appointmentChartConfig = {
  scheduled: {
    label: "Scheduled",
    color: "var(--color-chart-1)",
  },
  cancelled: {
    label: "Cancelled",
    color: "var(--destructive)",
  },
} satisfies ChartConfig

interface AnalyticsPageProps {
  onPageChange?: (pageOrObject: string | { page: string; params?: any }) => void
}

// SVG Illustration Components
const DashboardIllustration = () => (
  <svg viewBox="0 0 200 150" className="w-full h-full" fill="none">
    <defs>
      <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#6366f1" stopOpacity="0.2" />
        <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.1" />
      </linearGradient>
    </defs>
    <rect x="20" y="30" width="60" height="80" rx="8" fill="url(#grad1)" stroke="#6366f1" strokeWidth="1.5" />
    <rect x="30" y="45" width="40" height="6" rx="3" fill="#6366f1" opacity="0.6" />
    <rect x="30" y="55" width="30" height="4" rx="2" fill="#6366f1" opacity="0.3" />
    <rect x="30" y="70" width="40" height="25" rx="4" fill="#6366f1" opacity="0.15" />
    <circle cx="140" cy="70" r="40" fill="url(#grad1)" stroke="#8b5cf6" strokeWidth="1.5" />
    <path d="M120 70 L140 50 L160 70 L140 90 Z" fill="#8b5cf6" opacity="0.3" />
    <circle cx="140" cy="70" r="15" fill="#6366f1" opacity="0.4" />
  </svg>
)

export function AnalyticsPage({ onPageChange }: AnalyticsPageProps) {
  const [selectedPieSlice, setSelectedPieSlice] = useState<string | null>(null)
  const [selectedBar, setSelectedBar] = useState<string | null>(null)
  const [chartSize, setChartSize] = useState({ innerRadius: 20, outerRadius: 45 })

  // API state
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [patientAgeData, setPatientAgeData] = useState<AgeDistributionItem[]>([])
  const [appointmentData, setAppointmentData] = useState<AppointmentTrendItem[]>([])
  const [doctorStats, setDoctorStats] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch analytics data from API
  useEffect(() => {
    const fetchAnalyticsData = async () => {
      // Add a delay to allow authentication validation to complete
      await new Promise(resolve => setTimeout(resolve, 500))

      try {
        setLoading(true)
        setError(null)

        // Fetch all data in parallel
        const [statsData, ageDistributionData, trendsData, doctorsData] = await Promise.all([
          AdminAnalyticsAPI.getAllStats(),
          AdminAnalyticsAPI.getAgeDistribution(),
          AdminAnalyticsAPI.getAppointmentTrends(),
          AdminDoctorsAPI.getAllDoctors(),
        ])

        setStats(statsData)
        setPatientAgeData(ageDistributionData)
        setAppointmentData(trendsData)

        // Process doctors data for specializations
        const stats: Record<string, number> = {}
        doctorsData.forEach((doc) => {
          const dept = doc.department?.trim()
          if (dept && dept.toLowerCase() !== 'temp') {
            stats[dept] = (stats[dept] || 0) + 1
          }
        })
        setDoctorStats(stats)

      } catch (err) {
        console.error('Failed to fetch analytics data:', err)
        setError(getErrorMessage(err))
      } finally {
        setLoading(false)
      }
    }

    fetchAnalyticsData()
  }, [])

  // Responsive chart size based on screen size
  useEffect(() => {
    const updateChartSize = () => {
      const width = window.innerWidth
      if (width < 640) {
        // Mobile: small screens
        setChartSize({ innerRadius: 15, outerRadius: 35 })
      } else if (width < 768) {
        // Small tablets
        setChartSize({ innerRadius: 18, outerRadius: 40 })
      } else if (width < 1024) {
        // Tablets
        setChartSize({ innerRadius: 20, outerRadius: 45 })
      } else {
        // Desktop: large screens
        setChartSize({ innerRadius: 25, outerRadius: 55 })
      }
    }

    updateChartSize()
    window.addEventListener('resize', updateChartSize)

    return () => window.removeEventListener('resize', updateChartSize)
  }, [])

  const handlePieClick = (data: any) => {
    if (data && data.name) {
      setSelectedPieSlice(selectedPieSlice === data.name ? null : data.name)
    }
  }

  const handlePatientsClick = () => {
    if (onPageChange) {
      onPageChange("patients")
    }
  }

  const handleAppointmentsClick = () => {
    if (onPageChange) {
      onPageChange("appointments")
    }
  }

  const handleDoctorsClick = () => {
    if (onPageChange) {
      onPageChange("doctors")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-lg text-slate-600">Loading analytics...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="text-center bg-white rounded-2xl p-8 shadow-lg">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <div className="text-red-600 font-semibold mb-2">Error loading analytics</div>
          <div className="text-sm text-slate-500">{error}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Welcome Banner with Illustration */}
      <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 rounded-2xl p-8 text-white">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-1/2 -right-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-1/2 -left-1/4 w-80 h-80 bg-pink-400/20 rounded-full blur-3xl"></div>
        </div>
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Welcome Back, <span className="text-yellow-300">Admin</span> 👋
            </h1>
            <p className="text-white/80 text-lg">
              Here's what's happening with your clinic today
            </p>
          </div>
          <div className="hidden lg:block w-48 h-36 opacity-80">
            <DashboardIllustration />
          </div>
        </div>
      </div>

      {/* Statistics Cards Section */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div
          className="stat-card p-6 hover-lift cursor-pointer"
          onClick={handlePatientsClick}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
              <IconUsers className="w-6 h-6 text-indigo-600" />
            </div>
            <span className="tag tag-primary">
              <IconTrendingUp className="w-3 h-3 mr-1" />
              +12%
            </span>
          </div>
          <div className="text-3xl font-bold text-slate-900 mb-1">
            {stats?.total_patients?.toLocaleString() || 0}
          </div>
          <div className="text-sm text-slate-500">Total Patients</div>
        </div>

        <div
          className="stat-card stat-card-accent p-6 hover-lift cursor-pointer"
          onClick={handleDoctorsClick}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-cyan-100 rounded-xl flex items-center justify-center">
              <IconMedicalCross className="w-6 h-6 text-cyan-600" />
            </div>
            <span className="tag tag-info">Active</span>
          </div>
          <div className="text-3xl font-bold text-slate-900 mb-1">
            {stats?.total_doctors?.toLocaleString() || 0}
          </div>
          <div className="text-sm text-slate-500">Total Doctors</div>
        </div>

        <div
          className="stat-card stat-card-success p-6 hover-lift cursor-pointer"
          onClick={handleAppointmentsClick}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
              <IconCalendar className="w-6 h-6 text-emerald-600" />
            </div>
            <span className="tag tag-success">Completed</span>
          </div>
          <div className="text-3xl font-bold text-slate-900 mb-1">
            {stats?.total_appointments?.toLocaleString() || 0}
          </div>
          <div className="text-sm text-slate-500">Total Appointments</div>
        </div>

        <div className="stat-card stat-card-warm p-6 hover-lift">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
              <IconClock className="w-6 h-6 text-amber-600" />
            </div>
            <span className="tag tag-warning">Upcoming</span>
          </div>
          <div className="text-3xl font-bold text-slate-900 mb-1">
            {stats?.upcoming_appointments?.toLocaleString() || 0}
          </div>
          <div className="text-sm text-slate-500">Upcoming Appointments</div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* Appointment Trends */}
        <Card className="premium-card border-0 shadow-card">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold text-slate-900">Appointment Trends</CardTitle>
                <CardDescription className="text-slate-500">
                  {selectedBar ? (
                    <span>
                      {selectedBar} - Scheduled: {appointmentData.find(d => d.day === selectedBar)?.scheduled || 0}, Cancelled: {appointmentData.find(d => d.day === selectedBar)?.cancelled || 0}
                    </span>
                  ) : (
                    <span>Weekly appointment statistics</span>
                  )}
                </CardDescription>
              </div>
              <span className="tag tag-primary">This Week</span>
            </div>
          </CardHeader>
          <CardContent>
            <ChartContainer config={appointmentChartConfig} className="h-[250px] w-full sm:h-[280px] lg:h-[320px]">
              <BarChart
                accessibilityLayer
                data={appointmentData}
                onMouseLeave={() => setSelectedBar(null)}
              >
                <XAxis
                  dataKey="day"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  tickFormatter={(value) => value.slice(0, 3)}
                  className="text-slate-500"
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="dashed" className="bg-white border border-slate-200 shadow-lg rounded-xl" />}
                />
                <Bar dataKey="scheduled" fill="#6366f1" radius={[6, 6, 0, 0]}>
                  {appointmentData.map((_, index) => (
                    <Cell
                      key={`cell-scheduled-${index}`}
                      fillOpacity={
                        selectedBar === null ? 1 : selectedBar === appointmentData[index].day ? 1 : 0.3
                      }
                      stroke={selectedBar === appointmentData[index].day ? "#6366f1" : ""}
                      onMouseEnter={() => setSelectedBar(appointmentData[index].day)}
                      className="transition-all duration-200"
                    />
                  ))}
                </Bar>
                <Bar dataKey="cancelled" fill="#ef4444" radius={[6, 6, 0, 0]}>
                  {appointmentData.map((_, index) => (
                    <Cell
                      key={`cell-cancelled-${index}`}
                      fillOpacity={
                        selectedBar === null ? 1 : selectedBar === appointmentData[index].day ? 1 : 0.3
                      }
                      stroke={selectedBar === appointmentData[index].day ? "#ef4444" : ""}
                      onMouseEnter={() => setSelectedBar(appointmentData[index].day)}
                      className="transition-all duration-200"
                    />
                  ))}
                </Bar>
                <ChartLegend />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Patients Overview */}
        <Card className="premium-card border-0 shadow-card">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold text-slate-900">Patients Overview</CardTitle>
                <CardDescription className="text-slate-500 flex items-center gap-2">
                  <IconUsers className="w-4 h-4" />
                  Total: {stats?.total_patients?.toLocaleString() || 0} patients
                </CardDescription>
              </div>
              <span className="tag tag-info">Age Distribution</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-row gap-6 items-center">
              <div className="flex-shrink-0 flex justify-center">
                <ChartContainer
                  config={patientChartConfig}
                  className="h-[120px] w-[120px] sm:h-[140px] sm:w-[140px] md:h-[160px] md:w-[160px] lg:h-[180px] lg:w-[180px]"
                >
                  <PieChart>
                    <Pie
                      data={patientAgeData}
                      cx="50%"
                      cy="50%"
                      innerRadius={chartSize.innerRadius}
                      outerRadius={chartSize.outerRadius}
                      paddingAngle={5}
                      dataKey="value"
                      onClick={handlePieClick}
                      style={{ cursor: 'pointer' }}
                    >
                      {patientAgeData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={selectedPieSlice === entry.name ? entry.color : entry.color}
                          opacity={selectedPieSlice === null || selectedPieSlice === entry.name ? 1 : 0.6}
                          stroke={selectedPieSlice === entry.name ? '#1e293b' : 'none'}
                          strokeWidth={selectedPieSlice === entry.name ? 2 : 0}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-white rounded-xl p-3 shadow-lg border border-slate-200">
                              <p className="font-medium text-slate-900">{data.name}</p>
                              <p className="text-sm text-slate-500">{data.value} patients</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                  </PieChart>
                </ChartContainer>
              </div>
              <div className="flex-1 space-y-3">
                {patientAgeData.filter(entry => entry.name !== 'Unknown').map((entry, index) => (
                  <div
                    key={index}
                    className={`flex items-center justify-between text-sm cursor-pointer p-3 rounded-xl transition-all duration-200 ${selectedPieSlice === entry.name 
                      ? 'bg-indigo-50 border border-indigo-200' 
                      : 'bg-slate-50 hover:bg-slate-100 border border-transparent'
                    }`}
                    onClick={() => handlePieClick({ name: entry.name })}
                  >
                    <span className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }}></div>
                      <span className="text-slate-700">{entry.name}</span>
                    </span>
                    <span className="font-semibold text-slate-900">{entry.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

const DottedBackgroundPattern = () => {
  return (
    <pattern
      id="default-multiple-pattern-dots"
      x="0"
      y="0"
      width="10"
      height="10"
      patternUnits="userSpaceOnUse"
    >
      <circle
        className="text-slate-200"
        cx="2"
        cy="2"
        r="1"
        fill="currentColor"
      />
    </pattern>
  );
};

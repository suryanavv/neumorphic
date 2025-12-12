import { IconCalendar, IconMedicalCross, IconUsers, IconLogs, IconTrendingUp, IconActivity } from "@tabler/icons-react"
import { PieChart, Pie, Cell, Bar, BarChart, XAxis, Tooltip } from "recharts"
import { useState, useEffect } from "react"
import { AuthStorage } from "@/api/auth"
import { DoctorAnalyticsAPI, type DashboardStats, type AgeDistributionItem, type AppointmentTrendItem } from "@/api/doctor"
import { getErrorMessage } from "@/lib/errors"

// Helper function to get icon component by name
const getIcon = (iconName: string) => {
  const icons = {
    IconUsers,
    IconMedicalCross,
    IconCalendar,
    IconLogs,
  }
  return icons[iconName as keyof typeof icons] || IconUsers
}

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

// Static dashboard config
const dashboardConfig = {
  sections: {
    appointmentTrends: {
      title: "Appointment Trends",
      description: "Today's Appointments"
    },
    patientsOverview: {
      title: "Patients Overview",
      description: "Total Patients"
    }
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
    color: "#6366f1",
  },
  cancelled: {
    label: "Cancelled",
    color: "#ef4444",
  },
} satisfies ChartConfig

interface AnalyticsPageProps {
  onPageChange?: (page: string) => void
}

// SVG Illustration Component for Doctor Dashboard
const DoctorIllustration = () => (
  <svg viewBox="0 0 200 150" className="w-full h-full" fill="none">
    <defs>
      <linearGradient id="docGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.3" />
        <stop offset="100%" stopColor="#ffffff" stopOpacity="0.1" />
      </linearGradient>
    </defs>
    {/* Stethoscope */}
    <circle cx="100" cy="60" r="25" fill="url(#docGrad)" stroke="white" strokeWidth="2" />
    <path d="M75 60 Q75 100 100 100 Q125 100 125 60" stroke="white" strokeWidth="3" fill="none" />
    <circle cx="75" cy="55" r="8" fill="white" opacity="0.8" />
    <circle cx="125" cy="55" r="8" fill="white" opacity="0.8" />
    {/* Heart monitor line */}
    <path d="M20 120 L50 120 L60 100 L70 130 L80 110 L90 120 L180 120" stroke="white" strokeWidth="2" opacity="0.6" />
    {/* Plus signs */}
    <g opacity="0.4">
      <path d="M30 40 L30 55 M22.5 47.5 L37.5 47.5" stroke="white" strokeWidth="2" />
      <path d="M160 80 L160 95 M152.5 87.5 L167.5 87.5" stroke="white" strokeWidth="2" />
    </g>
  </svg>
)

export function AnalyticsPage({ onPageChange }: AnalyticsPageProps) {
  const [selectedPieSlice, setSelectedPieSlice] = useState<string | null>(null)
  const [selectedBar, setSelectedBar] = useState<string | null>(null)
  const [chartSize, setChartSize] = useState({ innerRadius: 20, outerRadius: 45 })

  // API state
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [logsCount, setLogsCount] = useState<number>(0)
  const [patientAgeData, setPatientAgeData] = useState<AgeDistributionItem[]>([])
  const [appointmentData, setAppointmentData] = useState<AppointmentTrendItem[]>([])
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

        const userData = AuthStorage.getUserData()
        const clinicId = userData?.clinic_id
        const doctorId = userData?.id

        // Fetch all data in parallel
        const [statsData, logsCountData, ageDistributionData, trendsData] = await Promise.all([
          DoctorAnalyticsAPI.getAllStats(clinicId, doctorId),
          DoctorAnalyticsAPI.getLogsCount(clinicId, doctorId),
          DoctorAnalyticsAPI.getAgeDistribution(clinicId, doctorId),
          DoctorAnalyticsAPI.getAppointmentTrends(clinicId, doctorId),
        ])

        setStats(statsData)
        setLogsCount(logsCountData)
        setPatientAgeData(ageDistributionData)
        setAppointmentData(trendsData)
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

  // Get stat card styling based on type
  const getStatCardStyle = (id: string) => {
    switch (id) {
      case 'totalPatients':
        return { bg: 'bg-indigo-100', icon: 'text-indigo-600', card: 'stat-card' }
      case 'totalLogs':
        return { bg: 'bg-purple-100', icon: 'text-purple-600', card: 'stat-card stat-card-accent' }
      case 'totalAppointments':
        return { bg: 'bg-emerald-100', icon: 'text-emerald-600', card: 'stat-card stat-card-success' }
      case 'todaysAppointments':
        return { bg: 'bg-amber-100', icon: 'text-amber-600', card: 'stat-card stat-card-warm' }
      default:
        return { bg: 'bg-slate-100', icon: 'text-slate-600', card: 'stat-card' }
    }
  }

  // Build stats array with API data
  const statsArray = [
    {
      id: "totalPatients",
      label: "Total Patients",
      value: stats?.total_patients ?? 0,
      icon: "IconUsers",
      tag: { text: "+12%", type: "primary" }
    },
    {
      id: "totalLogs",
      label: "Total Logs",
      value: logsCount || 0,
      icon: "IconLogs",
      tag: { text: "Records", type: "info" }
    },
    {
      id: "totalAppointments",
      label: "Total Appointments",
      value: stats?.total_appointments ?? 0,
      icon: "IconCalendar",
      tag: { text: "Completed", type: "success" }
    },
    {
      id: "todaysAppointments",
      label: "Today's Appointments",
      value: stats?.todays_appointments ?? 0,
      icon: "IconMedicalCross",
      tag: { text: "Today", type: "warning" }
    }
  ]

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
    console.warn('Analytics error:', error)
  }

  return (
    <div className="space-y-6 p-6">
      {/* Welcome Banner with Gradient */}
      <div className="relative overflow-hidden bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 rounded-2xl p-8 text-white">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-1/2 -right-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-1/2 -left-1/4 w-80 h-80 bg-blue-400/20 rounded-full blur-3xl"></div>
        </div>
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <IconActivity className="w-5 h-5" />
              <span className="text-sm font-medium text-white/80">Dashboard Overview</span>
            </div>
            <h1 className="text-3xl font-bold mb-2">
              Good to see you! 👋
            </h1>
            <p className="text-white/80 text-lg">
              Track your practice performance and patient insights
            </p>
          </div>
          <div className="hidden lg:block w-48 h-36 opacity-80">
            <DoctorIllustration />
          </div>
        </div>
      </div>

      {/* Statistics Cards Section */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {statsArray.map((stat) => {
          const IconComponent = getIcon(stat.icon)
          const styles = getStatCardStyle(stat.id)
          const handleCardClick = () => {
            if (stat.id === "totalPatients" && onPageChange) {
              onPageChange("patients")
            } else if (stat.id === "totalAppointments" && onPageChange) {
              onPageChange("appointments")
            } else if (stat.id === "totalLogs" && onPageChange) {
              onPageChange("logs")
            }
          }

          const isClickable = stat.id === "totalPatients" || stat.id === "totalAppointments" || stat.id === "totalLogs"

          return (
            <div
              key={stat.id}
              className={`${styles.card} p-6 hover-lift transition-all duration-200 ${isClickable ? "cursor-pointer" : ""}`}
              onClick={isClickable ? handleCardClick : undefined}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${styles.bg} rounded-xl flex items-center justify-center`}>
                  <IconComponent className={`w-6 h-6 ${styles.icon}`} />
                </div>
                <span className={`tag tag-${stat.tag.type}`}>
                  {stat.tag.text}
                </span>
              </div>
              <div className="text-3xl font-bold text-slate-900 mb-1">
                {stat.value.toLocaleString()}
              </div>
              <div className="text-sm text-slate-500">{stat.label}</div>
            </div>
          )
        })}
      </div>

      {/* Appointment Trends and Patients Overview */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[2fr_1fr]">
        {/* Appointment Trends */}
        <Card className="premium-card border-0 shadow-card">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold text-slate-900">
                  {dashboardConfig.sections.appointmentTrends.title}
                </CardTitle>
                <CardDescription className="text-slate-500">
                  {selectedBar ? (
                    <span>
                      {selectedBar} - Scheduled: {appointmentData.find(d => d.day === selectedBar)?.scheduled || 0}, Cancelled: {appointmentData.find(d => d.day === selectedBar)?.cancelled || 0}
                    </span>
                  ) : (
                    <span>{dashboardConfig.sections.appointmentTrends.description}</span>
                  )}
                </CardDescription>
              </div>
              <span className="tag tag-primary">This Week</span>
            </div>
          </CardHeader>
          <CardContent>
            {appointmentData.length === 0 ? (
              <div className="flex items-center justify-center h-[250px] sm:h-[280px] lg:h-[320px]">
                <div className="text-center">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <IconCalendar className="w-8 h-8 text-slate-400" />
                  </div>
                  <p className="text-slate-500">No appointment trends data available</p>
                </div>
              </div>
            ) : (
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
            )}
          </CardContent>
        </Card>

        {/* Patients Overview */}
        <Card className="premium-card border-0 shadow-card">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold text-slate-900">{dashboardConfig.sections.patientsOverview.title}</CardTitle>
                <CardDescription className="text-slate-500 flex items-center gap-2">
                  <IconUsers className="w-4 h-4" />
                  {dashboardConfig.sections.patientsOverview.description}: {stats?.total_patients ?? 0}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {patientAgeData.length === 0 ? (
              <div className="flex items-center justify-center h-[200px]">
                <div className="text-center">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <IconUsers className="w-8 h-8 text-slate-400" />
                  </div>
                  <p className="text-slate-500">No patient age distribution data available</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <div className="flex-shrink-0 mx-auto flex justify-center">
                  <ChartContainer
                    config={patientChartConfig}
                    className="h-[100px] w-[100px] sm:h-[120px] sm:w-[120px] md:h-[140px] md:w-[140px] lg:h-[160px] lg:w-[160px]"
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
                <div className="flex-1 space-y-2">
                  {patientAgeData.map((item, index) => (
                    <div
                      key={index}
                      className={`flex items-center justify-between text-sm cursor-pointer p-3 rounded-xl transition-all duration-200 ${selectedPieSlice === item.name 
                        ? 'bg-indigo-50 border border-indigo-200' 
                        : 'bg-slate-50 hover:bg-slate-100 border border-transparent'
                      }`}
                      onClick={() => handlePieClick({ name: item.name })}
                    >
                      <span className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                        <span className="text-slate-700">{item.name}</span>
                      </span>
                      <span className="font-semibold text-slate-900">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
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

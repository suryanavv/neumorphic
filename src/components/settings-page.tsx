import { useState, useEffect } from "react"
import { IconClock, IconCheck, IconPlus, IconTrash, IconPencil } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import data from "@/data.json"

const { workingHours: initialWorkingHours } = data

// Custom Time Picker Component
function TimePicker({ value, onChange, className }: {
  value: string,
  onChange: (value: string) => void,
  className?: string
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedHour, setSelectedHour] = useState("09")
  const [selectedMinute, setSelectedMinute] = useState("00")
  const [selectedPeriod, setSelectedPeriod] = useState("AM")

  // Parse initial value
  useEffect(() => {
    const timeMatch = value.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i)
    if (timeMatch) {
      let h = parseInt(timeMatch[1])
      const m = timeMatch[2]
      const p = timeMatch[3].toUpperCase()

      // Convert to 12-hour format
      if (h === 0) h = 12
      else if (h > 12) h = h - 12

      setSelectedHour(h.toString().padStart(2, '0'))
      setSelectedMinute(m)
      setSelectedPeriod(p)
    }
  }, [value])

  const handleDone = () => {
    const formattedTime = `${selectedHour}:${selectedMinute} ${selectedPeriod}`
    onChange(formattedTime)
    setIsOpen(false)
  }

  const hours = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'))
  const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'))
  const periods = ["AM", "PM"]

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className={`w-24 sm:w-28 justify-start text-left font-normal text-xs sm:text-sm ${className || ''}`}>
          {value}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 sm:w-52 p-0" align="start">
        <div className="p-3 sm:p-4">
          <div className="flex justify-center gap-4 sm:gap-6 mb-2">
            {/* Hour Section */}
            <div className="flex flex-col items-center">
              <div className="text-xs sm:text-sm font-medium text-muted-foreground mb-2">Hour</div>
              <div className="w-10 sm:w-12 h-24 sm:h-32 overflow-y-auto border border-input rounded-lg bg-background p-1">
                <div className="py-0.5 space-y-0.5">
                  {hours.map((hour) => (
                    <div
                      key={hour}
                      className={`text-center py-1 px-1 cursor-pointer text-xs font-medium transition-colors rounded-md ${
                        selectedHour === hour
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-muted text-foreground'
                      }`}
                      onClick={() => setSelectedHour(hour)}
                    >
                      {hour}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Minute Section */}
            <div className="flex flex-col items-center">
              <div className="text-xs sm:text-sm font-medium text-muted-foreground mb-2">Min</div>
              <div className="w-10 sm:w-12 h-24 sm:h-32 overflow-y-auto border border-input rounded-lg bg-background p-1">
                <div className="py-0.5 space-y-0.5">
                  {minutes.map((minute) => (
                    <div
                      key={minute}
                      className={`text-center py-1 px-1 cursor-pointer text-xs font-medium transition-colors rounded-md ${
                        selectedMinute === minute
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-muted text-foreground'
                      }`}
                      onClick={() => setSelectedMinute(minute)}
                    >
                      {minute}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Period Section */}
            <div className="flex flex-col items-center">
              <div className="text-xs sm:text-sm font-medium text-muted-foreground mb-2">Period</div>
              <div className="flex flex-col gap-0.5">
                {periods.map((period) => (
                  <div
                    key={period}
                    className={`text-center py-1 px-2 sm:py-1.5 sm:px-2.5 cursor-pointer text-xs font-medium rounded-md border transition-colors ${
                      selectedPeriod === period
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-background border-input hover:bg-muted text-foreground'
                    }`}
                    onClick={() => setSelectedPeriod(period)}
                  >
                    {period}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Done Button */}
          <div className="flex justify-center pt-2 sm:pt-3 border-t">
            <Button onClick={handleDone} variant="default" size="sm" className="flex items-center justify-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 text-xs font-medium">
              <IconCheck className="w-3 h-3" />
              Done
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

export function SettingsPage() {
  const [workingHours, setWorkingHours] = useState(initialWorkingHours)
  const [activeSettingsTab, setActiveSettingsTab] = useState<"working-hours" | "off-days" | "public-holidays">("working-hours")

  type OffDay = {
    id: number
    startDate: string // dd-mm-yyyy
    endDate?: string // dd-mm-yyyy
    allDay: boolean
    reason?: string
  }

  const [offDays, setOffDays] = useState<OffDay[]>([
    {
      id: 1,
      startDate: "06-12-2025",
      endDate: "10-12-2025",
      allDay: true,
      reason: "Day off",
    },
    {
      id: 2,
      startDate: "12-12-2025",
      allDay: true,
      reason: "",
    },
    {
      id: 3,
      startDate: "06-12-2025",
      allDay: true,
      reason: "",
    },
  ])

  const [publicHolidays, setPublicHolidays] = useState<OffDay[]>([])

  const [isOffDayDialogOpen, setIsOffDayDialogOpen] = useState(false)
  const [editingOffDay, setEditingOffDay] = useState<OffDay | null>(null)

  const [offDayForm, setOffDayForm] = useState<{
    startDate: string
    endDate: string
    allDay: boolean
    reason: string
  }>({
    startDate: "",
    endDate: "",
    allDay: true,
    reason: "",
  })

  const resetOffDayForm = () => {
    setOffDayForm({
      startDate: "",
      endDate: "",
      allDay: true,
      reason: "",
    })
    setEditingOffDay(null)
  }

  const openCreateOffDayDialog = () => {
    resetOffDayForm()
    setIsOffDayDialogOpen(true)
  }

  const openEditOffDayDialog = (entry: OffDay) => {
    setEditingOffDay(entry)
    setOffDayForm({
      startDate: entry.startDate,
      endDate: entry.endDate ?? "",
      allDay: entry.allDay,
      reason: entry.reason ?? "",
    })
    setIsOffDayDialogOpen(true)
  }

  const handleOffDayFormChange = (field: "startDate" | "endDate" | "reason", value: string) => {
    setOffDayForm((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const toggleAllDay = () => {
    setOffDayForm((prev) => ({
      ...prev,
      allDay: !prev.allDay,
    }))
  }

  const formatOffDayDateRange = (entry: OffDay) => {
    if (entry.endDate && entry.endDate !== entry.startDate) {
      return `${entry.startDate} - ${entry.endDate}`
    }
    return entry.startDate
  }

  const getOffDayTimeRangeLabel = (entry: OffDay) => {
    if (entry.allDay) return "All Day"
    // In future we could support custom time ranges
    return "Custom"
  }

  const handleDeleteOffDay = (id: number) => {
    if (activeSettingsTab === "off-days") {
      setOffDays((prev) => prev.filter((d) => d.id !== id))
    } else {
      setPublicHolidays((prev) => prev.filter((d) => d.id !== id))
    }
  }

  const handleSubmitOffDay = (e: React.FormEvent) => {
    e.preventDefault()
    if (!offDayForm.startDate.trim()) {
      return
    }

    const targetSetter =
      activeSettingsTab === "off-days" ? setOffDays : setPublicHolidays

    if (editingOffDay) {
      targetSetter((prev) =>
        prev.map((entry) =>
          entry.id === editingOffDay.id
            ? {
                ...entry,
                startDate: offDayForm.startDate,
                endDate: offDayForm.endDate || undefined,
                allDay: offDayForm.allDay,
                reason: offDayForm.reason.trim(),
              }
            : entry
        )
      )
    } else {
      targetSetter((prev) => [
        ...prev,
        {
          id: prev.length ? Math.max(...prev.map((p) => p.id)) + 1 : 1,
          startDate: offDayForm.startDate,
          endDate: offDayForm.endDate || undefined,
          allDay: offDayForm.allDay,
          reason: offDayForm.reason.trim(),
        },
      ])
    }

    setIsOffDayDialogOpen(false)
    resetOffDayForm()
  }

  const handleTimeChange = (dayIndex: number, timeType: 'open' | 'close', value: string) => {
    const updatedHours = [...workingHours]
    updatedHours[dayIndex][timeType] = value
    setWorkingHours(updatedHours)
  }

  const handleToggleClosed = (dayIndex: number) => {
    const updatedHours = [...workingHours]
    updatedHours[dayIndex].isClosed = !updatedHours[dayIndex].isClosed
    setWorkingHours(updatedHours)
  }

  const handleSaveWorkingHours = () => {
    // Handle saving working hours logic here
    console.log("Saving working hours:", workingHours)
    console.log("Saving off days:", offDays)
    console.log("Saving public holidays:", publicHolidays)
    // You could make an API call here
  }

  return (
    <div className="px-3 sm:px-4 lg:px-6">
      <div className="space-y-4 sm:space-y-5">

        <Tabs
          value={activeSettingsTab}
          onValueChange={(value) =>
            setActiveSettingsTab(value as "working-hours" | "off-days" | "public-holidays")
          }
        >
          <TabsList>
            <TabsTrigger value="working-hours">Working Hours</TabsTrigger>
            <TabsTrigger value="off-days">Off Days</TabsTrigger>
            <TabsTrigger value="public-holidays">Public Holidays</TabsTrigger>
          </TabsList>

          {/* Working Hours Tab */}
          <TabsContent value="working-hours" className="mt-3 max-w-2xl">
            <div className="space-y-3">
              {workingHours.map((day, index) => (
                <div
                  key={day.day}
                  className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 px-4 py-3 neumorphic-soft rounded-lg neumorphic-hover neumorphic-active transition-all duration-200"
                >
                  <div className="w-full sm:w-20 font-medium text-sm">{day.day}</div>
                  {day.isClosed ? (
                    <div className="flex-1 text-center text-muted-foreground text-sm">Closed</div>
                  ) : (
                    <div className="flex items-center gap-2 flex-1">
                      <TimePicker
                        value={day.open}
                        onChange={(value) => handleTimeChange(index, "open", value)}
                        className="flex-1"
                      />

                      <span className="text-sm text-muted-foreground flex-shrink-0">to</span>

                      <TimePicker
                        value={day.close}
                        onChange={(value) => handleTimeChange(index, "close", value)}
                        className="flex-1"
                      />
                    </div>
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleClosed(index)}
                    className={`w-full sm:w-auto sm:ml-auto neumorphic-soft neumorphic-hover neumorphic-active transition-all duration-200 ${
                      day.isClosed ? "text-green-700" : "text-red-700"
                    }`}
                  >
                    {day.isClosed ? "Open" : "Close"}
                  </Button>
                </div>
              ))}
            </div>

            <div className="mt-4 sm:mt-6 flex justify-center sm:justify-end">
              <Button
                onClick={handleSaveWorkingHours}
                className="w-full sm:w-auto text-primary hover:bg-primary/10 text-sm font-medium neumorphic-soft px-4 py-2 rounded-md neumorphic-hover neumorphic-active transition-all duration-200"
              >
                Save Settings
              </Button>
            </div>
          </TabsContent>

          {/* Off Days Tab */}
          <TabsContent value="off-days" className="mt-1 max-w-2xl">
            <div>
              <div className="flex items-center justify-between gap-3 mb-2 pl-1">
                <span className="text-sm sm:text-base">
                  These days will block all appointments.
                </span>
                <Button
                  size="sm"
                  onClick={openCreateOffDayDialog}
                  className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium neumorphic-soft px-3 py-2 rounded-md neumorphic-hover neumorphic-active transition-all duration-200"
                >
                  <IconPlus className="w-3 h-3" />
                  Add Off Day
                </Button>
              </div>

              <div className="neumorphic-inset rounded-lg p-3 sm:p-4 border-0">
                <div className="max-h-[50vh] overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[200px]">Date(s)</TableHead>
                        <TableHead className="w-[120px]">Time Range</TableHead>
                        <TableHead>Reason</TableHead>
                        <TableHead className="w-[120px] text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {offDays.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={4}
                            className="py-6 text-center text-sm text-muted-foreground"
                          >
                            No off days added yet.
                          </TableCell>
                        </TableRow>
                      ) : (
                        offDays.map((entry) => (
                          <TableRow key={entry.id}>
                            <TableCell className="text-sm font-medium">
                              {formatOffDayDateRange(entry)}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {getOffDayTimeRangeLabel(entry)}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {entry.reason && entry.reason.trim().length > 0
                                ? entry.reason
                                : "No reason provided"}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-7 w-7 neumorphic-soft neumorphic-hover neumorphic-active"
                                  onClick={() => {
                                    setActiveSettingsTab("off-days")
                                    openEditOffDayDialog(entry)
                                  }}
                                >
                                  <IconPencil className="w-3 h-3" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-7 w-7 text-destructive border-destructive/40 neumorphic-soft neumorphic-hover neumorphic-active"
                                  onClick={() => {
                                    setActiveSettingsTab("off-days")
                                    handleDeleteOffDay(entry.id)
                                  }}
                                >
                                  <IconTrash className="w-3 h-3" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Public Holidays Tab */}
          <TabsContent value="public-holidays" className="mt-1 max-w-2xl">
            <div>

              <div className="flex items-center justify-between gap-3 mb-2 pl-1">
                <span className="text-xs sm:text-sm text-muted-foreground">
                  Use this for national and regional holidays.
                </span>
                <Button
                  size="sm"
                  onClick={() => {
                    setActiveSettingsTab("public-holidays")
                    openCreateOffDayDialog()
                  }}
                  className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium neumorphic-soft px-3 py-2 rounded-md neumorphic-hover neumorphic-active transition-all duration-200"
                >
                  <IconPlus className="w-3 h-3" />
                  Add Public Holiday
                </Button>
              </div>

              <div className="neumorphic-inset rounded-lg p-3 sm:p-4 border-0">
                <div className="max-h-[50vh] overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[200px]">Date(s)</TableHead>
                        <TableHead className="w-[120px]">Time Range</TableHead>
                        <TableHead>Reason</TableHead>
                        <TableHead className="w-[120px] text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {publicHolidays.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={4}
                            className="py-6 text-center text-sm text-muted-foreground"
                          >
                            No public holidays added yet.
                          </TableCell>
                        </TableRow>
                      ) : (
                        publicHolidays.map((entry) => (
                          <TableRow key={entry.id}>
                            <TableCell className="text-sm font-medium">
                              {formatOffDayDateRange(entry)}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {getOffDayTimeRangeLabel(entry)}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {entry.reason && entry.reason.trim().length > 0
                                ? entry.reason
                                : "No reason provided"}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-7 w-7 neumorphic-soft neumorphic-hover neumorphic-active"
                                  onClick={() => {
                                    setActiveSettingsTab("public-holidays")
                                    openEditOffDayDialog(entry)
                                  }}
                                >
                                  <IconPencil className="w-3 h-3" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-7 w-7 text-destructive border-destructive/40 neumorphic-soft neumorphic-hover neumorphic-active"
                                  onClick={() => {
                                    setActiveSettingsTab("public-holidays")
                                    handleDeleteOffDay(entry.id)
                                  }}
                                >
                                  <IconTrash className="w-3 h-3" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Add / Edit Off Day Dialog */}
      <Dialog open={isOffDayDialogOpen} onOpenChange={(open) => {
        setIsOffDayDialogOpen(open)
        if (!open) {
          resetOffDayForm()
        }
      }}>
        <DialogContent>
          <form onSubmit={handleSubmitOffDay} className="space-y-4">
            <DialogHeader>
              <DialogTitle>
                {editingOffDay
                  ? `Edit ${activeSettingsTab === "public-holidays" ? "Public Holiday" : "Off Day"}`
                  : `Add ${activeSettingsTab === "public-holidays" ? "Public Holiday" : "Off Day"}`}
              </DialogTitle>
              <DialogDescription>
                {editingOffDay ? (
                  <>
                    Update the details of this{" "}
                    {activeSettingsTab === "public-holidays" ? "public holiday" : "off day"}.
                  </>
                ) : (
                  <>
                    Configure the date range and optional reason. Leave{" "}
                    <span className="font-medium">End Date</span> empty for a single day.
                  </>
                )}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="offday-start-date">
                    Date <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="offday-start-date"
                    placeholder="dd-mm-yyyy"
                    value={offDayForm.startDate}
                    onChange={(e) => handleOffDayFormChange("startDate", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="offday-end-date">
                    End Date{" "}
                    <span className="text-muted-foreground text-xs font-normal">
                      (Optional)
                    </span>
                  </Label>
                  <Input
                    id="offday-end-date"
                    placeholder="dd-mm-yyyy"
                    value={offDayForm.endDate}
                    onChange={(e) => handleOffDayFormChange("endDate", e.target.value)}
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Leave empty for single day off.
                  </p>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>
                  All Day
                </Label>
                <Button
                  type="button"
                  onClick={toggleAllDay}
                  className={`inline-flex items-center justify-center rounded-full px-3 py-1.5 text-xs sm:text-sm font-medium border transition-all duration-200 neumorphic-soft neumorphic-hover neumorphic-active ${
                    offDayForm.allDay
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background text-foreground border-input"
                  }`}
                >
                  {offDayForm.allDay ? "All Day" : "Custom Time (coming soon)"}
                </Button>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="offday-reason">
                  Reason{" "}
                  <span className="text-muted-foreground text-xs font-normal">
                    (Optional)
                  </span>
                </Label>
                <Input
                  id="offday-reason"
                  placeholder={
                    activeSettingsTab === "public-holidays"
                      ? "e.g., New Year, Independence Day"
                      : "e.g., Vacation, Conference, Personal time off"
                  }
                  value={offDayForm.reason}
                  onChange={(e) => handleOffDayFormChange("reason", e.target.value)}
                />
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                className="w-full sm:w-auto neumorphic-soft neumorphic-hover neumorphic-active"
                onClick={() => {
                  setIsOffDayDialogOpen(false)
                  resetOffDayForm()
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="w-full sm:w-auto text-sm font-medium neumorphic-soft neumorphic-hover neumorphic-active"
              >
                {editingOffDay ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

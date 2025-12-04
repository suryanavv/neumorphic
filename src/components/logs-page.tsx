import { useState } from "react"
import { IconPhone, IconCheck, IconRefresh, IconX, IconExclamationCircle, IconStar } from "@tabler/icons-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import data from "@/data.json"

// Sentiment Analysis Component
const SentimentRating = ({ rating }: { rating: number }) => {
  const roundedRating = Math.round(rating) // Round to 1, 2, 3, 4, or 5

  const getSentimentColor = (rating: number) => {
    if (rating >= 4) return "#14B5AA" // Bright teal for good/excellent (4-5 stars)
    if (rating >= 3) return "#005C55" // Dark teal for average (3 stars)
    if (rating >= 1) return "#FF8200" // Orange for poor (1-2 stars)
    return "#6B7280" // Muted gray for no rating
  }

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <IconStar
          key={star}
          className={`w-4 h-4 ${
            star <= roundedRating
              ? "fill-current"
              : "text-muted-foreground/30"
          }`}
          style={{ color: getSentimentColor(roundedRating) }}
        />
      ))}
    </div>
  )
}

const { callLogs, logsConfig } = data

export function LogsPage() {
  const [timeFilter, setTimeFilter] = useState("all-time")

  // Generate random sentiment ratings for demo purposes (whole numbers 1-5)
  const getRandomSentiment = (index: number) => {
    const ratings = [1, 2, 3, 4, 5]
    return ratings[Math.floor((index + Math.random() * 10) % 5)]
  }

  const tableHeaders = [
    { key: 'from', label: 'From' },
    { key: 'startTime', label: 'Start Time' },
    { key: 'duration', label: 'Call Duration' },
    { key: 'sentiment', label: 'Sentiment' },
    { key: 'action', label: 'Actions' }
  ]

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="px-4 lg:px-6">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
          {logsConfig.summaryCards.map((card) => {
            const getCardColor = (key: string) => {
              switch (key) {
                case 'scheduled': return 'text-[var(--chart-2)]'
                case 'rescheduled': return 'text-yellow-600'
                case 'cancelled':
                case 'failed': return 'text-destructive'
                default: return 'text-primary'
              }
            }
            const getIconComponent = (iconName: string) => {
              switch (iconName) {
                case 'IconPhone': return <IconPhone className="size-4" />
                case 'IconCheck': return <IconCheck className="size-4" />
                case 'IconRefresh': return <IconRefresh className="size-4" />
                case 'IconX': return <IconX className="size-4" />
                case 'IconExclamationCircle': return <IconExclamationCircle className="size-4" />
                default: return <IconPhone className="size-4" />
              }
            }

            return (
              <div key={card.key} className="neumorphic-inset p-4 neumorphic-hover transition-all duration-200">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    {getIconComponent(card.icon)}
                    {card.title}
                  </div>
                  <div className={`text-2xl font-bold tabular-nums sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl ${getCardColor(card.key)}`}>
                    {callLogs.summaryStats[card.key as keyof typeof callLogs.summaryStats]}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Call Logs Title */}
      <div className="px-4 lg:px-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight">All Call Logs ({callLogs.logs.length})</h2>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">Filter by:</span>
            <Select value={timeFilter} onValueChange={setTimeFilter}>
              <SelectTrigger className="w-32 neumorphic-pressed">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="neumorphic-pressed flex flex-col gap-2">
                {logsConfig.filters.map((filter) => (
                  <SelectItem
                    key={filter.value}
                    value={filter.value}
                    className="neumorphic-pressed my-1.5"
                  >
                    {filter.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Call Logs Table */}
      <div className="-mt-2 px-4 lg:px-6">
        <div className="neumorphic-inset rounded-lg p-4 border-0">

          {/* Table */}
          <div className="overflow-x-auto max-h-[78vh] overflow-y-auto bg-card rounded-lg">
            <table className="w-full text-sm">
              <thead className="sticky top-0 z-10 bg-card">
                <tr className="border-b-2 border-muted/90 bg-muted/10">
                  {tableHeaders.map((header) => (
                    <th key={header.key} className="text-left font-medium py-3 px-4">
                      {header.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-muted/90">
                {callLogs.logs.map((log, index) => (
                  <tr key={index} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4">
                      <span className="text-sm font-medium">{log.from}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-muted-foreground">{log.startTime}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-muted-foreground">{log.duration}</span>
                    </td>
                    <td className="py-3 px-4">
                      <SentimentRating rating={getRandomSentiment(index)} />
                    </td>
                    <td className="py-3 px-4">
                      <Button
                        onClick={() => {
                          /* Handle action */
                        }}
                        className="w-fit text-xs font-medium neumorphic-pressed text-primary hover:text-primary-foreground rounded-lg shadow-none cursor-pointer transition-all duration-200 px-3 py-2"
                      >
                        View Conversation
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

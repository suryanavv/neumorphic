import { createContext, useContext, useState } from "react"
import type { ReactNode } from "react"

interface CountsContextType {
  frontDeskCount: number | null
  refillRequestsCount: number | null
  doctorsCount: number | null
  setFrontDeskCount: (count: number | null) => void
  setRefillRequestsCount: (count: number | null) => void
  setDoctorsCount: (count: number | null) => void
}

const CountsContext = createContext<CountsContextType | undefined>(undefined)

export function CountsProvider({ children }: { children: ReactNode }) {
  const [frontDeskCount, setFrontDeskCount] = useState<number | null>(null)
  const [refillRequestsCount, setRefillRequestsCount] = useState<number | null>(null)
  const [doctorsCount, setDoctorsCount] = useState<number | null>(null)

  return (
    <CountsContext.Provider
      value={{
        frontDeskCount,
        refillRequestsCount,
        doctorsCount,
        setFrontDeskCount,
        setRefillRequestsCount,
        setDoctorsCount,
      }}
    >
      {children}
    </CountsContext.Provider>
  )
}

export function useCounts() {
  const context = useContext(CountsContext)
  if (context === undefined) {
    throw new Error("useCounts must be used within a CountsProvider")
  }
  return context
}


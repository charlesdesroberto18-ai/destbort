"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import type {
  Task,
  Transaction,
  Goal,
  Medication,
  Appointment,
  Habit,
  Job,
  UserSettings,
  DashboardData,
} from "./types"

interface DataContextType {
  // Tasks
  tasks: Task[]
  addTask: (task: Omit<Task, "id" | "createdAt">) => void
  updateTask: (id: string, updates: Partial<Task>) => void
  deleteTask: (id: string) => void
  toggleTask: (id: string) => void

  // Transactions
  transactions: Transaction[]
  addTransaction: (transaction: Omit<Transaction, "id">) => void
  updateTransaction: (id: string, updates: Partial<Transaction>) => void
  deleteTransaction: (id: string) => void
  togglePaid: (id: string) => void

  // Goals
  goals: Goal[]
  addGoal: (goal: Omit<Goal, "id" | "createdAt" | "status">) => void
  updateGoal: (id: string, updates: Partial<Goal>) => void
  deleteGoal: (id: string) => void
  updateGoalProgress: (id: string, value: number) => void

  // Medications
  medications: Medication[]
  addMedication: (medication: Omit<Medication, "id" | "createdAt" | "takenToday">) => void
  updateMedication: (id: string, updates: Partial<Medication>) => void
  deleteMedication: (id: string) => void
  markMedicationTaken: (id: string, time: string) => void

  // Appointments
  appointments: Appointment[]
  addAppointment: (appointment: Omit<Appointment, "id" | "createdAt">) => void
  updateAppointment: (id: string, updates: Partial<Appointment>) => void
  deleteAppointment: (id: string) => void

  // Habits
  habits: Habit[]
  addHabit: (habit: Omit<Habit, "id" | "createdAt" | "completedDates">) => void
  updateHabit: (id: string, updates: Partial<Habit>) => void
  deleteHabit: (id: string) => void
  toggleHabitDay: (id: string, date: string) => void

  // Jobs (Trabalhos)
  jobs: Job[]
  addJob: (job: Omit<Job, "id" | "createdAt" | "workedDates">) => void
  updateJob: (id: string, updates: Partial<Job>) => void
  deleteJob: (id: string) => void
  toggleWorkDay: (jobId: string, date: string) => void

  // Settings
  settings: UserSettings
  updateSettings: (updates: Partial<UserSettings>) => void

  // Calculated values
  getJobEarnings: (jobId: string) => number
  getTotalJobEarnings: () => number

  // Utils
  isLoading: boolean
}

const DataContext = createContext<DataContextType | undefined>(undefined)

const STORAGE_KEY = "meudash-data"

const defaultSettings: UserSettings = {
  name: "Usuário",
  profileImage: undefined,
  backgroundImage: undefined,
}

const defaultData: DashboardData = {
  tasks: [],
  transactions: [],
  goals: [],
  medications: [],
  appointments: [],
  habits: [],
  jobs: [],
  settings: defaultSettings,
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 9)
}

export function DataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<DashboardData>(defaultData)
  const [isLoading, setIsLoading] = useState(true)

  // Carregar dados do localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setData({
          ...defaultData,
          ...parsed,
          settings: { ...defaultSettings, ...parsed.settings },
        })
      } catch {
        console.error("Erro ao carregar dados")
      }
    }
    setIsLoading(false)
  }, [])

  // Salvar dados no localStorage
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    }
  }, [data, isLoading])

  // Reset medication taken status at midnight
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0]
    setData((prev) => ({
      ...prev,
      medications: prev.medications.map((med) => {
        const lastTaken = med.takenToday[0]?.split("-").slice(0, 3).join("-")
        if (lastTaken && lastTaken !== today) {
          return { ...med, takenToday: [] }
        }
        return med
      }),
    }))
  }, [])

  // Tasks
  const addTask = (task: Omit<Task, "id" | "createdAt">) => {
    setData((prev) => ({
      ...prev,
      tasks: [
        ...prev.tasks,
        { ...task, id: generateId(), createdAt: new Date().toISOString() },
      ],
    }))
  }

  const updateTask = (id: string, updates: Partial<Task>) => {
    setData((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    }))
  }

  const deleteTask = (id: string) => {
    setData((prev) => ({
      ...prev,
      tasks: prev.tasks.filter((t) => t.id !== id),
    }))
  }

  const toggleTask = (id: string) => {
    setData((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) =>
        t.id === id ? { ...t, completed: !t.completed } : t
      ),
    }))
  }

  // Transactions
  const addTransaction = (transaction: Omit<Transaction, "id">) => {
    setData((prev) => ({
      ...prev,
      transactions: [...prev.transactions, { ...transaction, id: generateId() }],
    }))
  }

  const updateTransaction = (id: string, updates: Partial<Transaction>) => {
    setData((prev) => ({
      ...prev,
      transactions: prev.transactions.map((t) =>
        t.id === id ? { ...t, ...updates } : t
      ),
    }))
  }

  const deleteTransaction = (id: string) => {
    setData((prev) => ({
      ...prev,
      transactions: prev.transactions.filter((t) => t.id !== id),
    }))
  }

  const togglePaid = (id: string) => {
    setData((prev) => ({
      ...prev,
      transactions: prev.transactions.map((t) =>
        t.id === id ? { ...t, paid: !t.paid } : t
      ),
    }))
  }

  // Goals
  const addGoal = (goal: Omit<Goal, "id" | "createdAt" | "status">) => {
    setData((prev) => ({
      ...prev,
      goals: [
        ...prev.goals,
        {
          ...goal,
          id: generateId(),
          createdAt: new Date().toISOString(),
          status: "in-progress",
        },
      ],
    }))
  }

  const updateGoal = (id: string, updates: Partial<Goal>) => {
    setData((prev) => ({
      ...prev,
      goals: prev.goals.map((g) => (g.id === id ? { ...g, ...updates } : g)),
    }))
  }

  const deleteGoal = (id: string) => {
    setData((prev) => ({
      ...prev,
      goals: prev.goals.filter((g) => g.id !== id),
    }))
  }

  const updateGoalProgress = (id: string, value: number) => {
    setData((prev) => ({
      ...prev,
      goals: prev.goals.map((g) => {
        if (g.id === id) {
          const newValue = Math.min(value, g.targetValue)
          return {
            ...g,
            currentValue: newValue,
            status: newValue >= g.targetValue ? "completed" : "in-progress",
          }
        }
        return g
      }),
    }))
  }

  // Medications
  const addMedication = (
    medication: Omit<Medication, "id" | "createdAt" | "takenToday">
  ) => {
    setData((prev) => ({
      ...prev,
      medications: [
        ...prev.medications,
        {
          ...medication,
          id: generateId(),
          createdAt: new Date().toISOString(),
          takenToday: [],
        },
      ],
    }))
  }

  const updateMedication = (id: string, updates: Partial<Medication>) => {
    setData((prev) => ({
      ...prev,
      medications: prev.medications.map((m) =>
        m.id === id ? { ...m, ...updates } : m
      ),
    }))
  }

  const deleteMedication = (id: string) => {
    setData((prev) => ({
      ...prev,
      medications: prev.medications.filter((m) => m.id !== id),
    }))
  }

  const markMedicationTaken = (id: string, time: string) => {
    const today = new Date().toISOString().split("T")[0]
    const key = `${today}-${time}`
    setData((prev) => ({
      ...prev,
      medications: prev.medications.map((m) => {
        if (m.id === id) {
          const alreadyTaken = m.takenToday.includes(key)
          return {
            ...m,
            takenToday: alreadyTaken
              ? m.takenToday.filter((t) => t !== key)
              : [...m.takenToday, key],
          }
        }
        return m
      }),
    }))
  }

  // Appointments
  const addAppointment = (appointment: Omit<Appointment, "id" | "createdAt">) => {
    setData((prev) => ({
      ...prev,
      appointments: [
        ...prev.appointments,
        { ...appointment, id: generateId(), createdAt: new Date().toISOString() },
      ],
    }))
  }

  const updateAppointment = (id: string, updates: Partial<Appointment>) => {
    setData((prev) => ({
      ...prev,
      appointments: prev.appointments.map((a) =>
        a.id === id ? { ...a, ...updates } : a
      ),
    }))
  }

  const deleteAppointment = (id: string) => {
    setData((prev) => ({
      ...prev,
      appointments: prev.appointments.filter((a) => a.id !== id),
    }))
  }

  // Habits
  const addHabit = (habit: Omit<Habit, "id" | "createdAt" | "completedDates">) => {
    setData((prev) => ({
      ...prev,
      habits: [
        ...prev.habits,
        {
          ...habit,
          id: generateId(),
          createdAt: new Date().toISOString(),
          completedDates: [],
        },
      ],
    }))
  }

  const updateHabit = (id: string, updates: Partial<Habit>) => {
    setData((prev) => ({
      ...prev,
      habits: prev.habits.map((h) => (h.id === id ? { ...h, ...updates } : h)),
    }))
  }

  const deleteHabit = (id: string) => {
    setData((prev) => ({
      ...prev,
      habits: prev.habits.filter((h) => h.id !== id),
    }))
  }

  const toggleHabitDay = (id: string, date: string) => {
    setData((prev) => ({
      ...prev,
      habits: prev.habits.map((h) => {
        if (h.id === id) {
          const hasDate = h.completedDates.includes(date)
          return {
            ...h,
            completedDates: hasDate
              ? h.completedDates.filter((d) => d !== date)
              : [...h.completedDates, date],
          }
        }
        return h
      }),
    }))
  }

  // Jobs (Trabalhos)
  const addJob = (job: Omit<Job, "id" | "createdAt" | "workedDates">) => {
    setData((prev) => ({
      ...prev,
      jobs: [
        ...prev.jobs,
        {
          ...job,
          id: generateId(),
          createdAt: new Date().toISOString(),
          workedDates: [],
        },
      ],
    }))
  }

  const updateJob = (id: string, updates: Partial<Job>) => {
    setData((prev) => ({
      ...prev,
      jobs: prev.jobs.map((j) => (j.id === id ? { ...j, ...updates } : j)),
    }))
  }

  const deleteJob = (id: string) => {
    setData((prev) => ({
      ...prev,
      jobs: prev.jobs.filter((j) => j.id !== id),
    }))
  }

  const toggleWorkDay = (jobId: string, date: string) => {
    setData((prev) => ({
      ...prev,
      jobs: prev.jobs.map((j) => {
        if (j.id === jobId) {
          const hasDate = j.workedDates.includes(date)
          return {
            ...j,
            workedDates: hasDate
              ? j.workedDates.filter((d) => d !== date)
              : [...j.workedDates, date],
          }
        }
        return j
      }),
    }))
  }

  // Settings
  const updateSettings = (updates: Partial<UserSettings>) => {
    setData((prev) => ({
      ...prev,
      settings: { ...prev.settings, ...updates },
    }))
  }

  // Calculated values
  const getJobEarnings = (jobId: string): number => {
    const job = data.jobs.find((j) => j.id === jobId)
    if (!job) return 0
    return job.workedDates.length * job.dailyRate
  }

  const getTotalJobEarnings = (): number => {
    return data.jobs.reduce((total, job) => {
      return total + job.workedDates.length * job.dailyRate
    }, 0)
  }

  return (
    <DataContext.Provider
      value={{
        tasks: data.tasks,
        addTask,
        updateTask,
        deleteTask,
        toggleTask,
        transactions: data.transactions,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        togglePaid,
        goals: data.goals,
        addGoal,
        updateGoal,
        deleteGoal,
        updateGoalProgress,
        medications: data.medications,
        addMedication,
        updateMedication,
        deleteMedication,
        markMedicationTaken,
        appointments: data.appointments,
        addAppointment,
        updateAppointment,
        deleteAppointment,
        habits: data.habits,
        addHabit,
        updateHabit,
        deleteHabit,
        toggleHabitDay,
        jobs: data.jobs,
        addJob,
        updateJob,
        deleteJob,
        toggleWorkDay,
        settings: data.settings,
        updateSettings,
        getJobEarnings,
        getTotalJobEarnings,
        isLoading,
      }}
    >
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  const context = useContext(DataContext)
  if (!context) {
    throw new Error("useData deve ser usado dentro de um DataProvider")
  }
  return context
}

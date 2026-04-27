"use client"

import { useState, useMemo } from "react"
import { Sidebar } from "@/components/dashboard/sidebar"
import { useData } from "@/lib/data-context"
import { formatCurrency } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Briefcase,
  Plus,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Pencil,
  TrendingUp,
  Calendar,
} from "lucide-react"
import { cn } from "@/lib/utils"

export default function TrabalhoPage() {
  const { jobs, addJob, updateJob, deleteJob, toggleWorkDay, getJobEarnings, getTotalJobEarnings, settings, isLoading } = useData()
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [editingJob, setEditingJob] = useState<string | null>(null)
  const [newJob, setNewJob] = useState({ title: "", dailyRate: "" })
  const [editJob, setEditJob] = useState({ title: "", dailyRate: "" })

  // Calendar state for each job
  const [calendarMonths, setCalendarMonths] = useState<Record<string, Date>>({})

  const getCalendarMonth = (jobId: string) => {
    return calendarMonths[jobId] || new Date()
  }

  const setCalendarMonth = (jobId: string, date: Date) => {
    setCalendarMonths((prev) => ({ ...prev, [jobId]: date }))
  }

  const handleAddJob = () => {
    if (!newJob.title.trim() || !newJob.dailyRate) return
    addJob({
      title: newJob.title.trim(),
      dailyRate: parseFloat(newJob.dailyRate),
    })
    setNewJob({ title: "", dailyRate: "" })
    setIsAddOpen(false)
  }

  const handleEditJob = (jobId: string) => {
    if (!editJob.title.trim() || !editJob.dailyRate) return
    updateJob(jobId, {
      title: editJob.title.trim(),
      dailyRate: parseFloat(editJob.dailyRate),
    })
    setEditingJob(null)
  }

  const startEditing = (job: { id: string; title: string; dailyRate: number }) => {
    setEditJob({ title: job.title, dailyRate: job.dailyRate.toString() })
    setEditingJob(job.id)
  }

  // Get calendar days for a month
  const getCalendarDays = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDay = firstDay.getDay()

    const days: (number | null)[] = []
    for (let i = 0; i < startingDay; i++) {
      days.push(null)
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i)
    }
    return days
  }

  const formatMonth = (date: Date) => {
    return new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" }).format(date)
  }

  const totalEarnings = getTotalJobEarnings()
  const totalDaysWorked = jobs.reduce((sum, job) => sum + job.workedDates.length, 0)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-foreground">Carregando...</div>
      </div>
    )
  }

  return (
    <div 
      className="min-h-screen bg-background"
      style={settings.backgroundImage ? {
        backgroundImage: `url(${settings.backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      } : undefined}
    >
      {settings.backgroundImage && (
        <div className="fixed inset-0 bg-background/85 backdrop-blur-sm" />
      )}
      
      <Sidebar />

      <main className={cn("lg:pl-64", settings.backgroundImage && "relative z-10")}>
        <div className="px-4 py-6 lg:px-8 lg:py-8">
          <div className="mx-auto max-w-6xl space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between pt-12 lg:pt-0">
              <div>
                <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                  <Briefcase className="h-6 w-6 text-primary" />
                  Trabalho Autônomo
                </h1>
                <p className="text-muted-foreground">
                  Gerencie seus trabalhos e ganhos
                </p>
              </div>

              <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Trabalho
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-card border-border">
                  <DialogHeader>
                    <DialogTitle className="text-card-foreground">Novo Trabalho</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label htmlFor="title" className="text-card-foreground">Nome do Trabalho</Label>
                      <Input
                        id="title"
                        placeholder="Ex: Garçom, Freelance Design..."
                        value={newJob.title}
                        onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
                        className="bg-secondary border-border text-card-foreground"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="rate" className="text-card-foreground">Valor da Diária (R$)</Label>
                      <Input
                        id="rate"
                        type="number"
                        placeholder="150.00"
                        value={newJob.dailyRate}
                        onChange={(e) => setNewJob({ ...newJob, dailyRate: e.target.value })}
                        className="bg-secondary border-border text-card-foreground"
                      />
                    </div>
                    <Button
                      onClick={handleAddJob}
                      className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                      disabled={!newJob.title.trim() || !newJob.dailyRate}
                    >
                      Adicionar
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Resumo Geral */}
            <div className="grid gap-4 sm:grid-cols-3">
              <Card className="bg-card border-border">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                    <Briefcase className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Trabalhos</p>
                    <p className="text-xl font-bold text-card-foreground">{jobs.length}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                    <Calendar className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Dias Trabalhados</p>
                    <p className="text-xl font-bold text-card-foreground">{totalDaysWorked}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                    <TrendingUp className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Ganho</p>
                    <p className="text-xl font-bold text-primary">{formatCurrency(totalEarnings)}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Lista de Trabalhos */}
            {jobs.length === 0 ? (
              <Card className="bg-card border-border">
                <CardContent className="py-12 text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                    <Briefcase className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-card-foreground">
                    Nenhum trabalho cadastrado
                  </h3>
                  <p className="text-muted-foreground mt-1">
                    Adicione seus trabalhos para começar a registrar seus ganhos.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {jobs.map((job) => {
                  const calendarMonth = getCalendarMonth(job.id)
                  const days = getCalendarDays(calendarMonth)
                  const earnings = getJobEarnings(job.id)
                  const year = calendarMonth.getFullYear()
                  const month = calendarMonth.getMonth()

                  // Count days worked in current month
                  const daysWorkedThisMonth = job.workedDates.filter((date) => {
                    const d = new Date(date)
                    return d.getFullYear() === year && d.getMonth() === month
                  }).length

                  return (
                    <Card key={job.id} className="bg-card border-border">
                      <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <div className="flex-1">
                          {editingJob === job.id ? (
                            <div className="flex items-center gap-2">
                              <Input
                                value={editJob.title}
                                onChange={(e) => setEditJob({ ...editJob, title: e.target.value })}
                                className="bg-secondary border-border text-card-foreground h-8 w-40"
                              />
                              <Input
                                type="number"
                                value={editJob.dailyRate}
                                onChange={(e) => setEditJob({ ...editJob, dailyRate: e.target.value })}
                                className="bg-secondary border-border text-card-foreground h-8 w-24"
                              />
                              <Button
                                size="sm"
                                onClick={() => handleEditJob(job.id)}
                                className="bg-primary text-primary-foreground h-8"
                              >
                                Salvar
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setEditingJob(null)}
                                className="h-8"
                              >
                                Cancelar
                              </Button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-4">
                              <CardTitle className="text-lg font-semibold text-card-foreground">
                                {job.title}
                              </CardTitle>
                              <span className="text-primary font-semibold">
                                {formatCurrency(job.dailyRate)}/dia
                              </span>
                            </div>
                          )}
                        </div>
                        {editingJob !== job.id && (
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => startEditing(job)}
                              className="h-8 w-8 text-muted-foreground hover:text-foreground"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="bg-card border-border">
                                <AlertDialogHeader>
                                  <AlertDialogTitle className="text-card-foreground">Excluir Trabalho</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Tem certeza que deseja excluir este trabalho? Esta ação não pode ser desfeita.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel className="border-border">Cancelar</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => deleteJob(job.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Excluir
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        )}
                      </CardHeader>
                      <CardContent>
                        {/* Stats */}
                        <div className="flex items-center gap-6 mb-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Dias trabalhados: </span>
                            <span className="font-semibold text-card-foreground">{job.workedDates.length}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Este mês: </span>
                            <span className="font-semibold text-card-foreground">{daysWorkedThisMonth}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Total ganho: </span>
                            <span className="font-semibold text-primary">{formatCurrency(earnings)}</span>
                          </div>
                        </div>

                        {/* Calendar */}
                        <div className="rounded-lg bg-secondary/50 p-4">
                          {/* Month Navigation */}
                          <div className="flex items-center justify-between mb-4">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                const newDate = new Date(calendarMonth)
                                newDate.setMonth(newDate.getMonth() - 1)
                                setCalendarMonth(job.id, newDate)
                              }}
                              className="h-8 w-8"
                            >
                              <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <span className="font-medium text-card-foreground capitalize">
                              {formatMonth(calendarMonth)}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                const newDate = new Date(calendarMonth)
                                newDate.setMonth(newDate.getMonth() + 1)
                                setCalendarMonth(job.id, newDate)
                              }}
                              className="h-8 w-8"
                            >
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </div>

                          {/* Day Headers */}
                          <div className="grid grid-cols-7 gap-1 mb-2">
                            {["D", "S", "T", "Q", "Q", "S", "S"].map((day, i) => (
                              <div
                                key={i}
                                className="h-8 flex items-center justify-center text-xs text-muted-foreground font-medium"
                              >
                                {day}
                              </div>
                            ))}
                          </div>

                          {/* Calendar Days */}
                          <div className="grid grid-cols-7 gap-1">
                            {days.map((day, i) => {
                              if (day === null) {
                                return <div key={i} className="h-10" />
                              }

                              const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
                              const isWorked = job.workedDates.includes(dateStr)
                              const isToday = dateStr === new Date().toISOString().split("T")[0]
                              const isFuture = new Date(dateStr) > new Date()

                              return (
                                <button
                                  key={i}
                                  onClick={() => !isFuture && toggleWorkDay(job.id, dateStr)}
                                  disabled={isFuture}
                                  className={cn(
                                    "h-10 rounded-lg flex flex-col items-center justify-center text-sm transition-all",
                                    isWorked
                                      ? "bg-primary text-primary-foreground font-semibold"
                                      : "hover:bg-muted text-card-foreground",
                                    isToday && !isWorked && "ring-2 ring-primary",
                                    isFuture && "opacity-30 cursor-not-allowed"
                                  )}
                                >
                                  <span>{day}</span>
                                  {isWorked && (
                                    <span className="text-[10px] leading-none">
                                      {formatCurrency(job.dailyRate).replace("R$", "").trim()}
                                    </span>
                                  )}
                                </button>
                              )
                            })}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

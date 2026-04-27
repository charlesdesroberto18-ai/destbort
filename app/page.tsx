"use client"

import { useMemo } from "react"
import { Sidebar } from "@/components/dashboard/sidebar"
import { useData } from "@/lib/data-context"
import { formatCurrency, getDaysUntil, isToday } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  CheckSquare,
  Target,
  Pill,
  AlertCircle,
  Calendar,
  Briefcase,
} from "lucide-react"
import { cn } from "@/lib/utils"

export default function Dashboard() {
  const {
    tasks,
    toggleTask,
    transactions,
    goals,
    medications,
    appointments,
    jobs,
    settings,
    getTotalJobEarnings,
    isLoading,
  } = useData()

  // Calcular saldo (incluindo ganhos de trabalho)
  const balance = useMemo(() => {
    const jobEarnings = getTotalJobEarnings()
    const income = transactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.value, 0) + jobEarnings
    const expense = transactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.value, 0)
    return { income, expense, total: income - expense, jobEarnings }
  }, [transactions, getTotalJobEarnings])

  // Tarefas do dia (pendentes)
  const todayTasks = useMemo(() => {
    const today = new Date().toISOString().split("T")[0]
    return tasks
      .filter((t) => !t.completed && (t.dueDate === today || !t.dueDate))
      .slice(0, 5)
  }, [tasks])

  // Contas a vencer (próximos 7 dias)
  const upcomingBills = useMemo(() => {
    return transactions
      .filter((t) => t.type === "expense" && !t.paid && t.dueDate)
      .filter((t) => {
        const days = getDaysUntil(t.dueDate!)
        return days >= 0 && days <= 7
      })
      .sort((a, b) => getDaysUntil(a.dueDate!) - getDaysUntil(b.dueDate!))
      .slice(0, 4)
  }, [transactions])

  // Metas em progresso
  const activeGoals = useMemo(() => {
    return goals.filter((g) => g.status === "in-progress").slice(0, 3)
  }, [goals])

  // Medicamentos pendentes do dia
  const pendingMedications = useMemo(() => {
    const today = new Date().toISOString().split("T")[0]
    return medications
      .map((med) => ({
        ...med,
        pendingTimes: med.times.filter(
          (time) => !med.takenToday.includes(`${today}-${time}`)
        ),
      }))
      .filter((med) => med.pendingTimes.length > 0)
  }, [medications])

  // Próximas consultas
  const upcomingAppointments = useMemo(() => {
    const today = new Date().toISOString().split("T")[0]
    return appointments
      .filter((a) => a.date >= today)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 3)
  }, [appointments])

  // Alertas
  const alerts = useMemo(() => {
    const alertList: { type: string; message: string; priority: "high" | "medium" | "low" }[] = []

    // Contas vencendo hoje
    const dueTodayBills = transactions.filter(
      (t) => t.type === "expense" && !t.paid && t.dueDate && isToday(t.dueDate)
    )
    if (dueTodayBills.length > 0) {
      alertList.push({
        type: "bill",
        message: `${dueTodayBills.length} conta(s) vencendo hoje`,
        priority: "high",
      })
    }

    // Tarefas de alta prioridade pendentes
    const highPriorityTasks = tasks.filter(
      (t) => t.priority === "high" && !t.completed
    )
    if (highPriorityTasks.length > 0) {
      alertList.push({
        type: "task",
        message: `${highPriorityTasks.length} tarefa(s) de alta prioridade`,
        priority: "high",
      })
    }

    // Medicamentos pendentes
    if (pendingMedications.length > 0) {
      alertList.push({
        type: "med",
        message: `${pendingMedications.length} medicamento(s) pendente(s)`,
        priority: "medium",
      })
    }

    return alertList
  }, [transactions, tasks, pendingMedications])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-foreground">Carregando...</div>
      </div>
    )
  }

  // Check if there's any content to show in each section
  const hasTasks = todayTasks.length > 0
  const hasBills = upcomingBills.length > 0
  const hasGoals = activeGoals.length > 0
  const hasMedications = pendingMedications.length > 0
  const hasAppointments = upcomingAppointments.length > 0
  const hasAlerts = alerts.length > 0
  const hasAnyReminders = hasTasks || hasBills || hasGoals || hasMedications || hasAppointments

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
            <div className="pt-12 lg:pt-0">
              <h1 className="text-2xl font-bold text-foreground">
                Olá, {settings.name.split(" ")[0]}!
              </h1>
              <p className="text-muted-foreground">
                Veja o resumo do seu dia
              </p>
            </div>

            {/* Alertas */}
            {hasAlerts && (
              <div className="space-y-2">
                {alerts.map((alert, i) => (
                  <div
                    key={i}
                    className={cn(
                      "flex items-center gap-3 rounded-lg p-3 text-sm",
                      alert.priority === "high"
                        ? "bg-destructive/10 text-destructive"
                        : "bg-primary/10 text-primary"
                    )}
                  >
                    <AlertCircle className="h-4 w-4" />
                    {alert.message}
                  </div>
                ))}
              </div>
            )}

            {/* Card de Saldo Principal */}
            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <div className="grid gap-6 sm:grid-cols-3">
                  {/* Saldo */}
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
                      <Wallet className="h-7 w-7 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Saldo Total</p>
                      <p className={cn(
                        "text-2xl font-bold",
                        balance.total >= 0 ? "text-primary" : "text-destructive"
                      )}>
                        {formatCurrency(balance.total)}
                      </p>
                    </div>
                  </div>

                  {/* Entradas */}
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
                      <TrendingUp className="h-7 w-7 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Entradas</p>
                      <p className="text-2xl font-bold text-primary">
                        {formatCurrency(balance.income)}
                      </p>
                      {balance.jobEarnings > 0 && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Briefcase className="h-3 w-3" />
                          {formatCurrency(balance.jobEarnings)} de trabalhos
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Saídas */}
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-destructive/10">
                      <TrendingDown className="h-7 w-7 text-destructive" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Saídas</p>
                      <p className="text-2xl font-bold text-destructive">
                        {formatCurrency(balance.expense)}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Mensagem quando não há lembretes */}
            {!hasAnyReminders && (
              <Card className="bg-card border-border">
                <CardContent className="py-12 text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                    <CheckSquare className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-card-foreground">
                    Tudo em dia!
                  </h3>
                  <p className="text-muted-foreground mt-1">
                    Você não tem lembretes pendentes no momento.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Grid de Lembretes - só aparece se tiver conteúdo */}
            {hasAnyReminders && (
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Tarefas do Dia */}
                {hasTasks && (
                  <Card className="bg-card border-border">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="flex items-center gap-2 text-base font-semibold text-card-foreground">
                        <CheckSquare className="h-5 w-5 text-primary" />
                        Tarefas Pendentes
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {todayTasks.map((task) => (
                        <div
                          key={task.id}
                          className="flex items-center gap-3 rounded-lg bg-secondary/50 p-3"
                        >
                          <Checkbox
                            checked={task.completed}
                            onCheckedChange={() => toggleTask(task.id)}
                            className="border-primary data-[state=checked]:bg-primary"
                          />
                          <span className="flex-1 text-sm">{task.title}</span>
                          <span
                            className={cn(
                              "text-xs px-2 py-0.5 rounded",
                              task.priority === "high" && "bg-destructive/20 text-destructive",
                              task.priority === "medium" && "bg-primary/20 text-primary",
                              task.priority === "low" && "bg-muted text-muted-foreground"
                            )}
                          >
                            {task.priority === "high" ? "Alta" : task.priority === "medium" ? "Média" : "Baixa"}
                          </span>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {/* Contas a Vencer */}
                {hasBills && (
                  <Card className="bg-card border-border">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="flex items-center gap-2 text-base font-semibold text-card-foreground">
                        <Wallet className="h-5 w-5 text-destructive" />
                        Próximas Contas
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {upcomingBills.map((bill) => {
                        const days = getDaysUntil(bill.dueDate!)
                        return (
                          <div
                            key={bill.id}
                            className="flex items-center justify-between rounded-lg bg-secondary/50 p-3"
                          >
                            <div>
                              <p className="text-sm font-medium text-card-foreground">
                                {bill.description}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {days === 0 ? "Vence hoje" : `Vence em ${days} dia(s)`}
                              </p>
                            </div>
                            <span className="text-sm font-semibold text-destructive">
                              {formatCurrency(bill.value)}
                            </span>
                          </div>
                        )
                      })}
                    </CardContent>
                  </Card>
                )}

                {/* Metas */}
                {hasGoals && (
                  <Card className="bg-card border-border">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="flex items-center gap-2 text-base font-semibold text-card-foreground">
                        <Target className="h-5 w-5 text-primary" />
                        Metas em Andamento
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {activeGoals.map((goal) => {
                        const progress = (goal.currentValue / goal.targetValue) * 100
                        return (
                          <div key={goal.id} className="space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-card-foreground">
                                {goal.title}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {Math.round(progress)}%
                              </span>
                            </div>
                            <div className="h-2 rounded-full bg-secondary">
                              <div
                                className="h-2 rounded-full bg-primary transition-all"
                                style={{ width: `${Math.min(progress, 100)}%` }}
                              />
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {formatCurrency(goal.currentValue)} de {formatCurrency(goal.targetValue)}
                            </p>
                          </div>
                        )
                      })}
                    </CardContent>
                  </Card>
                )}

                {/* Medicamentos Pendentes */}
                {hasMedications && (
                  <Card className="bg-card border-border">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="flex items-center gap-2 text-base font-semibold text-card-foreground">
                        <Pill className="h-5 w-5 text-primary" />
                        Medicamentos Pendentes
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {pendingMedications.slice(0, 4).map((med) => (
                        <div
                          key={med.id}
                          className="flex items-center justify-between rounded-lg bg-secondary/50 p-3"
                        >
                          <div>
                            <p className="text-sm font-medium text-card-foreground">
                              {med.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {med.dosage}
                            </p>
                          </div>
                          <span className="text-xs bg-destructive/20 text-destructive px-2 py-1 rounded">
                            {med.pendingTimes.join(", ")}
                          </span>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* Consultas */}
            {hasAppointments && (
              <Card className="bg-card border-border">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="flex items-center gap-2 text-base font-semibold text-card-foreground">
                    <Calendar className="h-5 w-5 text-primary" />
                    Próximas Consultas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3 sm:grid-cols-3">
                    {upcomingAppointments.map((apt) => (
                      <div
                        key={apt.id}
                        className="rounded-lg bg-secondary/50 p-3"
                      >
                        <p className="text-sm font-medium text-card-foreground">
                          {apt.title}
                        </p>
                        {apt.doctor && (
                          <p className="text-xs text-muted-foreground">
                            {apt.doctor}
                          </p>
                        )}
                        <p className="text-xs text-primary mt-1">
                          {new Date(apt.date).toLocaleDateString("pt-BR")} às {apt.time}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

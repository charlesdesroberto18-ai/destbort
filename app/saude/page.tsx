"use client"

import { useState, useMemo } from "react"
import { Sidebar } from "@/components/dashboard/sidebar"
import { useData } from "@/lib/data-context"
import { isToday } from "@/lib/types"
import type { Medication, Appointment, Habit } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Plus,
  Pencil,
  Trash2,
  Pill,
  Calendar,
  Activity,
  Clock,
  CheckCircle2,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"

export default function SaudePage() {
  const {
    medications,
    addMedication,
    updateMedication,
    deleteMedication,
    markMedicationTaken,
    appointments,
    addAppointment,
    updateAppointment,
    deleteAppointment,
    habits,
    addHabit,
    updateHabit,
    deleteHabit,
    toggleHabitDay,
    settings,
    isLoading,
  } = useData()

  const [activeTab, setActiveTab] = useState("medicamentos")

  // Medication state
  const [isMedOpen, setIsMedOpen] = useState(false)
  const [editingMed, setEditingMed] = useState<Medication | null>(null)
  const [medName, setMedName] = useState("")
  const [medDosage, setMedDosage] = useState("")
  const [medTimes, setMedTimes] = useState<string[]>(["08:00"])

  // Appointment state
  const [isAptOpen, setIsAptOpen] = useState(false)
  const [editingApt, setEditingApt] = useState<Appointment | null>(null)
  const [aptTitle, setAptTitle] = useState("")
  const [aptDoctor, setAptDoctor] = useState("")
  const [aptDate, setAptDate] = useState("")
  const [aptTime, setAptTime] = useState("")
  const [aptNotes, setAptNotes] = useState("")

  // Habit state
  const [isHabitOpen, setIsHabitOpen] = useState(false)
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null)
  const [habitTitle, setHabitTitle] = useState("")

  const today = new Date().toISOString().split("T")[0]

  // Stats
  const pendingMedications = useMemo(() => {
    return medications.filter((med) => {
      const pendingTimes = med.times.filter(
        (time) => !med.takenToday.includes(`${today}-${time}`)
      )
      return pendingTimes.length > 0
    }).length
  }, [medications, today])

  const upcomingAppointments = useMemo(() => {
    return appointments.filter((apt) => apt.date >= today).length
  }, [appointments, today])

  const todayHabits = useMemo(() => {
    const completed = habits.filter((h) => h.completedDates.includes(today)).length
    return { completed, total: habits.length }
  }, [habits, today])

  // Medication handlers
  const resetMedForm = () => {
    setMedName("")
    setMedDosage("")
    setMedTimes(["08:00"])
    setEditingMed(null)
  }

  const handleMedOpenChange = (open: boolean) => {
    setIsMedOpen(open)
    if (!open) resetMedForm()
  }

  const handleEditMed = (med: Medication) => {
    setEditingMed(med)
    setMedName(med.name)
    setMedDosage(med.dosage)
    setMedTimes(med.times)
    setIsMedOpen(true)
  }

  const handleMedSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!medName.trim() || !medDosage.trim() || medTimes.length === 0) return

    if (editingMed) {
      updateMedication(editingMed.id, {
        name: medName,
        dosage: medDosage,
        times: medTimes,
      })
    } else {
      addMedication({
        name: medName,
        dosage: medDosage,
        times: medTimes,
      })
    }

    handleMedOpenChange(false)
  }

  const addMedTime = () => {
    setMedTimes([...medTimes, "12:00"])
  }

  const removeMedTime = (index: number) => {
    setMedTimes(medTimes.filter((_, i) => i !== index))
  }

  const updateMedTime = (index: number, value: string) => {
    const newTimes = [...medTimes]
    newTimes[index] = value
    setMedTimes(newTimes)
  }

  // Appointment handlers
  const resetAptForm = () => {
    setAptTitle("")
    setAptDoctor("")
    setAptDate("")
    setAptTime("")
    setAptNotes("")
    setEditingApt(null)
  }

  const handleAptOpenChange = (open: boolean) => {
    setIsAptOpen(open)
    if (!open) resetAptForm()
  }

  const handleEditApt = (apt: Appointment) => {
    setEditingApt(apt)
    setAptTitle(apt.title)
    setAptDoctor(apt.doctor || "")
    setAptDate(apt.date)
    setAptTime(apt.time)
    setAptNotes(apt.notes || "")
    setIsAptOpen(true)
  }

  const handleAptSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!aptTitle.trim() || !aptDate || !aptTime) return

    if (editingApt) {
      updateAppointment(editingApt.id, {
        title: aptTitle,
        doctor: aptDoctor || undefined,
        date: aptDate,
        time: aptTime,
        notes: aptNotes || undefined,
      })
    } else {
      addAppointment({
        title: aptTitle,
        doctor: aptDoctor || undefined,
        date: aptDate,
        time: aptTime,
        notes: aptNotes || undefined,
      })
    }

    handleAptOpenChange(false)
  }

  // Habit handlers
  const resetHabitForm = () => {
    setHabitTitle("")
    setEditingHabit(null)
  }

  const handleHabitOpenChange = (open: boolean) => {
    setIsHabitOpen(open)
    if (!open) resetHabitForm()
  }

  const handleEditHabit = (habit: Habit) => {
    setEditingHabit(habit)
    setHabitTitle(habit.title)
    setIsHabitOpen(true)
  }

  const handleHabitSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!habitTitle.trim()) return

    if (editingHabit) {
      updateHabit(editingHabit.id, { title: habitTitle })
    } else {
      addHabit({ title: habitTitle })
    }

    handleHabitOpenChange(false)
  }

  // Get last 7 days for habit tracking
  const last7Days = useMemo(() => {
    const days = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      days.push({
        date: date.toISOString().split("T")[0],
        dayName: date.toLocaleDateString("pt-BR", { weekday: "short" }).slice(0, 3),
        dayNumber: date.getDate(),
        isToday: i === 0,
      })
    }
    return days
  }, [])

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
          <div className="mx-auto max-w-4xl space-y-6">
            {/* Header */}
            <div className="pt-12 lg:pt-0">
              <h1 className="text-2xl font-bold text-foreground">Saúde</h1>
              <p className="text-muted-foreground">
                Medicamentos, consultas e hábitos
              </p>
            </div>

            {/* Stats */}
            <div className="grid gap-4 sm:grid-cols-3">
              <Card className="bg-card border-border">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                    <Pill className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Pendentes</p>
                    <p className="text-2xl font-bold text-foreground">
                      {pendingMedications}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                    <Calendar className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Consultas</p>
                    <p className="text-2xl font-bold text-foreground">
                      {upcomingAppointments}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                    <Activity className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Hábitos Hoje</p>
                    <p className="text-2xl font-bold text-foreground">
                      {todayHabits.completed}/{todayHabits.total}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="bg-secondary w-full justify-start">
                <TabsTrigger
                  value="medicamentos"
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  <Pill className="h-4 w-4 mr-2" />
                  Medicamentos
                </TabsTrigger>
                <TabsTrigger
                  value="consultas"
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Consultas
                </TabsTrigger>
                <TabsTrigger
                  value="habitos"
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  <Activity className="h-4 w-4 mr-2" />
                  Hábitos
                </TabsTrigger>
              </TabsList>

              {/* Medicamentos Tab */}
              <TabsContent value="medicamentos" className="space-y-4">
                <div className="flex justify-end">
                  <Dialog open={isMedOpen} onOpenChange={handleMedOpenChange}>
                    <DialogTrigger asChild>
                      <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                        <Plus className="h-4 w-4 mr-2" />
                        Novo Medicamento
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-card border-border">
                      <DialogHeader>
                        <DialogTitle className="text-card-foreground">
                          {editingMed ? "Editar Medicamento" : "Novo Medicamento"}
                        </DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleMedSubmit} className="space-y-4">
                        <div className="space-y-2">
                          <Label className="text-card-foreground">Nome</Label>
                          <Input
                            value={medName}
                            onChange={(e) => setMedName(e.target.value)}
                            placeholder="Ex: Vitamina D"
                            className="bg-secondary border-border text-foreground"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-card-foreground">Dosagem</Label>
                          <Input
                            value={medDosage}
                            onChange={(e) => setMedDosage(e.target.value)}
                            placeholder="Ex: 1 comprimido"
                            className="bg-secondary border-border text-foreground"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-card-foreground">Horários</Label>
                          <div className="space-y-2">
                            {medTimes.map((time, index) => (
                              <div key={index} className="flex gap-2">
                                <Input
                                  type="time"
                                  value={time}
                                  onChange={(e) => updateMedTime(index, e.target.value)}
                                  className="bg-secondary border-border text-foreground flex-1"
                                />
                                {medTimes.length > 1 && (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeMedTime(index)}
                                    className="text-destructive"
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            ))}
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={addMedTime}
                              className="border-border text-foreground"
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Adicionar Horário
                            </Button>
                          </div>
                        </div>

                        <Button
                          type="submit"
                          className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                        >
                          {editingMed ? "Salvar" : "Adicionar"}
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>

                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-card-foreground">
                      <Pill className="h-5 w-5 text-primary" />
                      Medicamentos de Hoje
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {medications.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">
                        Nenhum medicamento cadastrado
                      </p>
                    ) : (
                      medications.map((med) => (
                        <div
                          key={med.id}
                          className="rounded-lg bg-secondary/50 p-4 space-y-3"
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-medium text-card-foreground">
                                {med.name}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                {med.dosage}
                              </p>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEditMed(med)}
                                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => deleteMedication(med.id)}
                                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {med.times.map((time) => {
                              const key = `${today}-${time}`
                              const isTaken = med.takenToday.includes(key)

                              return (
                                <button
                                  key={time}
                                  onClick={() => markMedicationTaken(med.id, time)}
                                  className={cn(
                                    "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
                                    isTaken
                                      ? "bg-primary/20 text-primary"
                                      : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                                  )}
                                >
                                  <Clock className="h-4 w-4" />
                                  {time}
                                  {isTaken && <CheckCircle2 className="h-4 w-4" />}
                                </button>
                              )
                            })}
                          </div>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Consultas Tab */}
              <TabsContent value="consultas" className="space-y-4">
                <div className="flex justify-end">
                  <Dialog open={isAptOpen} onOpenChange={handleAptOpenChange}>
                    <DialogTrigger asChild>
                      <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                        <Plus className="h-4 w-4 mr-2" />
                        Nova Consulta
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-card border-border">
                      <DialogHeader>
                        <DialogTitle className="text-card-foreground">
                          {editingApt ? "Editar Consulta" : "Nova Consulta"}
                        </DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleAptSubmit} className="space-y-4">
                        <div className="space-y-2">
                          <Label className="text-card-foreground">Título</Label>
                          <Input
                            value={aptTitle}
                            onChange={(e) => setAptTitle(e.target.value)}
                            placeholder="Ex: Consulta de rotina"
                            className="bg-secondary border-border text-foreground"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-card-foreground">
                            Médico (opcional)
                          </Label>
                          <Input
                            value={aptDoctor}
                            onChange={(e) => setAptDoctor(e.target.value)}
                            placeholder="Ex: Dr. João"
                            className="bg-secondary border-border text-foreground"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-card-foreground">Data</Label>
                            <Input
                              type="date"
                              value={aptDate}
                              onChange={(e) => setAptDate(e.target.value)}
                              className="bg-secondary border-border text-foreground"
                              required
                            />
                          </div>

                          <div className="space-y-2">
                            <Label className="text-card-foreground">Horário</Label>
                            <Input
                              type="time"
                              value={aptTime}
                              onChange={(e) => setAptTime(e.target.value)}
                              className="bg-secondary border-border text-foreground"
                              required
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-card-foreground">
                            Observações (opcional)
                          </Label>
                          <Input
                            value={aptNotes}
                            onChange={(e) => setAptNotes(e.target.value)}
                            placeholder="Anotações adicionais"
                            className="bg-secondary border-border text-foreground"
                          />
                        </div>

                        <Button
                          type="submit"
                          className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                        >
                          {editingApt ? "Salvar" : "Adicionar"}
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>

                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-card-foreground">
                      <Calendar className="h-5 w-5 text-primary" />
                      Próximas Consultas
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {appointments.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">
                        Nenhuma consulta cadastrada
                      </p>
                    ) : (
                      appointments
                        .sort((a, b) => a.date.localeCompare(b.date))
                        .map((apt) => {
                          const isPast = apt.date < today

                          return (
                            <div
                              key={apt.id}
                              className={cn(
                                "rounded-lg bg-secondary/50 p-4",
                                isPast && "opacity-60"
                              )}
                            >
                              <div className="flex items-start justify-between">
                                <div>
                                  <h3 className="font-medium text-card-foreground">
                                    {apt.title}
                                  </h3>
                                  {apt.doctor && (
                                    <p className="text-sm text-muted-foreground">
                                      {apt.doctor}
                                    </p>
                                  )}
                                  <p
                                    className={cn(
                                      "text-sm mt-1",
                                      isToday(apt.date)
                                        ? "text-primary"
                                        : "text-muted-foreground"
                                    )}
                                  >
                                    {new Date(apt.date).toLocaleDateString("pt-BR")} às{" "}
                                    {apt.time}
                                  </p>
                                  {apt.notes && (
                                    <p className="text-xs text-muted-foreground mt-1">
                                      {apt.notes}
                                    </p>
                                  )}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleEditApt(apt)}
                                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => deleteAppointment(apt.id)}
                                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          )
                        })
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Hábitos Tab */}
              <TabsContent value="habitos" className="space-y-4">
                <div className="flex justify-end">
                  <Dialog open={isHabitOpen} onOpenChange={handleHabitOpenChange}>
                    <DialogTrigger asChild>
                      <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                        <Plus className="h-4 w-4 mr-2" />
                        Novo Hábito
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-card border-border">
                      <DialogHeader>
                        <DialogTitle className="text-card-foreground">
                          {editingHabit ? "Editar Hábito" : "Novo Hábito"}
                        </DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleHabitSubmit} className="space-y-4">
                        <div className="space-y-2">
                          <Label className="text-card-foreground">Nome do Hábito</Label>
                          <Input
                            value={habitTitle}
                            onChange={(e) => setHabitTitle(e.target.value)}
                            placeholder="Ex: Beber 2L de água"
                            className="bg-secondary border-border text-foreground"
                            required
                          />
                        </div>

                        <Button
                          type="submit"
                          className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                        >
                          {editingHabit ? "Salvar" : "Adicionar"}
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>

                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-card-foreground">
                      <Activity className="h-5 w-5 text-primary" />
                      Acompanhamento de Hábitos
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Days header */}
                    <div className="grid grid-cols-8 gap-2 text-center text-xs text-muted-foreground">
                      <div></div>
                      {last7Days.map((day) => (
                        <div
                          key={day.date}
                          className={cn(day.isToday && "text-primary font-medium")}
                        >
                          <div>{day.dayName}</div>
                          <div>{day.dayNumber}</div>
                        </div>
                      ))}
                    </div>

                    {habits.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">
                        Nenhum hábito cadastrado
                      </p>
                    ) : (
                      habits.map((habit) => (
                        <div
                          key={habit.id}
                          className="grid grid-cols-8 gap-2 items-center"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-card-foreground truncate">
                              {habit.title}
                            </span>
                            <div className="flex items-center gap-0.5">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEditHabit(habit)}
                                className="h-6 w-6 text-muted-foreground hover:text-foreground"
                              >
                                <Pencil className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => deleteHabit(habit.id)}
                                className="h-6 w-6 text-muted-foreground hover:text-destructive"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          {last7Days.map((day) => {
                            const isCompleted = habit.completedDates.includes(day.date)
                            return (
                              <div key={day.date} className="flex justify-center">
                                <Checkbox
                                  checked={isCompleted}
                                  onCheckedChange={() =>
                                    toggleHabitDay(habit.id, day.date)
                                  }
                                  className={cn(
                                    "h-6 w-6 border-2",
                                    isCompleted
                                      ? "border-primary bg-primary data-[state=checked]:bg-primary"
                                      : "border-muted-foreground"
                                  )}
                                />
                              </div>
                            )
                          })}
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  )
}

"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  CheckSquare,
  Wallet,
  Target,
  Heart,
  Calendar,
  Briefcase,
  Settings,
  Menu,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useData } from "@/lib/data-context"

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/" },
  { icon: Briefcase, label: "Trabalho", href: "/trabalho" },
  { icon: CheckSquare, label: "Tarefas", href: "/tarefas" },
  { icon: Wallet, label: "Financeiro", href: "/financeiro" },
  { icon: Target, label: "Metas", href: "/metas" },
  { icon: Heart, label: "Saúde", href: "/saude" },
  { icon: Calendar, label: "Calendário", href: "/calendario" },
  { icon: Settings, label: "Configurações", href: "/configuracoes" },
]

export function Sidebar() {
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const pathname = usePathname()
  const { settings } = useData()

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden text-foreground"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>

      {/* Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen w-64 bg-sidebar border-r border-sidebar-border transition-transform duration-300 ease-in-out lg:translate-x-0",
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col justify-between p-4">
          {/* Logo */}
          <div>
            <div className="mb-8 flex items-center gap-3 px-2 pt-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
                <LayoutDashboard className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-sidebar-foreground">MeuDash</span>
            </div>

            {/* Navigation */}
            <nav className="space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setIsMobileOpen(false)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                )
              })}
            </nav>
          </div>

          {/* User Profile */}
          <Link
            href="/configuracoes"
            onClick={() => setIsMobileOpen(false)}
            className="block"
          >
            <div className="flex items-center gap-3 rounded-lg bg-sidebar-accent/50 p-3 hover:bg-sidebar-accent transition-colors">
              <Avatar className="h-10 w-10 border-2 border-primary/20">
                {settings.profileImage ? (
                  <AvatarImage src={settings.profileImage} alt={settings.name} />
                ) : null}
                <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                  {getInitials(settings.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 overflow-hidden">
                <p className="truncate text-sm font-medium text-sidebar-foreground">
                  {settings.name}
                </p>
                <p className="truncate text-xs text-sidebar-foreground/60">Uso pessoal</p>
              </div>
            </div>
          </Link>
        </div>
      </aside>
    </>
  )
}

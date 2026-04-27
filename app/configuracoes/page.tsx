"use client"

import { useState, useRef } from "react"
import { Sidebar } from "@/components/dashboard/sidebar"
import { useData } from "@/lib/data-context"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Settings,
  User,
  Image as ImageIcon,
  Upload,
  Trash2,
  Check,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"

export default function ConfiguracoesPage() {
  const { settings, updateSettings, isLoading } = useData()
  const [editingName, setEditingName] = useState(false)
  const [newName, setNewName] = useState(settings.name)
  const profileInputRef = useRef<HTMLInputElement>(null)
  const backgroundInputRef = useRef<HTMLInputElement>(null)

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const handleSaveName = () => {
    if (newName.trim()) {
      updateSettings({ name: newName.trim() })
      setEditingName(false)
    }
  }

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        updateSettings({ profileImage: reader.result as string })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleBackgroundImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        updateSettings({ backgroundImage: reader.result as string })
      }
      reader.readAsDataURL(file)
    }
  }

  const removeProfileImage = () => {
    updateSettings({ profileImage: undefined })
  }

  const removeBackgroundImage = () => {
    updateSettings({ backgroundImage: undefined })
  }

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
          <div className="mx-auto max-w-2xl space-y-6">
            {/* Header */}
            <div className="pt-12 lg:pt-0">
              <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <Settings className="h-6 w-6 text-primary" />
                Configurações
              </h1>
              <p className="text-muted-foreground">
                Personalize seu dashboard
              </p>
            </div>

            {/* Perfil */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-card-foreground">
                  <User className="h-5 w-5 text-primary" />
                  Perfil
                </CardTitle>
                <CardDescription>
                  Configure seu nome e foto de perfil
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Foto de Perfil */}
                <div className="flex items-center gap-6">
                  <Avatar className="h-24 w-24 border-4 border-primary/20">
                    {settings.profileImage ? (
                      <AvatarImage src={settings.profileImage} alt={settings.name} />
                    ) : null}
                    <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                      {getInitials(settings.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Foto de Perfil</p>
                    <div className="flex items-center gap-2">
                      <input
                        ref={profileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleProfileImageChange}
                        className="hidden"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => profileInputRef.current?.click()}
                        className="border-border"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        {settings.profileImage ? "Alterar" : "Carregar"}
                      </Button>
                      {settings.profileImage && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={removeProfileImage}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Remover
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Nome */}
                <div className="space-y-2">
                  <Label className="text-card-foreground">Nome</Label>
                  {editingName ? (
                    <div className="flex items-center gap-2">
                      <Input
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        className="bg-secondary border-border text-card-foreground"
                        placeholder="Seu nome"
                        autoFocus
                      />
                      <Button
                        size="icon"
                        onClick={handleSaveName}
                        className="bg-primary text-primary-foreground"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => {
                          setEditingName(false)
                          setNewName(settings.name)
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <div className="flex-1 rounded-lg bg-secondary/50 px-4 py-2 text-card-foreground">
                        {settings.name}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingName(true)}
                        className="border-border"
                      >
                        Editar
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Aparência */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-card-foreground">
                  <ImageIcon className="h-5 w-5 text-primary" />
                  Aparência
                </CardTitle>
                <CardDescription>
                  Personalize o visual do seu dashboard
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Imagem de Fundo */}
                <div className="space-y-3">
                  <Label className="text-card-foreground">Imagem de Fundo</Label>
                  <p className="text-sm text-muted-foreground">
                    Adicione uma imagem personalizada como fundo do dashboard
                  </p>
                  
                  {settings.backgroundImage ? (
                    <div className="space-y-3">
                      <div className="relative rounded-lg overflow-hidden border border-border">
                        <img
                          src={settings.backgroundImage}
                          alt="Fundo do Dashboard"
                          className="w-full h-40 object-cover"
                        />
                        <div className="absolute inset-0 bg-background/70" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <p className="text-sm text-foreground font-medium">
                            Preview do fundo
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          ref={backgroundInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleBackgroundImageChange}
                          className="hidden"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => backgroundInputRef.current?.click()}
                          className="border-border"
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Alterar Imagem
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={removeBackgroundImage}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Remover
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <input
                        ref={backgroundInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleBackgroundImageChange}
                        className="hidden"
                      />
                      <button
                        onClick={() => backgroundInputRef.current?.click()}
                        className="w-full h-40 rounded-lg border-2 border-dashed border-border hover:border-primary/50 transition-colors flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-foreground"
                      >
                        <Upload className="h-8 w-8" />
                        <span className="text-sm font-medium">Clique para carregar uma imagem</span>
                        <span className="text-xs">PNG, JPG ou WEBP</span>
                      </button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Dados */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-card-foreground">Dados</CardTitle>
                <CardDescription>
                  Gerencie seus dados salvos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Todos os seus dados são salvos localmente no seu navegador. Para manter seus dados seguros, recomendamos não limpar o cache do navegador.
                </p>
                <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/10">
                  <Check className="h-5 w-5 text-primary" />
                  <span className="text-sm text-card-foreground">
                    Dados sincronizados localmente
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}

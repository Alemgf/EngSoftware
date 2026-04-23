'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createOrcamentoAdmin } from '../actions'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Loader2, Check, User, Mail, Phone, Briefcase, Calendar, DollarSign } from 'lucide-react'
import { AdminBackButton } from '@/components/ui/AdminBackButton'

export default function NovoOrcamentoAdminPage() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)
    setError(null)

    const name = (formData.get('name') as string)?.trim()
    const email = (formData.get('email') as string)?.trim()

    if (!name || !email) {
      setError('Nome e e-mail são obrigatórios.')
      return
    }

    startTransition(async () => {
      const result = await createOrcamentoAdmin(formData)

      if (!result.success) {
        setError(result.message ?? 'Erro ao salvar orçamento. Tente novamente.')
        return
      }

      router.push('/admin/orcamentos')
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      <div className="container mx-auto px-4 md:px-6 py-8">
        <div className="mb-6 flex items-center gap-2">
          <AdminBackButton href="/admin/orcamentos" label="Voltar para orçamentos" />
        </div>

        <Card className="max-w-3xl mx-auto border-2 shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl md:text-3xl">Novo Orçamento (Admin)</CardTitle>
            <CardDescription>
              Crie manualmente um novo orçamento para registrar um lead ou atendimento direto.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    Nome do cliente *
                  </Label>
                  <Input id="name" name="name" placeholder="Nome completo" required />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    E-mail *
                  </Label>
                  <Input id="email" name="email" type="email" placeholder="cliente@exemplo.com" required />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="phone" className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    Telefone / WhatsApp
                  </Label>
                  <Input id="phone" name="phone" placeholder="(00) 00000-0000" />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="business_area" className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    Área de atuação
                  </Label>
                  <Input id="business_area" name="business_area" placeholder="Clínica, e-commerce, consultoria..." />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="objective">Objetivo do projeto</Label>
                <Textarea
                  id="objective"
                  name="objective"
                  rows={4}
                  placeholder="Descreva brevemente o que o cliente precisa..."
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="deadline" className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    Prazo desejado
                  </Label>
                  <Input id="deadline" name="deadline" type="date" />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="budget" className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    Orçamento estimado
                  </Label>
                  <Input id="budget" name="budget" placeholder="Ex: até R$ 5.000" />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="reference_project">Projeto de referência (opcional)</Label>
                <Input
                  id="reference_project"
                  name="reference_project"
                  placeholder="ID do projeto ou referência interna"
                />
              </div>

              {error && (
                <p className="text-sm text-red-500">
                  {error}
                </p>
              )}

              <Button
                type="submit"
                disabled={isPending}
                className="w-full md:w-auto"
              >
                {isPending ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Salvando orçamento...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Check className="h-4 w-4" />
                    Salvar Orçamento
                  </span>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


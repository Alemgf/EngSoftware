'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Mail,
  Phone,
  Briefcase,
  Calendar,
  DollarSign,
  FileText,
  Paperclip,
  CheckCircle,
  MoreVertical,
  Pencil,
  X,
  Loader2,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from '@/components/ui/use-toast'
import { getOrcamentoById, updateOrcamentoStatus, updateOrcamento } from '../actions'

type OrcamentoStatus =
  | 'novo'
  | 'em_analise'
  | 'proposta_enviada'
  | 'aprovado'
  | 'recusado'
  | 'concluido'

interface Orcamento {
  id: string
  reference_id: string
  name: string
  email: string
  phone: string
  business_area: string
  objective: string
  deadline: string | null
  budget: string | null
  reference_project: string | null
  projetos?: { nome: string } | null
  status: OrcamentoStatus
  created_at: string
  updated_at: string
  files: { name: string; url: string }[] | null
}

const STATUS_ORDER: OrcamentoStatus[] = [
  'novo',
  'em_analise',
  'proposta_enviada',
  'aprovado',
  'recusado',
  'concluido',
]

const STATUS_LABELS: Record<OrcamentoStatus, string> = {
  novo: 'Novo',
  em_analise: 'Em Análise',
  proposta_enviada: 'Proposta Enviada',
  aprovado: 'Aprovado',
  recusado: 'Recusado',
  concluido: 'Concluído',
}

function getProjectName(o: Orcamento): string {
  if (Array.isArray(o.projetos)) return o.projetos[0]?.nome ?? '—'
  return o.projetos?.nome ?? (o.reference_project ? 'Projeto não encontrado' : '—')
}

function formatDate(d: string | null): string {
  if (!d) return '—'
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    weekday: 'short',
  }).format(new Date(d))
}

const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/
function formatDeadlineDisplay(value: string | null): string {
  if (!value) return '—'
  if (ISO_DATE_REGEX.test(value)) {
    try {
      return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }).format(new Date(value))
    } catch {
      return value
    }
  }
  return value
}

function formatDateTime(d: string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(d))
}

export default function DetalheOrcamentoPage() {
  const params = useParams()
  const router = useRouter()
  const id = params?.id as string

  const [orcamento, setOrcamento] = useState<Orcamento | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
    business_area: '',
    objective: '',
    deadline: '',
    budget: '',
    reference_project: '',
  })

  useEffect(() => {
    if (!id) return
    const fetchOne = async () => {
      setIsLoading(true)
      try {
        const res = await getOrcamentoById(id)
        if (res.success && res.data) setOrcamento(res.data as Orcamento)
        else {
          toast({
            title: 'Orçamento não encontrado',
            description: res.message,
            variant: 'destructive',
          })
          router.push('/admin/orcamentos')
        }
      } catch (e) {
        console.error(e)
        toast({ title: 'Erro ao carregar', variant: 'destructive' })
        router.push('/admin/orcamentos')
      } finally {
        setIsLoading(false)
      }
    }
    fetchOne()
  }, [id, router])

  const handleStatusChange = async (newStatus: OrcamentoStatus) => {
    if (!id || !orcamento) return
    setIsUpdatingStatus(true)
    try {
      const res = await updateOrcamentoStatus(id, newStatus)
      if (res.success) {
        setOrcamento((prev) =>
          prev ? { ...prev, status: newStatus, updated_at: new Date().toISOString() } : prev
        )
        toast({ title: 'Status atualizado' })
      } else {
        toast({ title: 'Erro', description: res.message, variant: 'destructive' })
      }
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  const startEditing = () => {
    if (!orcamento) return
    setEditForm({
      name: orcamento.name ?? '',
      email: orcamento.email ?? '',
      phone: orcamento.phone ?? '',
      business_area: orcamento.business_area ?? '',
      objective: orcamento.objective ?? '',
      deadline: orcamento.deadline ?? '',
      budget: orcamento.budget ?? '',
      reference_project: orcamento.reference_project ?? '',
    })
    setIsEditing(true)
  }

  const cancelEditing = () => {
    setIsEditing(false)
  }

  const handleSaveEdit = async () => {
    if (!id || !orcamento) return
    const name = editForm.name.trim()
    const email = editForm.email.trim()
    if (!name || !email) {
      toast({ title: 'Nome e e-mail são obrigatórios', variant: 'destructive' })
      return
    }
    setIsUpdating(true)
    try {
      const payload = {
        name,
        email,
        phone: editForm.phone.trim() || null,
        business_area: editForm.business_area.trim() || null,
        objective: editForm.objective.trim() || null,
        deadline: editForm.deadline.trim() || null,
        budget: editForm.budget.trim() || null,
        reference_project: editForm.reference_project.trim() || null,
      }
      const res = await updateOrcamento(id, payload)
      if (res.success) {
        const refetch = await getOrcamentoById(id)
        if (refetch.success && refetch.data) setOrcamento(refetch.data as Orcamento)
        toast({ title: 'Informações atualizadas' })
        setIsEditing(false)
      } else {
        toast({ title: 'Erro', description: res.message, variant: 'destructive' })
      }
    } finally {
      setIsUpdating(false)
    }
  }

  if (isLoading || !orcamento) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-6">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  const files = Array.isArray(orcamento.files) ? orcamento.files : []

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/orcamentos">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Detalhe do Orçamento</h1>
            <p className="text-muted-foreground">Ref. {orcamento.reference_id}</p>
          </div>
        </div>
        {!isEditing ? (
          <Button variant="outline" size="sm" onClick={startEditing}>
            <Pencil className="mr-2 h-4 w-4" />
            Editar informações
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={cancelEditing} disabled={isUpdating}>
              <X className="mr-2 h-4 w-4" />
              Cancelar
            </Button>
            <Button size="sm" onClick={handleSaveEdit} disabled={isUpdating}>
              {isUpdating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Salvar
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Coluna esquerda: formulário / detalhes (2/3) */}
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Detalhes do orçamento
              </CardTitle>
              <CardDescription>
                {isEditing
                  ? 'Altere os campos e clique em Salvar.'
                  : 'Informações enviadas pelo lead no formulário'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {isEditing ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-objective">Objetivo</Label>
                    <Input
                      id="edit-objective"
                      value={editForm.objective}
                      onChange={(e) => setEditForm((f) => ({ ...f, objective: e.target.value }))}
                      placeholder="Objetivo do projeto"
                      className="font-medium"
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="edit-business_area">Área de atuação</Label>
                      <Input
                        id="edit-business_area"
                        value={editForm.business_area}
                        onChange={(e) => setEditForm((f) => ({ ...f, business_area: e.target.value }))}
                        placeholder="Ex.: Marketing"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-deadline">Prazo desejado</Label>
                      <Input
                        id="edit-deadline"
                        type="date"
                        value={editForm.deadline}
                        onChange={(e) => setEditForm((f) => ({ ...f, deadline: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="edit-budget">Orçamento disponível</Label>
                      <Input
                        id="edit-budget"
                        value={editForm.budget}
                        onChange={(e) => setEditForm((f) => ({ ...f, budget: e.target.value }))}
                        placeholder="Ex.: R$ 5.000"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-reference_project">ID do projeto de referência (UUID)</Label>
                      <Input
                        id="edit-reference_project"
                        value={editForm.reference_project}
                        onChange={(e) => setEditForm((f) => ({ ...f, reference_project: e.target.value }))}
                        placeholder="UUID ou vazio"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Objetivo (resumo)</p>
                    <p className="mt-1 text-lg font-semibold">
                      {orcamento.objective ? orcamento.objective : '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Detalhes da solicitação</p>
                    <div className="mt-2 rounded-lg border bg-muted/30 p-4 text-sm">
                      <dl className="grid gap-3 sm:grid-cols-2">
                        <div>
                          <dt className="font-medium text-muted-foreground">Área de atuação</dt>
                          <dd className="mt-0.5">{orcamento.business_area || '—'}</dd>
                        </div>
                        <div>
                          <dt className="font-medium text-muted-foreground">Prazo desejado</dt>
                          <dd className="mt-0.5">{formatDeadlineDisplay(orcamento.deadline)}</dd>
                        </div>
                        <div>
                          <dt className="font-medium text-muted-foreground">Orçamento disponível</dt>
                          <dd className="mt-0.5">{orcamento.budget || '—'}</dd>
                        </div>
                        <div>
                          <dt className="font-medium text-muted-foreground">Projeto de referência</dt>
                          <dd className="mt-0.5">{getProjectName(orcamento)}</dd>
                        </div>
                      </dl>
                      {orcamento.objective && (
                        <div className="mt-3 border-t pt-3">
                          <dt className="font-medium text-muted-foreground">Objetivo completo</dt>
                          <dd className="mt-1 whitespace-pre-wrap">{orcamento.objective}</dd>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* Anexos (só na visualização; não editável aqui) */}
              {!isEditing && files.length > 0 && (
                <div>
                  <p className="mb-2 flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <Paperclip className="h-4 w-4" />
                    Anexos
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {files.map((f, i) => (
                      <a
                        key={i}
                        href={f.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-lg border bg-muted/50 px-3 py-2 text-sm hover:bg-muted"
                      >
                        <Paperclip className="h-3 w-3" />
                        {f.name}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Timeline de status (img 03) */}
          <Card>
            <CardHeader>
              <CardTitle>Andamento do projeto</CardTitle>
              <CardDescription>
                Status atual e data da última alteração. Altere o status abaixo para atualizar.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Barra horizontal: status acima, data abaixo */}
              <div className="relative">
                <div className="flex items-start justify-between gap-1">
                  {STATUS_ORDER.map((statusKey) => {
                    const isActive = orcamento.status === statusKey
                    const isPast = STATUS_ORDER.indexOf(orcamento.status) > STATUS_ORDER.indexOf(statusKey)
                    return (
                      <div
                        key={statusKey}
                        className="flex flex-1 flex-col items-center text-center"
                      >
                        <span
                          className={`mb-2 text-xs font-medium sm:text-sm ${
                            isActive ? 'text-primary' : isPast ? 'text-muted-foreground' : 'text-muted-foreground'
                          }`}
                        >
                          {STATUS_LABELS[statusKey]}
                        </span>
                        <div
                          className={`relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 ${
                            isActive
                              ? 'border-primary bg-primary'
                              : isPast
                                ? 'border-muted-foreground/50 bg-muted-foreground/30'
                                : 'border-muted bg-background'
                          }`}
                        >
                          {isActive && <span className="h-1.5 w-1.5 rounded-full bg-primary-foreground" />}
                        </div>
                        <span className="mt-2 text-xs text-muted-foreground">
                          {isActive ? formatDateTime(orcamento.updated_at) : '—'}
                        </span>
                      </div>
                    )
                  })}
                </div>
                {/* Linha conectora */}
                <div
                  className="absolute left-0 right-0 top-[2.125rem] h-0.5 -translate-y-1/2 bg-muted"
                  style={{ width: '100%' }}
                  aria-hidden
                />
              </div>

              {/* Select para alterar status */}
              <div className="flex flex-wrap items-center gap-3 border-t pt-4">
                <span className="text-sm font-medium">Alterar status:</span>
                <Select
                  value={orcamento.status}
                  onValueChange={(v) => handleStatusChange(v as OrcamentoStatus)}
                  disabled={isUpdatingStatus}
                >
                  <SelectTrigger className="w-[220px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_ORDER.map((s) => (
                      <SelectItem key={s} value={s}>
                        {STATUS_LABELS[s]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {isUpdatingStatus && (
                  <span className="text-xs text-muted-foreground">Atualizando…</span>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Coluna direita: card perfil + card orçamento (1/3) */}
        <div className="space-y-6">
          {/* Card Perfil do Lead (img 01) */}
          <Card className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {(isEditing ? editForm.name : orcamento.name).slice(0, 2).toUpperCase() || '—'}
                    </AvatarFallback>
                  </Avatar>
                  {isEditing ? (
                    <div className="space-y-2 flex-1">
                      <Label htmlFor="edit-name" className="sr-only">Nome</Label>
                      <Input
                        id="edit-name"
                        value={editForm.name}
                        onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                        placeholder="Nome"
                        className="font-medium"
                      />
                    </div>
                  ) : (
                    <div>
                      <CardTitle className="text-lg">{orcamento.name}</CardTitle>
                      <CardDescription className="flex items-center gap-1 text-xs">
                        <Briefcase className="h-3 w-3" />
                        {orcamento.business_area || '—'}
                      </CardDescription>
                    </div>
                  )}
                </div>
                {!isEditing && (
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {isEditing ? (
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="edit-email">E-mail</Label>
                    <Input
                      id="edit-email"
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))}
                      placeholder="E-mail"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-phone">Telefone</Label>
                    <Input
                      id="edit-phone"
                      value={editForm.phone}
                      onChange={(e) => setEditForm((f) => ({ ...f, phone: e.target.value }))}
                      placeholder="Telefone"
                    />
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <a href={`mailto:${orcamento.email}`} className="hover:underline">
                      {orcamento.email}
                    </a>
                  </div>
                  {orcamento.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{orcamento.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>Enviado em {formatDateTime(orcamento.created_at)}</span>
                  </div>
                </>
              )}
            </CardContent>
            <div className="border-t bg-muted/30 px-6 py-3">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="font-medium">Status atual</span>
                <Badge variant="secondary" className="ml-auto">
                  {STATUS_LABELS[orcamento.status]}
                </Badge>
              </div>
            </div>
          </Card>

          {/* Card Orçamento disponível (img 02) */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <DollarSign className="h-4 w-4" />
                Orçamento disponível
              </CardTitle>
              <CardDescription>Valor informado pelo lead para o projeto</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border bg-muted/30 p-4 text-center">
                <p className="text-2xl font-bold tracking-tight">
                  {isEditing ? (editForm.budget || 'Não informado') : (orcamento.budget || 'Não informado')}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {isEditing ? 'Edite o valor no card "Detalhes do orçamento".' : 'Este valor é uma estimativa indicada na solicitação.'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

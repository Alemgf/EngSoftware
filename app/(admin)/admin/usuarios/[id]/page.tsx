'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, User, Lock, Calendar, Trash, Loader2, Pencil, Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from '@/components/ui/use-toast'
import { getUsuarioById, deleteUsuario, updateUsuarioSituacao, updateUsuario } from '../actions'

function formatDate(d: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(d))
}

export default function UsuarioDetalhePage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const [login, setLogin] = useState<string>('')
  const [ativo, setAtivo] = useState<boolean>(true)
  const [createdAt, setCreatedAt] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editLogin, setEditLogin] = useState('')
  const [editSenha, setEditSenha] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const res = await getUsuarioById(id)
        if (res.success && res.data) {
          setLogin(res.data.login)
          setEditLogin(res.data.login)
          setAtivo(res.data.ativo)
          setCreatedAt(res.data.created_at)
        } else {
          toast({ title: res.message ?? 'Usuário não encontrado', variant: 'destructive' })
          router.push('/admin/usuarios')
        }
      } catch {
        toast({ title: 'Erro ao carregar usuário', variant: 'destructive' })
        router.push('/admin/usuarios')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id, router])

  const handleToggleSituacao = async () => {
    setUpdating(true)
    try {
      const res = await updateUsuarioSituacao(id, !ativo)
      if (res.success) {
        setAtivo(!ativo)
        toast({ title: res.message })
      } else {
        toast({ title: 'Erro', description: res.message, variant: 'destructive' })
      }
    } finally {
      setUpdating(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm(`Excluir o usuário "${login}"? Esta ação não pode ser desfeita.`)) return
    setDeleting(true)
    try {
      const res = await deleteUsuario(id)
      if (res.success) {
        toast({ title: res.message })
        router.push('/admin/usuarios')
      } else {
        toast({ title: 'Erro', description: res.message, variant: 'destructive' })
      }
    } finally {
      setDeleting(false)
    }
  }

  const handleStartEdit = () => {
    setEditLogin(login)
    setEditSenha('')
    setEditing(true)
  }

  const handleCancelEdit = () => {
    setEditLogin(login)
    setEditSenha('')
    setEditing(false)
  }

  const handleSaveEdit = async () => {
    if (!editLogin.trim()) {
      toast({ title: 'Login não pode ser vazio.', variant: 'destructive' })
      return
    }
    setSaving(true)
    try {
      const res = await updateUsuario(id, {
        login: editLogin.trim(),
        senha: editSenha.trim() || undefined,
      })
      if (res.success) {
        setLogin(editLogin.trim())
        setEditSenha('')
        setEditing(false)
        toast({ title: res.message })
      } else {
        toast({ title: 'Erro', description: res.message, variant: 'destructive' })
      }
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      <div className="container mx-auto px-4 md:px-6 py-8">
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/admin/usuarios"
            className="inline-flex items-center text-sm text-primary hover:underline"
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Voltar para usuários
          </Link>
        </div>

        <Card className="max-w-lg mx-auto border-2 shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-xl">Detalhes do usuário</CardTitle>
              <CardDescription>Login, situação e data de criação.</CardDescription>
            </div>
            {!editing ? (
              <Button variant="outline" size="sm" onClick={handleStartEdit}>
                <Pencil className="h-4 w-4 mr-2" />
                Editar
              </Button>
            ) : null}
          </CardHeader>
          <CardContent className="space-y-4">
            {editing ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="edit-login">Login</Label>
                  <Input
                    id="edit-login"
                    value={editLogin}
                    onChange={(e) => setEditLogin(e.target.value)}
                    placeholder="Login"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-senha">Nova senha</Label>
                  <Input
                    id="edit-senha"
                    type="password"
                    value={editSenha}
                    onChange={(e) => setEditSenha(e.target.value)}
                    placeholder="Deixe em branco para não alterar"
                    autoComplete="new-password"
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <Button onClick={handleSaveEdit} disabled={saving}>
                    {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Check className="h-4 w-4 mr-2" />}
                    Salvar
                  </Button>
                  <Button variant="outline" onClick={handleCancelEdit} disabled={saving}>
                    <X className="h-4 w-4 mr-2" />
                    Cancelar
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Login</p>
                    <p className="font-medium">{login}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Lock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Senha</p>
                    <p className="text-muted-foreground text-sm">•••••••• (não exibida)</p>
                  </div>
                </div>
              </>
            )}
            {!editing && (
              <>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">Situação</span>
                  <Badge variant={ativo ? 'default' : 'secondary'}>{ativo ? 'Ativo' : 'Inativo'}</Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={updating}
                    onClick={handleToggleSituacao}
                  >
                    {updating ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      ativo ? 'Desativar' : 'Ativar'
                    )}
                  </Button>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Data de criação</p>
                    <p className="font-medium">{formatDate(createdAt)}</p>
                  </div>
                </div>
              </>
            )}

            <div className="pt-4 border-t flex gap-2">
              <Button
                variant="destructive"
                disabled={deleting}
                onClick={handleDelete}
              >
                {deleting ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Trash className="h-4 w-4 mr-2" />
                )}
                Excluir usuário
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

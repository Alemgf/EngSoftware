'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, Trash, Search, LogOut, UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { toast } from '@/components/ui/use-toast'
import { getUsuarios, deleteUsuario } from './actions'
import { logout } from '@/lib/auth'

interface UsuarioRow {
  id: string
  login: string
  ativo: boolean
  created_at: string
}

function formatDate(d: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(d))
}

export default function UsuariosPage() {
  const router = useRouter()
  const [usuarios, setUsuarios] = useState<UsuarioRow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        const res = await getUsuarios()
        if (res.success) setUsuarios(res.data)
        else
          toast({
            title: 'Erro ao carregar usuários',
            description: res.message,
            variant: 'destructive',
          })
      } catch {
        toast({
          title: 'Erro ao carregar usuários',
          variant: 'destructive',
        })
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  const filtered = usuarios.filter((u) =>
    u.login.toLowerCase().includes(searchTerm.toLowerCase().trim())
  )

  const handleDelete = async (id: string, login: string) => {
    if (!confirm(`Excluir o usuário "${login}"? Esta ação não pode ser desfeita.`)) return
    setDeletingId(id)
    try {
      const res = await deleteUsuario(id)
      if (res.success) {
        setUsuarios((prev) => prev.filter((u) => u.id !== id))
        toast({ title: res.message })
      } else {
        toast({ title: 'Erro', description: res.message, variant: 'destructive' })
      }
    } finally {
      setDeletingId(null)
    }
  }

  const handleLogout = () => {
    logout()
    router.push('/admin/login')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 md:px-6 py-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Usuários</h1>
            <p className="text-muted-foreground text-sm">Gerencie os usuários da área admin.</p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/admin/usuarios/novo">
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Novo Usuário
              </Button>
            </Link>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>

        <div className="rounded-lg border bg-card">
          <div className="p-4 border-b flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por login..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">Carregando...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Login</TableHead>
                  <TableHead>Situação</TableHead>
                  <TableHead>Data de criação</TableHead>
                  <TableHead className="w-[120px] text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                      Nenhum usuário encontrado.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell className="font-medium">{u.login}</TableCell>
                      <TableCell>
                        <Badge variant={u.ativo ? 'default' : 'secondary'}>
                          {u.ativo ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{formatDate(u.created_at)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Link href={`/admin/usuarios/${u.id}`}>
                            <Button variant="ghost" size="icon" title="Ver detalhes">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Excluir"
                            className="text-destructive hover:text-destructive"
                            disabled={deletingId === u.id}
                            onClick={() => handleDelete(u.id, u.login)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </div>
  )
}

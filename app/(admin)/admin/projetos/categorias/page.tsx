'use client'

import { useEffect, useState, useTransition } from 'react'
import { createSupabaseClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Pencil, Trash2, Plus, Loader2 } from 'lucide-react'
import { AdminBackButton } from '@/components/ui/AdminBackButton'
import { toast } from 'sonner'
import { deleteCategoria as deleteCategoriaAction } from './actions'

const supabase = createSupabaseClient()

type Categoria = {
  id: string
  nome: string
}

export default function CategoriasPage() {
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [loading, setLoading] = useState(true)
  const [nomeNova, setNomeNova] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const fetchCategorias = async () => {
    setLoading(true)
    const { data, error } = await supabase.from('categorias').select('id, nome').order('nome')
    if (error) {
      toast.error(`Erro ao carregar categorias: ${error.message}`)
    } else {
      setCategorias((data as Categoria[]) || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchCategorias()
  }, [])

  const criarCategoria = async () => {
    if (!nomeNova.trim()) return
    startTransition(async () => {
      const { error } = await supabase.from('categorias').insert({ nome: nomeNova.trim() })
      if (error) {
        toast.error(`Erro ao criar categoria: ${error.message}`)
      } else {
        setNomeNova('')
        fetchCategorias()
        toast.success('Categoria criada.')
      }
    })
  }

  const renomearCategoria = async (cat: Categoria) => {
    const novoNome = prompt('Novo nome da categoria:', cat.nome)
    if (!novoNome || !novoNome.trim() || novoNome.trim() === cat.nome) return

    startTransition(async () => {
      const { error } = await supabase.from('categorias').update({ nome: novoNome.trim() }).eq('id', cat.id)
      if (error) {
        toast.error(`Erro ao renomear: ${error.message}`)
      } else {
        fetchCategorias()
        toast.success('Categoria atualizada.')
      }
    })
  }

  const excluirCategoria = async (cat: Categoria) => {
    if (!confirm(`Excluir a categoria “${cat.nome}”?`)) return

    setDeletingId(cat.id)
    try {
      const result = await deleteCategoriaAction(cat.id)
      if (result.success) {
        fetchCategorias()
        toast.success('Categoria excluída.')
      } else {
        toast.error(result.message ?? 'Erro ao excluir.')
      }
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 md:px-6 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-1">Categorias de Projetos</h1>
            <p className="text-muted-foreground text-sm">
              Adicione, renomeie ou remova categorias. Ao excluir, a categoria será removida dos projetos que a utilizam.
            </p>
          </div>
          <AdminBackButton href="/admin/projetos" label="Voltar para projetos" />
        </div>

        <Card className="border-2 shadow-lg">
          <CardHeader>
            <CardTitle>Nova categoria</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 md:flex-row md:items-center">
            <Input
              placeholder="Nome da categoria"
              value={nomeNova}
              onChange={e => setNomeNova(e.target.value)}
              className="md:max-w-sm"
            />
            <Button
              onClick={criarCategoria}
              disabled={!nomeNova.trim() || isPending}
              className="gap-2"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Salvando...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" /> Adicionar
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card className="mt-8 border-2 shadow-lg">
          <CardHeader>
            <CardTitle>Lista de categorias</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="py-8 text-center text-muted-foreground">Carregando categorias...</div>
            ) : categorias.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">Nenhuma categoria cadastrada.</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categorias.map(cat => (
                    <TableRow key={cat.id}>
                      <TableCell>{cat.nome}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => renomearCategoria(cat)}
                            title="Renomear"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => excluirCategoria(cat)}
                            title="Excluir"
                            disabled={deletingId === cat.id}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                          >
                            {deletingId === cat.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {(isPending || deletingId) && (
          <div className="fixed bottom-4 right-4 flex items-center gap-2 rounded-lg bg-background border-2 shadow-lg px-4 py-3 z-50">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            <span className="text-sm font-medium">Processando...</span>
          </div>
        )}
      </div>
    </div>
  )
}


// /app/admin/projetos/page.tsx
'use client'

import { useEffect, useState, useTransition } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { createSupabaseClient } from '@/lib/supabase/client'
import { Loader2, Pencil, Trash2, Eye, EyeOff, Plus, FolderKanban, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { motion } from 'framer-motion'
import { toast } from 'sonner'

const supabase = createSupabaseClient()

type Projeto = {
  id: string
  nome: string
  status: 'rascunho' | 'publicado' | 'oculto'
  created_at: string
  thumb_url: string | null
  destaque: boolean
}

export default function ProjetosAdminList() {
  const [projetos, setProjetos] = useState<Projeto[]>([])
  const [loading, setLoading] = useState(true)
  const [isPending, startTransition] = useTransition()

  /** ------------------------------------------------------------------ */
  /* Carrega projetos                                                    */
  /** ------------------------------------------------------------------ */
  const fetchProjetos = async () => {
    setLoading(true)
    const { data: projetosData, error } = await supabase
      .from('projetos')
      .select('id, nome, status, created_at, destaque')
      .order('created_at', { ascending: false })

    if (error) {
      toast.error(`Erro ao carregar: ${error?.message}`)
      setLoading(false)
      return
    }

    const projetos = (projetosData ?? []) as { id: string; nome: string; status: string; created_at: string; destaque?: boolean }[]
    const ids = projetos.map((p) => p.id)

    // Busca direta em projetos_imagens para obter a foto de capa (principal) de cada projeto
    let thumbByProjetoId: Record<string, string> = {}
    if (ids.length > 0) {
      const { data: imgsData } = await supabase
        .from('projetos_imagens')
        .select('projeto_id, url, principal, ordem')
        .in('projeto_id', ids)

      const imgs = (imgsData ?? []) as { projeto_id: string; url: string; principal?: boolean; ordem?: number }[]
      const byProjeto = new Map<string, typeof imgs>()
      for (const img of imgs) {
        const list = byProjeto.get(img.projeto_id) ?? []
        list.push(img)
        byProjeto.set(img.projeto_id, list)
      }
      byProjeto.forEach((list, projetoId) => {
        const sorted = [...list].sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0))
        const capa = sorted.find((i) => i.principal === true) ?? sorted[0]
        if (capa?.url) thumbByProjetoId[projetoId] = capa.url
      })
    }

    const formatted: Projeto[] = projetos.map((p) => ({
      id: p.id,
      nome: p.nome,
      status: p.status as Projeto['status'],
      created_at: p.created_at,
      thumb_url: thumbByProjetoId[p.id] ?? null,
      destaque: p.destaque ?? true,
    }))
    setProjetos(formatted)
    setLoading(false)
  }

  useEffect(() => {
    fetchProjetos()
  }, [])

  /** ------------------------------------------------------------------ */
  /* Toggle status (publicado <-> rascunho)                              */
  /** ------------------------------------------------------------------ */
  const toggleStatus = async (proj: Projeto) => {
    const novoStatus = proj.status === 'publicado' ? 'rascunho' : 'publicado'
    startTransition(async () => {
      const { error } = await supabase
        .from('projetos')
        .update({ status: novoStatus })
        .eq('id', proj.id)

      if (!error) {
        toast.success(`Projeto ${novoStatus === 'publicado' ? 'publicado' : 'ocultado'}.`)
        fetchProjetos()
      } else toast.error(error.message)
    })
  }

  /** ------------------------------------------------------------------ */
  /* Toggle destaque (exibir ou não na seção Portfólio em Destaque)      */
  /** ------------------------------------------------------------------ */
  const toggleDestaque = async (proj: Projeto) => {
    const novoDestaque = !proj.destaque
    startTransition(async () => {
      const { error } = await supabase
        .from('projetos')
        .update({ destaque: novoDestaque })
        .eq('id', proj.id)

      if (!error) {
        toast.success(novoDestaque ? 'Projeto marcado em destaque.' : 'Projeto removido do destaque.')
        fetchProjetos()
      } else toast.error(error.message)
    })
  }

  /** ------------------------------------------------------------------ */
  /* Excluir projeto + imagens                                           */
  /** ------------------------------------------------------------------ */
  const deleteProjeto = async (proj: Projeto) => {
    if (!confirm(`Excluir definitivamente “${proj.nome}”?`)) return

    startTransition(async () => {
      /* 1. Busca imagens (para apagar do Storage) */
      const { data: imgs, error: imgsErr } = await supabase
        .from('projetos_imagens')
        .select('url')
        .eq('projeto_id', proj.id)

      /* 2. Deleta projeto (ON DELETE CASCADE precisa estar configurado) */
      const { error: projErr } = await supabase
        .from('projetos')
        .delete()
        .eq('id', proj.id)

      if (projErr) {
        toast.error(`Erro: ${projErr.message}`)
        return
      }

      /* 3. Remove arquivos do bucket (ignora falhas individuais) */
      if (!imgsErr && imgs?.length) {
        const bucket = supabase.storage.from('projetos')
        await Promise.all(
          imgs.map(async ({ url }: { url: string }) => {
            // url pública → recupera caminho após o domínio
            const path = url.split('/projetos/')[1]
            if (path) await bucket.remove([path])
          })
        )
      }

      toast.success('Projeto excluído.')
      fetchProjetos()
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 md:px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8"
        >
          <div>
            <h1 className="text-4xl md:text-5xl font-bold mb-2">Gerenciar Projetos</h1>
            <p className="text-muted-foreground">Crie, edite e gerencie seus projetos de portfólio</p>
          </div>
          <div className="flex gap-2">
            <Link href="/admin/projetos/categorias">
              <Button variant="outline" size="lg" className="gap-2">
                Categorias
              </Button>
            </Link>
            <Link href="/admin/projetos/novo">
              <Button size="lg" className="gap-2 shadow-lg hover:shadow-xl transition-shadow">
                <Plus className="h-5 w-5" /> Novo Projeto
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
              <p className="text-muted-foreground">Carregando projetos...</p>
            </div>
          </div>
        ) : projetos.length === 0 ? (
          <Card className="border-2 border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <FolderKanban className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">Nenhum projeto cadastrado</h3>
              <p className="text-muted-foreground mb-6 text-center max-w-md">
                Comece criando seu primeiro projeto para exibir no portfólio
              </p>
              <Link href="/admin/projetos/novo">
                <Button size="lg" className="gap-2">
                  <Plus className="h-5 w-5" /> Criar Primeiro Projeto
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projetos.map((proj, index) => (
              <motion.div
                key={proj.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card className="border-2 hover:border-primary/50 transition-all shadow-lg hover:shadow-xl h-full flex flex-col overflow-hidden">
                  {/* Miniatura da foto de capa (como no site) */}
                  <div className="relative h-44 w-full shrink-0 bg-muted">
                    <Image
                      src={
                        proj.thumb_url ??
                        'https://placehold.co/600x320?text=Sem+imagem'
                      }
                      alt={proj.nome}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </div>
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <CardTitle className="text-xl font-bold line-clamp-2">{proj.nome}</CardTitle>
                      <Badge
                        variant={proj.status === 'publicado' ? 'default' : 'secondary'}
                        className="shrink-0 ml-2"
                      >
                        {proj.status === 'publicado' ? 'Publicado' : 'Rascunho'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Criado em {new Date(proj.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col justify-end">
                    <div className="flex items-center gap-2 pt-4 border-t">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleDestaque(proj)}
                        title={proj.destaque ? 'Em destaque (clique para remover)' : 'Não está em destaque (clique para destacar)'}
                        className={proj.destaque ? 'text-amber-500' : 'text-muted-foreground'}
                      >
                        <Star
                          className="h-4 w-4"
                          fill={proj.destaque ? 'currentColor' : 'none'}
                          stroke="currentColor"
                        />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleStatus(proj)}
                        title={proj.status === 'publicado' ? 'Ocultar do site' : 'Publicar no site'}
                        className="flex-1"
                      >
                        {proj.status === 'publicado' ? (
                          <>
                            <EyeOff className="h-4 w-4 mr-2" /> Ocultar
                          </>
                        ) : (
                          <>
                            <Eye className="h-4 w-4 mr-2" /> Publicar
                          </>
                        )}
                      </Button>
                      <Link href={`/admin/projetos/${proj.id}`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full">
                          <Pencil className="h-4 w-4 mr-2" /> Editar
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteProjeto(proj)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* Loading indicator */}
        {isPending && (
          <div className="fixed bottom-4 right-4 flex items-center gap-2 rounded-lg bg-background border-2 shadow-lg px-4 py-3 z-50">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            <span className="text-sm font-medium">Salvando...</span>
          </div>
        )}
      </div>
    </div>
  )
}

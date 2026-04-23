'use client'

import { useEffect, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createSupabaseClient } from '@/lib/supabase/client'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Loader2,
  Check,
  Trash2,
  Star,
  StarOff,
  Plus,
  ImageIcon,
  FileText,
  User,
  Link2,
  Info,
  List,
} from 'lucide-react'
import { toast } from 'sonner'

import { AdminBackButton } from '@/components/ui/AdminBackButton'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { randomUUID } from '@/lib/utils'
import {
  ProjectSchema,
  formatCurrencyBRL,
  parseDestaques,
  serializeDestaques,
  type FormData,
  type Category,
  type Img,
  type DestaquesSection,
} from './projeto-editor-schema'

const supabase = createSupabaseClient()

const FORM_ID = 'form-projeto-editor'

type ProjetoEditorProps =
  | { mode: 'create' }
  | { mode: 'edit'; projectId: string }

export function ProjetoEditor(props: ProjetoEditorProps) {
  const router = useRouter()
  const mode = props.mode
  const projectId = props.mode === 'edit' ? props.projectId : undefined

  const [cats, setCats] = useState<Category[]>([])
  const [imgs, setImgs] = useState<Img[]>([])
  const [loading, setLoading] = useState(mode === 'edit')
  const [saving, startTransition] = useTransition()
  const [uploadingImgs, setUploadingImgs] = useState(false)
  const [destaquesSections, setDestaquesSections] = useState<DestaquesSection[]>([
    { titulo: '', itens: '' },
    { titulo: '', itens: '' },
  ])

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(ProjectSchema),
    defaultValues: {
      categorias: [],
      complexidade: 'basico',
    },
  })

  useEffect(() => {
    ;(async () => {
      const { data: catData } = await supabase
        .from('categorias')
        .select('id,nome')
        .order('nome')
      setCats((catData as Category[]) ?? [])

      if (mode === 'edit' && projectId) {
        const { data: projeto, error } = await supabase
          .from('projetos')
          .select(
            `*,
            projetos_categorias ( categoria_id ),
            projetos_imagens ( id, url, legenda, principal, ordem )`
          )
          .eq('id', projectId)
          .single()

        if (error || !projeto) {
          toast.error('Projeto não encontrado.')
          router.push('/admin/projetos')
          return
        }

        setValue('nome', projeto.nome)
        setValue('descricao', projeto.descricao)
        setValue('sobre', projeto.sobre ?? '')
        setValue('url_demo', projeto.url_demo ?? '')
        setValue('faixa_preco_min', projeto.faixa_preco_min)
        setValue('faixa_preco_max', projeto.faixa_preco_max)
        setValue('complexidade', projeto.complexidade)
        setValue('responsivo', projeto.responsivo)
        setValue('tempo_estimado', projeto.tempo_estimado)
        setValue('cliente_nome', projeto.cliente_nome)
        setValue('caracteristicas', projeto.caracteristicas ?? '')
        setValue('nivel_complexidade_itens', projeto.nivel_complexidade_itens ?? '')
        setValue('informacoes_projeto', projeto.informacoes_projeto ?? '')
        setDestaquesSections(parseDestaques(projeto.destaques))
        setValue(
          'categorias',
          (projeto.projetos_categorias ?? []).map((c: { categoria_id: string }) => c.categoria_id)
        )
        setImgs(
          ((projeto.projetos_imagens ?? []) as Img[]).sort((a, b) => a.ordem - b.ordem)
        )
      }
      setLoading(false)
    })()
  }, [mode, projectId, router, setValue])

  const setPrincipal = async (img: Img) => {
    if (mode !== 'edit' || !projectId) return
    const { error } = await supabase
      .from('projetos_imagens')
      .update({ principal: false })
      .eq('projeto_id', projectId)
    if (!error) {
      await supabase.from('projetos_imagens').update({ principal: true }).eq('id', img.id)
      setImgs((curr) =>
        curr.map((i) => ({ ...i, principal: i.id === img.id }))
      )
    }
  }

  const removeImg = async (img: Img) => {
    if (!confirm('Remover imagem?')) return
    if (mode === 'edit') {
      await supabase.from('projetos_imagens').delete().eq('id', img.id)
    }
    setImgs((curr) => curr.filter((i) => i.id !== img.id))
  }

  const onSubmit = async (data: FormData) => {
    startTransition(async () => {
      const destaquesStr = serializeDestaques(destaquesSections) || null

      if (mode === 'create') {
        const { data: projData, error: projErr } = await supabase
          .from('projetos')
          .insert({
            nome: data.nome,
            descricao: data.descricao,
            sobre: data.sobre || null,
            url_demo: data.url_demo?.trim() || null,
            faixa_preco_min: data.faixa_preco_min,
            faixa_preco_max: data.faixa_preco_max,
            complexidade: data.complexidade,
            responsivo: data.responsivo,
            tempo_estimado: data.tempo_estimado,
            cliente_nome: data.cliente_nome,
            caracteristicas: data.caracteristicas?.trim() || null,
            destaques: destaquesStr,
            nivel_complexidade_itens: data.nivel_complexidade_itens?.trim() || null,
            informacoes_projeto: data.informacoes_projeto?.trim() || null,
            status: 'rascunho',
          })
          .select('id')
          .single()

        if (projErr || !projData) {
          toast.error(projErr?.message ?? 'Erro ao salvar projeto.')
          return
        }
        const newId = projData.id as string

        if (data.categorias.length) {
          const { error: catErr } = await supabase.from('projetos_categorias').insert(
            data.categorias.map((cid) => ({ projeto_id: newId, categoria_id: cid }))
          )
          if (catErr) {
            toast.error(`Erro ao salvar categorias: ${catErr.message}`)
            return
          }
        }

        if (data.imagens?.length) {
          setUploadingImgs(true)
          const bucket = supabase.storage.from('projetos')
          const uploadErrors: string[] = []
          for (let idx = 0; idx < data.imagens.length; idx++) {
            const file = data.imagens[idx]
            const path = `${newId}/${randomUUID()}-${file.name}`
            const { error: upErr } = await bucket.upload(path, file, { cacheControl: '3600', upsert: false })
            if (upErr) uploadErrors.push(`${file.name}: ${upErr.message}`)
            else {
              const { data: urlData } = bucket.getPublicUrl(path)
              const { error: insErr } = await supabase.from('projetos_imagens').insert({
                projeto_id: newId,
                url: urlData.publicUrl,
                ordem: idx,
                principal: idx === 0,
              })
              if (insErr) uploadErrors.push(`${file.name}: ${insErr.message}`)
            }
          }
          setUploadingImgs(false)
          if (uploadErrors.length > 0) {
            toast.error(`Erro em ${uploadErrors.length} imagem(ns): ${uploadErrors.slice(0, 2).join('; ')}`)
            return
          }
        }
        toast.success('Projeto criado com sucesso.')
        router.push('/admin/projetos')
        return
      }

      if (mode === 'edit' && projectId) {
        const { error: projErr } = await supabase
          .from('projetos')
          .update({
            nome: data.nome,
            descricao: data.descricao,
            sobre: data.sobre || null,
            url_demo: data.url_demo?.trim() || null,
            faixa_preco_min: data.faixa_preco_min,
            faixa_preco_max: data.faixa_preco_max,
            complexidade: data.complexidade,
            responsivo: data.responsivo,
            tempo_estimado: data.tempo_estimado,
            cliente_nome: data.cliente_nome,
            destaques: destaquesStr,
            caracteristicas: data.caracteristicas?.trim() || null,
            nivel_complexidade_itens: data.nivel_complexidade_itens?.trim() || null,
            informacoes_projeto: data.informacoes_projeto?.trim() || null,
          })
          .eq('id', projectId)

        if (projErr) {
          toast.error(projErr.message)
          return
        }

        await supabase.from('projetos_categorias').delete().eq('projeto_id', projectId)
        if (data.categorias.length) {
          const { error: catErr } = await supabase.from('projetos_categorias').insert(
            data.categorias.map((cid) => ({ projeto_id: projectId, categoria_id: cid }))
          )
          if (catErr) {
            toast.error(`Erro ao salvar categorias: ${catErr.message}`)
            return
          }
        }

        if (data.imagens?.length) {
          setUploadingImgs(true)
          const bucket = supabase.storage.from('projetos')
          const uploadErrors: string[] = []
          for (const file of data.imagens) {
            const path = `${projectId}/${randomUUID()}-${file.name}`
            const { error: upErr } = await bucket.upload(path, file)
            if (upErr) uploadErrors.push(`${file.name}: ${upErr.message}`)
            else {
              const { data: urlData } = bucket.getPublicUrl(path)
              const { error: insErr } = await supabase.from('projetos_imagens').insert({
                projeto_id: projectId,
                url: urlData.publicUrl,
                ordem: imgs.length,
                principal: false,
              })
              if (insErr) uploadErrors.push(`${file.name}: ${insErr.message}`)
            }
          }
          setUploadingImgs(false)
          if (uploadErrors.length > 0) {
            toast.error(`Erro em ${uploadErrors.length} imagem(ns): ${uploadErrors.slice(0, 2).join('; ')}`)
            return
          }
        }
        toast.success('Projeto atualizado.')
        router.refresh()
      }
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32 text-zinc-500">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        Carregando…
      </div>
    )
  }

  const heroImg = imgs.length ? (imgs.find((i) => i.principal) ?? imgs[0]) : null
  const otherImgs = heroImg ? imgs.filter((i) => i !== heroImg) : []

  return (
    <div className="space-y-8 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <AdminBackButton href="/admin/projetos" label="Voltar para projetos" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {mode === 'create' ? 'Cadastrar Novo Projeto' : 'Editar Projeto'}
            </h1>
            <p className="text-muted-foreground">
              {mode === 'create'
                ? 'Preencha os campos e salve para criar um novo projeto.'
                : 'Altere os campos e clique em Salvar.'}
            </p>
          </div>
        </div>
        <Button
          type="submit"
          form={FORM_ID}
          disabled={saving || uploadingImgs}
          size="sm"
        >
          {saving || uploadingImgs ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Check className="mr-2 h-4 w-4" />
          )}
          {mode === 'create' ? 'Cadastrar Projeto' : 'Salvar'}
        </Button>
      </div>

      <form
        id={FORM_ID}
        onSubmit={handleSubmit(onSubmit, (err) => {
          const firstError = Object.values(err)[0]
          toast.error((firstError?.message as string) ?? 'Verifique os campos do formulário.')
        })}
        className="space-y-6"
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              Galeria
            </CardTitle>
            <CardDescription>Foto de capa e demais imagens.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {imgs.length === 0 ? (
              <p className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50/50 py-8 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900/30">
                Nenhuma imagem. Adicione abaixo para definir a capa e a galeria.
              </p>
            ) : (
              <>
                {heroImg && (
                  <div className="space-y-3">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-800 dark:bg-amber-900/40 dark:text-amber-200">
                      <Star className="h-3.5 w-3.5 fill-current" /> Foto de capa
                    </span>
                    <div className="relative w-full overflow-hidden rounded-xl border border-zinc-200 shadow-md dark:border-zinc-800">
                      <div className="relative aspect-video w-full">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={heroImg.url}
                          alt={heroImg.legenda ?? 'Capa do projeto'}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex justify-end border-t border-zinc-200 bg-white/95 p-3 dark:border-zinc-800 dark:bg-zinc-900/95">
                        <button
                          type="button"
                          title="Remover imagem"
                          onClick={() => removeImg(heroImg)}
                          className="rounded-full bg-secondary p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                {otherImgs.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Restante da galeria</h3>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {otherImgs.map((img) => (
                        <div
                          key={img.id}
                          className="overflow-hidden rounded-xl border border-zinc-200 shadow-sm dark:border-zinc-800"
                        >
                          <div className="relative aspect-video w-full">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={img.url} alt={img.legenda ?? ''} className="h-full w-full object-cover" />
                          </div>
                          <div className="flex gap-2 p-3">
                            {mode === 'edit' && (
                              <button
                                type="button"
                                title="Definir como foto de capa"
                                onClick={() => setPrincipal(img)}
                                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-secondary py-2 text-sm text-amber-700 hover:bg-amber-100 dark:text-amber-300 dark:hover:bg-amber-900/30"
                              >
                                <StarOff className="h-4 w-4" /> Capa
                              </button>
                            )}
                            <button
                              type="button"
                              title="Remover"
                              onClick={() => removeImg(img)}
                              className="rounded-lg bg-secondary p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="imagens">Adicionar novas imagens (Galeria)</Label>
              <Input id="imagens" type="file" multiple accept="image/*" {...register('imagens')} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Cabeçalho do projeto (site)
            </CardTitle>
            <CardDescription>Nome, descrição e categorias.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="nome">Nome do projeto / Nome do Cliente</Label>
              <Input id="nome" {...register('nome')} placeholder="(Nome do Cliente) + título do projeto" />
              {errors.nome && <p className="text-sm text-red-500">{errors.nome.message}</p>}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="descricao">Descrição (site)</Label>
              <Textarea id="descricao" rows={3} placeholder="Descrição em destaque no site" {...register('descricao')} />
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <Label className="mb-0">Categorias</Label>
                <Link href="/admin/projetos/categorias" target="_blank" rel="noopener noreferrer">
                  <Button type="button" variant="outline" size="sm" className="gap-1.5">
                    <Plus className="h-4 w-4" /> Nova categoria
                  </Button>
                </Link>
              </div>
              <div className="flex flex-wrap gap-2">
                <Controller
                  name="categorias"
                  control={control}
                  render={({ field }) => (
                    <>
                      {cats.map((cat) => (
                        <label
                          key={cat.id}
                          className="inline-flex items-center gap-2 rounded-full border border-zinc-300 bg-white px-4 py-2 text-sm hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800"
                        >
                          <input
                            type="checkbox"
                            value={cat.id}
                            className="accent-blue-600"
                            checked={field.value?.includes(cat.id) ?? false}
                            onChange={(e) => {
                              const current = field.value ?? []
                              const next = e.target.checked
                                ? [...current, cat.id]
                                : current.filter((id: string) => id !== cat.id)
                              field.onChange(next)
                            }}
                          />
                          <span>{cat.nome}</span>
                        </label>
                      ))}
                    </>
                  )}
                />
              </div>
              {errors.categorias && <p className="text-sm text-red-500">{errors.categorias.message}</p>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Sobre o Cliente
            </CardTitle>
            <CardDescription>Seção &quot;Sobre o Cliente&quot; no site.</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea id="sobre" rows={3} placeholder="Sobre o Cliente" {...register('sobre')} />
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Link2 className="h-5 w-5" />
                  Links e Detalhes
                </CardTitle>
                <CardDescription>URL da demo, complexidade, responsivo, tempo e cliente.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="url_demo">URL da Demo</Label>
                  <Input id="url_demo" type="url" placeholder="https://exemplo.com/demo" {...register('url_demo')} />
                  {errors.url_demo && <p className="text-sm text-red-500">{errors.url_demo.message}</p>}
                </div>
                <div className="grid gap-6 md:grid-cols-3">
                  <Label className="col-span-full font-medium">Detalhes</Label>
                  <div className="flex flex-col gap-1.5">
                    <Label>Complexidade</Label>
                    <Controller
                      name="complexidade"
                      control={control}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger>{field.value}</SelectTrigger>
                          <SelectContent>
                            <SelectItem value="basico">Básico</SelectItem>
                            <SelectItem value="intermediario">Intermediário</SelectItem>
                            <SelectItem value="avancado">Avançado</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                  <div className="flex items-end">
                    <Controller
                      name="responsivo"
                      control={control}
                      render={({ field }) => (
                        <label htmlFor="resp" className="flex cursor-pointer items-center gap-2">
                          <Checkbox
                            id="resp"
                            checked={field.value}
                            onCheckedChange={(val) => field.onChange(val === true)}
                          />
                          <span>Responsivo</span>
                        </label>
                      )}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="tempo">Tempo estimado</Label>
                    <Input id="tempo" {...register('tempo_estimado')} placeholder="ex: 2-3 semanas" />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="cliente">Nome do Cliente</Label>
                  <Input id="cliente" {...register('cliente_nome')} placeholder="Nome do Cliente" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Faixa de preço estimada (site)</CardTitle>
                <CardDescription>Abaixo do Nível de Complexidade no site.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="precoMin">Preço mín.</Label>
                    <Input
                      id="precoMin"
                      placeholder="R$ 0,00"
                      {...register('faixa_preco_min')}
                      defaultValue={formatCurrencyBRL(watch('faixa_preco_min') ?? null)}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="precoMax">Preço máx.</Label>
                    <Input
                      id="precoMax"
                      placeholder="R$ 0,00"
                      {...register('faixa_preco_max')}
                      defaultValue={formatCurrencyBRL(watch('faixa_preco_max') ?? null)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <List className="h-5 w-5" />
                  Conteúdo dinâmico
                </CardTitle>
                <CardDescription>Características, nível de complexidade (itens) e informações do projeto.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="caracteristicas">Características (um por linha)</Label>
                  <Textarea id="caracteristicas" rows={3} placeholder="Um item por linha" {...register('caracteristicas')} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="nivel_complexidade_itens">Nível de complexidade - itens (lista)</Label>
                  <Textarea id="nivel_complexidade_itens" rows={3} placeholder="Um item por linha" {...register('nivel_complexidade_itens')} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="informacoes_projeto">Informações do projeto (Label: Valor)</Label>
                  <Textarea id="informacoes_projeto" rows={3} placeholder="Um par por linha - ex: Categoria: Design" {...register('informacoes_projeto')} />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-5 w-5" />
                  Destaques do Projeto
                </CardTitle>
                <CardDescription>Card da lateral direita no site.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {destaquesSections.map((section, idx) => (
                  <div key={idx} className="space-y-2 rounded-lg border border-border bg-muted/30 p-4">
                    <Label className="text-sm">Título da seção {idx + 1}</Label>
                    <Input
                      placeholder="Ex.: Análise do website antigo"
                      value={section.titulo}
                      onChange={(e) => {
                        const next = [...destaquesSections]
                        next[idx] = { ...next[idx], titulo: e.target.value }
                        setDestaquesSections(next)
                      }}
                      className="bg-background"
                    />
                    <Label className="text-sm">Tópicos (um por linha)</Label>
                    <Textarea
                      placeholder="Design e hierarquia visual"
                      rows={3}
                      value={section.itens}
                      onChange={(e) => {
                        const next = [...destaquesSections]
                        next[idx] = { ...next[idx], itens: e.target.value }
                        setDestaquesSections(next)
                      }}
                      className="resize-y bg-background"
                    />
                    {destaquesSections.length > 2 && (
                      <button
                        type="button"
                        onClick={() => setDestaquesSections(destaquesSections.filter((_, i) => i !== idx))}
                        className="text-sm text-destructive hover:underline"
                      >
                        Remover esta seção
                      </button>
                    )}
                  </div>
                ))}
                {destaquesSections.length < 3 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setDestaquesSections([...destaquesSections, { titulo: '', itens: '' }])}
                  >
                    <Plus className="mr-2 h-4 w-4" /> Adicionar seção (máx. 3)
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  )
}

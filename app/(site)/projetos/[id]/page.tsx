"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { BackButton } from "@/components/BackButton"
import { ArrowLeft, ArrowRight, ExternalLink, Check, ChevronLeft, ChevronRight } from "lucide-react"
import { motion } from "framer-motion"
import { createSupabaseClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"

const supabase = createSupabaseClient()

type Img = {
  url: string
  legenda?: string | null
  principal: boolean
  ordem: number
}

type Projeto = {
  id: string
  nome: string
  descricao?: string | null
  sobre?: string | null
  url_demo?: string | null
  complexidade?: string | null
  responsivo: boolean | null
  faixa_preco_min?: number | null
  faixa_preco_max?: number | null
  tempo_estimado?: string | null
  categorias: string[]
  imagens: Img[]
  destaques?: string | null
  nivel_complexidade_itens?: string | null
  informacoes_projeto?: string | null
}

export default function ProjetoPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [proj, setProj] = useState<Projeto | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null)

  useEffect(() => {
    if (selectedImageIndex === null || !proj) return
    const hero = proj.imagens.find((i) => i.principal) ?? proj.imagens[0] ?? null
    const others = hero ? proj.imagens.filter((img) => img !== hero) : proj.imagens
    const len = others.length
    if (len === 0) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedImageIndex(null)
      if (e.key === "ArrowLeft")
        setSelectedImageIndex((i) => (i === null ? null : (i - 1 + len) % len))
      if (e.key === "ArrowRight")
        setSelectedImageIndex((i) => (i === null ? null : (i + 1) % len))
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [selectedImageIndex, proj])

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase
        .from("projetos")
        .select(
          `
          id,
          nome,
          descricao,
          sobre,
          url_demo,
          complexidade,
          destaques,
          nivel_complexidade_itens,
          informacoes_projeto,
          responsivo,
          faixa_preco_min,
          faixa_preco_max,
          tempo_estimado,
          projetos_imagens(url, legenda, principal, ordem),
          projetos_categorias(
            categorias(nome)
          )
        `,
        )
        .eq("id", id)
        .eq("status", "publicado")
        .single()

      if (error || !data) {
        router.push("/projetos")
        return
      }

      const sortedImgs: Img[] = (data.projetos_imagens as Img[])?.sort((a, b) => a.ordem - b.ordem) ?? []

      setProj({
        id: data.id,
        nome: data.nome,
        descricao: data.descricao,
        sobre: data.sobre,
        url_demo: data.url_demo,
        complexidade: data.complexidade,
        destaques: data.destaques,
        nivel_complexidade_itens: data.nivel_complexidade_itens,
        informacoes_projeto: data.informacoes_projeto,
        responsivo: data.responsivo,
        faixa_preco_min: data.faixa_preco_min,
        faixa_preco_max: data.faixa_preco_max,
        tempo_estimado: data.tempo_estimado,
        categorias: data.projetos_categorias?.map((pc: any) => pc.categorias?.nome) ?? [],
        imagens: sortedImgs,
      })
      setLoading(false)
    }

    fetchData()
  }, [id, router])

  if (loading) {
    return (
      <div className="pt-32 pb-24 flex items-center justify-center min-h-screen">
        <div className="animate-pulse">
          <div className="h-8 w-32 bg-muted rounded mb-4"></div>
          <div className="h-12 w-64 bg-muted rounded mb-8"></div>
          <div className="h-64 w-full max-w-3xl bg-muted rounded"></div>
        </div>
      </div>
    )
  }

  if (!proj) return null

  const hero = proj.imagens.find((i) => i.principal) ?? proj.imagens[0] ?? null
  const otherImages = proj.imagens.filter((img) => img !== hero)

  const getProjectColor = () => "bg-accent"

  // Categorias para exibição (igual à lista: pills, excluindo "basico")
  const displayCategorias = proj.categorias.filter(
    (c) => c && c.toLowerCase() !== "basico"
  )

  // Função para formatar complexidade
  const formatComplexity = (complexity: string | null) => {
    if (!complexity) return null
    const map: Record<string, string> = {
      basico: "Básico",
      intermediario: "Intermediário",
      avancado: "Avançado",
    }
    return map[complexity.toLowerCase()] || complexity
  }

  // Parse newline-separated text into array of non-empty strings
  const parseList = (text: string | null | undefined): string[] =>
    (text || "")
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean)

  // Destaques: blocos separados por "---"; primeira linha = título, demais = itens
  const destaquesSections: { titulo: string; itens: string[] }[] = (() => {
    const str = (proj.destaques || '').trim()
    if (!str) return []
    if (!str.includes('---')) {
      const lines = parseList(proj.destaques)
      if (lines.length === 0) return []
      return [{ titulo: '', itens: lines }]
    }
    return str.split(/\n---\n/).map((block) => {
      const lines = block.split('\n').map((s) => s.trim()).filter(Boolean)
      const titulo = lines[0] ?? ''
      const itens = lines.slice(1)
      return { titulo, itens }
    }).filter((s) => s.titulo || s.itens.length > 0)
  })()

  // Função para formatar preço
  const formatPrice = () => {
    if (proj.faixa_preco_min && proj.faixa_preco_max) {
      return `R$ ${proj.faixa_preco_min.toLocaleString("pt-BR")} - R$ ${proj.faixa_preco_max.toLocaleString("pt-BR")}`
    }
    if (proj.faixa_preco_min) {
      return `A partir de R$ ${proj.faixa_preco_min.toLocaleString("pt-BR")}`
    }
    return null
  }

  return (
    <div className="pt-32 pb-24 relative overflow-hidden">
      <div className="blob-shape-3 w-[500px] h-[500px] top-0 right-0 opacity-20 absolute -z-10" />
      <div className="dot-pattern" />
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="mb-8">
          <BackButton href="/projetos" label="Voltar para Projetos" />
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          {/* Header com Avatar e Título */}
          <div className="flex flex-wrap items-center gap-4 mb-8">
            <div className={`w-16 h-16 ${getProjectColor()} rounded-full flex items-center justify-center border-2 border-accent/50`}>
              <span className="text-2xl font-bold text-white">{proj.nome.charAt(0).toUpperCase()}</span>
            </div>
            <div>
              <h1 className="text-4xl md:text-6xl font-bold gradient-text">{proj.nome}</h1>
              <div className="flex flex-wrap items-center gap-1 mt-2">
                {displayCategorias.length > 0
                  ? displayCategorias.map((c) => (
                      <span
                        key={c}
                        className="rounded-full bg-accent/10 px-3 py-1 text-sm text-white border border-accent/20"
                      >
                        {c}
                      </span>
                    ))
                  : (
                    <span className="rounded-full bg-accent/10 px-3 py-1 text-sm text-white border border-accent/20">
                      Projeto
                    </span>
                  )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-16">
            {/* Conteúdo Principal */}
            <div className="lg:col-span-2">
              {/* Hero Image */}
              {hero && (
                <div className="relative w-full aspect-video rounded-2xl overflow-hidden mb-8 border border-accent/20">
                  <Image
                    src={hero.url || "/placeholder.svg"}
                    alt={proj.nome}
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
              )}

              {/* Descrição */}
              {proj.descricao && <p className="text-xl mb-8">{proj.descricao}</p>}

              {/* Nível de Complexidade — acima de Sobre o Cliente */}
              {(proj.complexidade || formatPrice()) && (
                <div className="mb-8 pb-8 border-b border-accent/10">
                  <h3 className="text-xl font-bold mb-4 text-foreground">Nível de Complexidade</h3>
                  {proj.complexidade && (
                    <p className="mb-2 text-white">
                      Este é um projeto de nível <strong className="text-white">{formatComplexity(proj.complexidade)}</strong>.
                    </p>
                  )}
                  {formatPrice() && (
                    <>
                      <p className="mt-4 text-white">
                        Faixa de preço estimada para projetos similares: <strong className="text-white">{formatPrice()}</strong>
                      </p>
                      <p className="text-sm text-muted-foreground mt-2">
                        *O valor final depende das necessidades específicas do seu projeto.
                      </p>
                    </>
                  )}
                </div>
              )}

              {/* Botões de ação — Ver Demo e Solicitar Orçamento */}
              <div className="flex flex-wrap gap-4 mb-8">
                {proj.url_demo && (
                  <a
                    href={proj.url_demo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex"
                  >
                    <Button variant="outline" className="gap-2 border-accent/30 hover:border-accent hover:bg-accent/10">
                      <ExternalLink className="h-4 w-4" /> Ver Demo
                    </Button>
                  </a>
                )}
                <Link href={`/projetos/${proj.id}/solicitar`} className="btn-modern-filled inline-flex items-center gap-2">
                  Solicitar Orçamento <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              {/* Sobre o Cliente */}
              {proj.sobre && (
                <>
                  <h2 className="text-2xl font-bold mb-6 mt-8">Sobre o Cliente</h2>
                  <p className="mb-6">{proj.sobre}</p>
                </>
              )}

            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              {/* Destaques do Projeto — seções com título + lista */}
              <div className="glass-card-modern rounded-2xl p-6">
                <h2 className="text-xl font-bold mb-4 text-foreground">Destaques do Projeto</h2>
                {destaquesSections.length === 0 ? (
                  <p className="text-muted-foreground">Nenhum registro encontrado.</p>
                ) : (
                  <div className="space-y-6">
                    {destaquesSections.map((section, si) => (
                      <div key={si}>
                        {section.titulo && (
                          <h3 className="font-semibold mb-2">{section.titulo}</h3>
                        )}
                        <ul className="space-y-2">
                          {section.itens.map((item, ii) => (
                            <li key={ii} className="flex items-start">
                              <Check className="h-4 w-4 text-accent mr-3 mt-0.5 shrink-0" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Galeria */}
          <h2 className="text-3xl font-bold mb-8 gradient-text">Galeria</h2>
          {otherImages.length === 0 ? (
            <p className="text-muted-foreground mb-16">Nenhum registro encontrado.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
                {otherImages.map((img, index) => (
                  <motion.div
                    key={img.url}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className={`relative aspect-video rounded-2xl overflow-hidden border border-accent/10 ${
                      index === otherImages.length - 1 && otherImages.length % 2 === 1 ? "md:col-span-2" : ""
                    }`}
                  >
                    <Image
                      src={img.url || "/placeholder.svg"}
                      alt={img.legenda || proj.nome}
                      fill
                      className="object-cover hover:scale-105 transition-transform duration-500 cursor-pointer"
                      onClick={() => setSelectedImageIndex(index)}
                    />
                  </motion.div>
                ))}
            </div>
          )}

          {/* Navegação entre Projetos */}
          <div className="flex justify-between items-center">
            <Link href="/projetos" className="btn-modern inline-flex items-center">
              <ArrowLeft className="mr-2 h-5 w-5" />
              Ver Todos os Projetos
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Modal carrossel da galeria */}
      {selectedImageIndex !== null && otherImages.length > 0 && (
        <div
          className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImageIndex(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Visualização da galeria"
        >
          <div
            className="relative flex max-h-[90vh] w-full max-w-5xl items-center justify-center gap-2"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() =>
                setSelectedImageIndex(
                  (selectedImageIndex - 1 + otherImages.length) % otherImages.length
                )
              }
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent/20 text-white border border-accent/30 transition hover:bg-accent/40"
              aria-label="Imagem anterior"
            >
              <ChevronLeft className="h-8 w-8" />
            </button>

            <div className="relative h-[70vh] w-full max-w-4xl">
              <Image
                src={otherImages[selectedImageIndex].url || "/placeholder.svg"}
                alt={otherImages[selectedImageIndex].legenda || proj.nome}
                fill
                className="object-contain"
                sizes="(max-width: 1024px) 100vw, 896px"
              />
            </div>

            <button
              type="button"
              onClick={() =>
                setSelectedImageIndex((selectedImageIndex + 1) % otherImages.length)
              }
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent/20 text-white border border-accent/30 transition hover:bg-accent/40"
              aria-label="Próxima imagem"
            >
              <ChevronRight className="h-8 w-8" />
            </button>
          </div>

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-4 py-2 text-sm text-white">
            {selectedImageIndex + 1} / {otherImages.length}
          </div>

          <Button
            variant="secondary"
            size="sm"
            className="absolute top-4 right-4"
            onClick={() => setSelectedImageIndex(null)}
          >
            Fechar
          </Button>
        </div>
      )}
    </div>
  )
}

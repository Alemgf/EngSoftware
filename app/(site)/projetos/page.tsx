/* -------------------------------------------------------------------------- */
/*  /app/projetos/page.tsx                                                    */
/* -------------------------------------------------------------------------- */
'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, ExternalLink } from 'lucide-react'
import { createSupabaseClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'

/* ------------------------- CONFIGURAÇÃO SUPABASE ------------------------- */
const supabase = createSupabaseClient()

/* ----------------------------- TIPAGENS ---------------------------------- */
/** Estrutura que volta do SELECT; simplificada para o que usamos aqui. */

type CategoriaObj = { nome: string | null }

type RawProjeto = {
  id: string
  nome: string
  descricao: string | null
  url_demo: string | null
  complexidade: 'basico' | 'intermediario' | 'avancado' | null
  faixa_preco_min: number | null
  faixa_preco_max: number | null
  projetos_imagens: {
    url: string
    principal: boolean | null
  }[]
   projetos_categorias: {
    categorias: CategoriaObj[] | CategoriaObj | null
  }[]
}

type Projeto = {
  id: string
  nome: string
  descricao?: string | null
  url_demo?: string | null
  thumb_url?: string | null
  complexidade?: 'basico' | 'intermediario' | 'avancado' | null
  faixa_preco_min?: number | null
  faixa_preco_max?: number | null
  categorias: string[]
}

/* --------------------------- COMPONENTE PÁGINA --------------------------- */
export default function ProjetosPage() {
  const [projects, setProjects] = useState<Projeto[]>([])
  const [categories, setCategories] = useState<string[]>(['Todos'])
  const [activeCategory, setActiveCategory] = useState('Todos')
  const [loading, setLoading] = useState(true)

  /* --------------------------- BUSCA NO SUPABASE ------------------------- */
  useEffect(() => {
    const fetchData = async () => {
      const [projRes, catRes] = await Promise.all([
        supabase
          .from('projetos')
          .select(`
      id,
      nome,
      descricao,
      url_demo,
      complexidade,
      faixa_preco_min,
      faixa_preco_max,
      projetos_imagens (
        url,
        principal
      ),
      projetos_categorias (
        categorias ( nome )
      )
    `)
          .eq('status', 'publicado')
          .order('created_at', { ascending: false }),
        supabase.from('categorias').select('id, nome').order('nome'),
      ])

      if (projRes.error) {
        console.error(projRes.error)
        alert('Erro ao carregar projetos: ' + projRes.error.message)
        setLoading(false)
        return
      }

      const data = projRes.data ?? []

  const formatted: Projeto[] = (data).map((p) => {
    const imgs = Array.isArray(p.projetos_imagens) ? p.projetos_imagens : []
    const principal = imgs.find((i) => i.principal) ?? imgs[0]

// remove duplicados e ignora null
const cats = (p.projetos_categorias ?? [])
  .flatMap((pc) => {
    const cat = pc.categorias
    if (!cat) return []

    return Array.isArray(cat)
      ? cat.map((c) => c?.nome).filter(Boolean)          // array
      : cat.nome                                         // objeto único
      ? [cat.nome]
      : []
  })
  .filter((c): c is string => !!c)      // garante string[]

    return {
      id: p.id,
      nome: p.nome,
      descricao: p.descricao,
      url_demo: p.url_demo ?? null,
      complexidade: p.complexidade,
      faixa_preco_min: p.faixa_preco_min,
      faixa_preco_max: p.faixa_preco_max,
      thumb_url: principal?.url ?? null,
      categorias: cats,
    }
  })

  setProjects(formatted)

  /* --------- lista canônica de categorias (admin/projetos/categorias); exclui Basico/Básico do filtro para não confundir com nível de complexidade --------- */
  const excludeFromFilter = ['Basico', 'Básico', 'basico']
  const categoryNames =
    catRes.data
      ?.map((c) => c.nome)
      .filter((nome): nome is string => !!nome && !excludeFromFilter.includes(nome)) ?? []
  setCategories(['Todos', ...categoryNames])

  setLoading(false)
    }

    fetchData()
  }, [])

  /* ---------------------- FILTRO POR CATEGORIA --------------------------- */
  const filteredProjects =
    activeCategory === 'Todos'
      ? projects
      : projects.filter((p) => p.categorias.includes(activeCategory))

  /* ----------------------------- ANIMAÇÕES ------------------------------- */
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  }

  const staggerContainer = {
    hidden: {},
    visible: {
      transition: { staggerChildren: 0.1, delayChildren: 0.1 },
    },
  }

  /* ------------------------------- RENDER -------------------------------- */
  return (
    <div className="py-24 pt-32 relative overflow-hidden">
      <div className="blob-shape-2 w-[400px] h-[400px] top-0 right-0 opacity-20 absolute -z-10" />
      <div className="dot-pattern" />
      <div className="container relative z-10">
        {/* ---------- Header ---------- */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          className="mx-auto mb-16 max-w-3xl text-center"
        >
          <span className="badge-modern mb-6 inline-flex">
            Nosso Portfólio de Trabalhos
          </span>
          <h1 className="mb-6 text-4xl font-bold md:text-6xl gradient-text">
            Projetos Realizados
          </h1>
          <p className="text-xl text-muted-foreground">
            Explore nossa seleção de landing pages e sites. Escolha um como
            referência para seu projeto personalizado.
          </p>
        </motion.div>

        {/* ---------- Filtro ---------- */}
        {categories.length > 1 && (
          <div className="mb-12 flex flex-wrap justify-center gap-3">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 ${
                  activeCategory === cat
                    ? 'bg-accent text-accent-foreground border-2 border-accent'
                    : 'bg-secondary/80 hover:bg-secondary border-2 border-accent/20 hover:border-accent/40'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* ---------- Lista de Projetos ---------- */}
        {loading ? (
          <p className="py-16 text-center text-muted-foreground">
            Carregando projetos…
          </p>
        ) : filteredProjects.length === 0 ? (
          <p className="py-16 text-center text-muted-foreground">
            Nenhum projeto encontrado.
          </p>
        ) : (
          <motion.div
            key={activeCategory}
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3"
          >
            {filteredProjects.map((p) => (
              <motion.div key={p.id} variants={fadeInUp} className="flex">
                <div className="group relative flex flex-1 flex-col overflow-hidden rounded-2xl glass-card-modern border border-accent/20 card-hover">
                  <Link href={`/projetos/${p.id}`} className="block flex-1">
                    <div className="relative h-56 w-full overflow-hidden">
                      <Image
                        src={
                          p.thumb_url ??
                          'https://placehold.co/600x400?text=Imagem+em+breve'
                        }
                        alt={p.nome}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <span className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="flex items-center text-white text-sm font-medium px-4 py-2 rounded-full bg-accent/90 border border-accent">
                          Ver mais <ArrowRight className="ml-1 h-4 w-4" />
                        </span>
                      </span>
                    </div>
                    <div className="relative flex flex-1 flex-col p-4 min-h-[280px]">
                      <h3 className="mb-2 text-lg font-semibold leading-tight line-clamp-2 min-h-[2.75rem] transition-colors group-hover:text-accent">
                        {p.nome}
                      </h3>

                      <div className="mb-3 flex flex-wrap gap-1 min-h-[1.75rem]">
                        {p.categorias
                          .filter((c) => c && c.toLowerCase() !== 'basico')
                          .map((c) => (
                          <span
                            key={c}
                            className="rounded-full bg-accent/10 px-3 py-1 text-sm text-white border border-accent/20"
                          >
                            {c}
                          </span>
                        ))}
                      </div>

                      <div className="mb-3 min-h-[3.75rem] flex-1">
                        {p.descricao ? (
                          <p className="line-clamp-3 text-sm text-muted-foreground leading-snug">
                            {p.descricao}
                          </p>
                        ) : (
                          <p className="text-sm text-muted-foreground/50 leading-snug">&nbsp;</p>
                        )}
                      </div>

                      {(p.faixa_preco_min || p.faixa_preco_max) && (
                        <p className="mt-auto text-xs text-white">
                          Faixa de preço:{' '}
                          {p.faixa_preco_min
                            ? `R$ ${p.faixa_preco_min}`
                            : '—'}
                          {p.faixa_preco_max
                            ? ` - R$ ${p.faixa_preco_max}`
                            : ''}
                        </p>
                      )}
                    </div>
                  </Link>
                  {p.url_demo && (
                    <div className="border-t border-accent/10 px-4 py-3">
                      <a href={p.url_demo} target="_blank" rel="noopener noreferrer" className="inline-flex w-full sm:w-auto">
                        <Button variant="outline" size="sm" className="gap-2 w-full sm:w-auto border-accent/30 hover:border-accent hover:bg-accent/10">
                          <ExternalLink className="h-4 w-4" /> Ver Site
                        </Button>
                      </a>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  )
}

"use client"

import { useRef, useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight, Code, Zap, Layout, Users } from "lucide-react"
import { createSupabaseClient } from "@/lib/supabase/client"

const supabase = createSupabaseClient()

type FeaturedProject = {
  id: string
  title: string
  category: string
  image: string
  color: string
}

const FEATURED_COLORS = ["bg-accent/20", "bg-accent/15", "bg-accent/25", "bg-accent/20"]
const DEFAULT_THUMB = "https://placehold.co/600x400?text=Em+breve"

export default function Home() {
  const marqueeRef = useRef<HTMLDivElement>(null)
  const [featuredProjects, setFeaturedProjects] = useState<FeaturedProject[]>([])
  const [featuredLoading, setFeaturedLoading] = useState(true)

  useEffect(() => {
    const marqueeContent = marqueeRef.current
    if (!marqueeContent) return

    const clone = marqueeContent.cloneNode(true)
    marqueeRef.current?.parentElement?.appendChild(clone)
  }, [])

  useEffect(() => {
    const fetchFeatured = async () => {
      const { data, error } = await supabase
        .from("projetos")
        .select(
          `
          id,
          nome,
          projetos_imagens ( url, principal ),
          projetos_categorias ( categorias ( nome ) )
        `
        )
        .eq("status", "publicado")
        .eq("destaque", true)
        .order("created_at", { ascending: false })
        .limit(4)

      if (error) {
        setFeaturedLoading(false)
        return
      }

      const formatted: FeaturedProject[] = (data ?? []).map((p, idx) => {
        const imgs = Array.isArray((p as any).projetos_imagens) ? (p as any).projetos_imagens : []
        const principal = imgs.find((i: any) => i.principal) ?? imgs[0]
        const cats = (p as any).projetos_categorias ?? []
        const catNames = cats.flatMap((pc: any) => {
          const c = pc?.categorias
          if (!c) return []
          return Array.isArray(c) ? c.map((x: any) => x?.nome).filter(Boolean) : [c?.nome].filter(Boolean)
        })
        const category = [...new Set(catNames)].slice(0, 2).join(", ") || "Projeto"
        return {
          id: p.id,
          title: p.nome,
          category,
          image: principal?.url ?? DEFAULT_THUMB,
          color: FEATURED_COLORS[idx % FEATURED_COLORS.length],
        }
      })
      setFeaturedProjects(formatted)
      setFeaturedLoading(false)
    }
    fetchFeatured()
  }, [])

  // Variantes para animações com Framer Motion
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  }

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  return (
    <>
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-24 sm:pt-28 overflow-hidden isolate">
        <div className="glow-lines">
          <div className="glow-line glow-line-1" />
          <div className="glow-line glow-line-2" />
          <div className="glow-line glow-line-3" />
        </div>
        <div className="blob-shape w-[600px] h-[600px] top-[-100px] right-[-100px] opacity-30"></div>
        <div className="blob-shape-2 w-[500px] h-[500px] bottom-[-100px] left-[-100px] opacity-25"></div>
        <div className="blob-shape-3 w-[400px] h-[400px] top-[30%] left-[20%] opacity-20"></div>
        <div className="dot-pattern"></div>

        <div className="container mx-auto w-full px-5 sm:px-6 md:px-6 max-w-7xl relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 sm:gap-12 items-center">
            <motion.div initial="hidden" animate="visible" variants={fadeInUp} className="mt-2 sm:mt-0">
              <span className="badge-modern mb-5 sm:mb-6 inline-flex">
                Portfólio de Excelência
              </span>
              <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-5 sm:mb-6 leading-tight">
                <span className="gradient-text">Landing Pages</span> para seu Negócio
              </h1>
              <p className="text-xl text-muted-foreground mb-8 max-w-lg">
                Conheça nosso portfólio de projetos e escolha o nível de qualidade que deseja para o seu site. Desde
                landing pages simples até sites sofisticados com animações e recursos avançados.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/projetos" className="btn-modern-filled inline-flex items-center">
                  Ver Projetos <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                <Link href="/sobre" className="btn-modern inline-flex items-center">
                  Sobre o Studio
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <motion.div
                className="relative aspect-video rounded-2xl overflow-hidden border border-accent/20 shadow-2xl"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                whileHover={{ scale: 1.02 }}
              >
                <Image
                  src="/images/interior-design.png"
                  alt="Design de interiores moderno"
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 relative overflow-hidden">
        <div className="blob-shape-3 w-[600px] h-[600px] top-[-100px] left-[-100px] opacity-20"></div>
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 gradient-text animate-draw-line inline-block">
              Por que trabalhar conosco?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Desenvolvemos sites personalizados com foco em performance, conversão e design de alta qualidade para cada
              cliente.
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 items-stretch"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {[
              {
                icon: <Layout className="h-8 w-8 mb-4 text-accent shrink-0" />,
                title: "Design Responsivo",
                description: "Todos os projetos são otimizados para desktop, tablet e dispositivos móveis.",
              },
              {
                icon: <Zap className="h-8 w-8 mb-4 text-accent shrink-0" />,
                title: "Alta Performance",
                description: "Código limpo e otimizado para carregamento rápido e melhor experiência do usuário.",
              },
              {
                icon: <Code className="h-8 w-8 mb-4 text-accent shrink-0" />,
                title: "Fácil Personalização",
                description: "Estrutura modular que permite personalizar cores, fontes e conteúdo facilmente.",
              },
              {
                icon: <Users className="h-8 w-8 mb-4 text-accent shrink-0" />,
                title: "Suporte Dedicado",
                description: "Assistência técnica para implementação e personalização do seu projeto.",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="glass-card-modern p-8 text-center card-hover h-full flex flex-col"
              >
                <div className="flex justify-center shrink-0">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-2 text-foreground shrink-0">{feature.title}</h3>
                <p className="text-muted-foreground mb-4 flex-1 min-h-[3.5rem]">{feature.description}</p>
                <Link href="/projetos" className="text-accent text-sm font-medium hover:underline inline-flex items-center shrink-0 mt-auto">
                  Ver mais <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Featured Templates */}
      <section className="py-24 relative overflow-hidden bg-secondary/30">
        <div className="blob-shape-2 w-[500px] h-[500px] bottom-[-200px] right-[-100px] opacity-30"></div>
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-5xl font-bold mb-4 gradient-text animate-draw-line inline-block">
                Portfólio em Destaque
              </h2>
              <p className="text-muted-foreground max-w-lg">
                Uma seleção dos nossos melhores trabalhos para diferentes segmentos de mercado e níveis de complexidade.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Link
                href="/projetos"
                className="mt-4 md:mt-0 btn-modern inline-flex items-center"
              >
                Ver todos os projetos <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {featuredLoading ? (
              Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="relative w-full aspect-[4/3] rounded-2xl bg-muted animate-pulse" />
              ))
            ) : featuredProjects.length === 0 ? (
              <p className="col-span-full py-12 text-center text-muted-foreground">
                Nenhum projeto em destaque no momento.{" "}
                <Link href="/projetos" className="text-accent hover:underline">
                  Ver todos os projetos
                </Link>
              </p>
            ) : (
              featuredProjects.map((projeto, index) => (
                <Link key={projeto.id} href={`/projetos/${projeto.id}`} className="project-card group">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="relative w-full aspect-[4/3] overflow-hidden rounded-2xl glass-card-modern border border-accent/20"
                  >
                    <Image
                      src={projeto.image || "/placeholder.svg"}
                      alt={projeto.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="project-overlay">
                      <div className={`w-12 h-12 ${projeto.color} rounded-full mb-4 flex items-center justify-center border border-accent/30`}>
                        <span className="text-accent font-bold">{projeto.title.charAt(0)}</span>
                      </div>
                      <h3 className="text-2xl font-bold mb-2 text-foreground">{projeto.title}</h3>
                      <p className="text-muted-foreground mb-3">{projeto.category}</p>
                      <span className="text-accent text-sm font-medium inline-flex items-center">
                        Ver mais <ArrowRight className="ml-1 h-4 w-4" />
                      </span>
                    </div>
                  </motion.div>
                </Link>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="py-24 relative overflow-hidden">
        <div className="blob-shape w-[500px] h-[500px] top-[-100px] left-[50%] opacity-20"></div>
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-4 gradient-text animate-draw-line inline-block">Como Funciona</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Processo simples e rápido para ter sua landing page no ar em poucos passos.
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {[
              {
                step: "01",
                title: "Explore Nosso Portfólio",
                description:
                  "Navegue por nossa galeria e identifique estilo de Design e o tipo de WebSite (basico,intermediario..) que deseja para seu projeto.",
              },
              {
                step: "02",
                title: "Solicite um Orçamento",
                description:
                  "Preencha o formulário com suas informações e necessidades específicas para receber uma proposta personalizada.",
              },
              {
                step: "03",
                title: "Receba seu Site Exclusivo",
                description:
                  "Desenvolvemos seu site totalmente personalizado de acordo com suas necessidades e objetivos de negócio.",
              },
            ].map((process, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="glass-card-modern p-8 rounded-2xl relative card-hover h-full flex flex-col"
              >
                <div className="absolute -top-6 left-8 w-12 h-12 bg-accent text-accent-foreground rounded-full flex items-center justify-center font-bold text-xl border-2 border-accent/50 shrink-0">
                  {process.step}
                </div>
                <h3 className="text-xl font-bold mb-4 mt-6 text-foreground shrink-0">{process.title}</h3>
                <p className="text-muted-foreground flex-1 min-h-[4rem]">{process.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-24 relative overflow-hidden">
        <div className="blob-shape-3 w-[800px] h-[800px] top-[-400px] right-[-400px] opacity-20"></div>
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="glass-card-modern p-8 md:p-12 rounded-2xl"
          >
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl md:text-5xl font-bold mb-6 gradient-text">Pronto para ter seu site exclusivo?</h2>
              <p className="text-lg text-muted-foreground mb-8">
                Entre em contato conosco para discutir suas necessidades específicas e obter um orçamento baseado no
                nível de complexidade desejado.
              </p>
              <Link href="/contato" className="btn-modern-filled inline-flex items-center">
                Fale Conosco <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  )
}

"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { BackButton } from "@/components/BackButton"
import { ArrowLeft, ArrowRight, ExternalLink, Check } from "lucide-react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"

export default function VixDesignPage() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulando carregamento de dados
    setTimeout(() => {
      setLoading(false)
    }, 500)
  }, [])

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

  return (
    <div className="pt-32 pb-24">
      <div className="container mx-auto px-4 md:px-6">
        <div className="mb-8">
          <BackButton href="/projetos" label="Voltar para Projetos" />
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="flex flex-wrap items-center gap-4 mb-8">
            <div className="w-16 h-16 bg-[#8D7B68] rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-white">V</span>
            </div>
            <div>
              <h1 className="text-4xl md:text-6xl font-bold">Vix Design</h1>
              <div className="flex items-center mt-2">
                <span className="text-muted-foreground">Design de Interiores</span>
                <span className="mx-2 text-muted-foreground">•</span>
                <div className="flex flex-wrap gap-2">
                  {["Arquitetura", "Interiores", "Construção"].map((tag, i) => (
                    <span key={i} className="text-xs px-2 py-1 bg-secondary rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-16">
            <div className="lg:col-span-2">
              <div className="relative w-full aspect-video rounded-xl overflow-hidden mb-8">
                <Image
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Captura%20de%20Tela%202025-05-10%20a%CC%80s%2021.40.56%201-ZOQbtbNROJB2vKALKaDhtjgB4Kz7FI.png"
                  alt="Vix Design - Ambientes planejados"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent flex items-end p-6">
                  <a
                    href="https://kzmo4iz7mijs5y176vle.lite.vusercontent.net"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-full inline-flex items-center font-medium hover:bg-primary/90 transition-colors"
                  >
                    Ver Demo Completa <ExternalLink className="ml-2 h-4 w-4" />
                  </a>
                </div>
              </div>

              <p className="text-xl mb-8">
                O projeto Vix Design foi desenvolvido para um estúdio de design de interiores que oferece serviços
                completos, desde o desenvolvimento de projetos arquitetônicos até a execução da obra. Com um design
                elegante e minimalista, o site apresenta os ambientes planejados e transformados pelo estúdio,
                destacando a qualidade e sofisticação dos projetos.
              </p>

              <h2 className="text-2xl font-bold mb-6">Características</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {[
                  "Design responsivo para todos os dispositivos",
                  "Página única com navegação por seções",
                  "Galeria de projetos com categorias",
                  "Botão de orçamento integrado ao WhatsApp",
                  "Integração com redes sociais",
                  "Otimizado para SEO",
                  "Carregamento rápido de imagens",
                  "Seção de depoimentos de clientes",
                ].map((feature, index) => (
                  <div key={index} className="flex items-start">
                    <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0 mr-3">
                      <Check className="h-3 w-3 text-primary" />
                    </div>
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              <div className="mt-8 pt-8 border-t border-muted">
                <h3 className="text-xl font-bold mb-4">Nível de Complexidade</h3>
                <p className="mb-2">
                  Este é um projeto de nível <strong>Básico</strong>.
                </p>
                <p>Projetos com este nível de complexidade geralmente incluem:</p>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li>Design responsivo simples</li>
                  <li>Página única com seções</li>
                  <li>Formulário de contato redirecionando para o WhatsApp com mensagem automática</li>
                  <li>Galeria de imagens</li>
                  <li>Animações simples</li>
                </ul>
                <p className="mt-4">
                  Faixa de preço estimada para projetos similares: <strong>R$ 1.500 - R$ 2.500</strong>
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  *O valor final depende das necessidades específicas do seu projeto.
                </p>
              </div>

              <h2 className="text-2xl font-bold mb-6 mt-8">Sobre o Cliente</h2>
              <p className="mb-6">
                O Vix Design é um estúdio de design de interiores especializado em criar ambientes planejados que
                transformam espaços em experiências únicas. Além de desenvolver projetos arquitetônicos e de interiores,
                o estúdio também oferece o serviço completo de execução da obra, entregando ao cliente o projeto
                finalizado e pronto para uso. Com mais de 1.000 projetos desenvolvidos, o Vix Design se destaca pela
                qualidade e atenção aos detalhes em cada ambiente criado.
              </p>

              <Link href={`/solicitar-orcamento?projeto=vix-design`}>
                <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
                  Solicitar Orçamento <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>

            <div className="space-y-8">
              <div className="bg-secondary rounded-xl p-6">
                <h2 className="text-2xl font-bold mb-6">Informações do Projeto</h2>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Categoria:</span>
                    <span className="font-medium">Design de Interiores</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Complexidade:</span>
                    <span className="font-medium">Básico</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Responsivo:</span>
                    <span className="font-medium">Sim</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tempo Médio de Desenvolvimento:</span>
                    <span className="font-medium">2-3 semanas</span>
                  </div>
                </div>
              </div>

              <div className="bg-secondary rounded-xl p-6">
                <h2 className="text-xl font-bold mb-4">Destaques do Projeto</h2>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <Check className="h-4 w-4 text-primary mr-3" />
                    <span>Design elegante e minimalista</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="h-4 w-4 text-primary mr-3" />
                    <span>Navegação intuitiva por seções</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="h-4 w-4 text-primary mr-3" />
                    <span>Galeria de projetos categorizada</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="h-4 w-4 text-primary mr-3" />
                    <span>Formulário de orçamento integrado</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="h-4 w-4 text-primary mr-3" />
                    <span>Otimizado para dispositivos móveis</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="h-4 w-4 text-primary mr-3" />
                    <span>Carregamento rápido de imagens</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <h2 className="text-3xl font-bold mb-8">Galeria</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="relative aspect-video rounded-xl overflow-hidden"
            >
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Captura%20de%20Tela%202025-05-10%20a%CC%80s%2022.04.10-mrTvG02IjKjkxvfdE4pk6TcA3foCtq.png"
                alt="Vix Design - Sala de TV"
                fill
                className="object-cover hover:scale-105 transition-transform duration-500"
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="relative aspect-video rounded-xl overflow-hidden"
            >
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Captura%20de%20Tela%202025-05-10%20a%CC%80s%2021.40.56%201-ZOQbtbNROJB2vKALKaDhtjgB4Kz7FI.png"
                alt="Vix Design - Sala de estar"
                fill
                className="object-cover hover:scale-105 transition-transform duration-500"
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="md:col-span-2 relative aspect-video rounded-xl overflow-hidden"
            >
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Captura%20de%20Tela%202025-05-10%20a%CC%80s%2022.03.53-CPWeOdoEmwBZa5A8aEIRft8hHYfxXk.png"
                alt="Vix Design - Cozinha e Sala de Jantar"
                fill
                className="object-cover hover:scale-105 transition-transform duration-500"
              />
            </motion.div>
          </div>

          <div className="flex justify-between items-center">
            <Link
              href="/projetos/dra-valentina"
              className="px-6 py-3 bg-secondary text-secondary-foreground rounded-full inline-flex items-center font-medium hover:bg-secondary/70 transition-colors border border-primary/30"
            >
              <ArrowLeft className="mr-2 h-5 w-5" />
              Projeto Anterior
            </Link>

            <Link
              href="/projetos"
              className="px-6 py-3 bg-primary text-primary-foreground rounded-full inline-flex items-center font-medium hover:bg-primary/90 transition-colors"
            >
              Ver Todos os Projetos
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

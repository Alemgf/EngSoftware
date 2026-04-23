"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { BackButton } from "@/components/BackButton"
import { ArrowLeft, ArrowRight, ExternalLink, Check } from "lucide-react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"

export default function DraValentinaPage() {
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
            <div className="w-16 h-16 bg-[#9E2B4A] rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-white">D</span>
            </div>
            <div>
              <h1 className="text-4xl md:text-6xl font-bold">Odontologia & Estética Dr.Valentina</h1>
              <div className="flex items-center mt-2">
                <span className="text-muted-foreground">Saúde & Beleza</span>
                <span className="mx-2 text-muted-foreground">•</span>
                <div className="flex flex-wrap gap-2">
                  {["Odontologia", "Estética", "Saúde"].map((tag, i) => (
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
                  src="/images/dra-valentina-hero.jpg"
                  alt="Dr.Valentina - Hero Section"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent flex items-end p-6">
                  <a
                    href="https://kzmm50dbdvvykwt56erv.lite.vusercontent.net"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-full inline-flex items-center font-medium hover:bg-primary/90 transition-colors"
                  >
                    Ver Demo Completa <ExternalLink className="ml-2 h-4 w-4" />
                  </a>
                </div>
              </div>

              <p className="text-xl mb-8">
                <strong>Importante:</strong> Este é um projeto ilustrativo criado para demonstrar nossas capacidades de
                desenvolvimento web para clínicas odontológicas e estéticas. O site da Dra. Valentina Siqueira foi
                desenvolvido como um exemplo do que podemos oferecer para profissionais da área da saúde que desejam uma
                presença online elegante e funcional.
              </p>

              <p className="text-xl mb-8">
                O projeto apresenta um design sofisticado com tons de vinho e rosa, transmitindo elegância e confiança.
                O site conta com seções para apresentação dos serviços odontológicos e estéticos, depoimentos de
                pacientes, informações sobre a profissional e um sistema de agendamento de consultas integrado ao
                WhatsApp.
              </p>

              <h2 className="text-2xl font-bold mb-6">Características</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {[
                  "Design responsivo para todos os dispositivos",
                  "Página única com navegação por seções",
                  "Galeria de serviços com categorias",
                  "Botão de agendamento integrado ao WhatsApp",
                  "Integração com redes sociais",
                  "Otimizado para SEO",
                  "Carregamento rápido de imagens",
                  "Seção de depoimentos de pacientes",
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

              <h2 className="text-2xl font-bold mb-6 mt-8">Sobre o Projeto</h2>
              <p className="mb-6">
                Este projeto foi desenvolvido como uma demonstração de nossas capacidades para profissionais da área de
                odontologia e estética. Embora seja um projeto fictício, ele representa fielmente o tipo de site que
                podemos criar para clínicas reais, com todas as funcionalidades necessárias para atrair pacientes e
                facilitar o agendamento de consultas.
              </p>
              <p className="mb-6">
                O design foi pensado para transmitir sofisticação e confiança, com uma paleta de cores em tons de vinho
                e rosa que remetem à área de saúde e estética. A navegação intuitiva e a apresentação clara dos serviços
                facilitam a experiência do usuário, enquanto o botão de agendamento de consultas direciona diretamente
                para o WhatsApp, agilizando o contato.
              </p>

              <Link href={`/solicitar-orcamento?projeto=dra-valentina`}>
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
                    <span className="font-medium">Saúde & Beleza</span>
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
                    <span>Design elegante com identidade visual consistente</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="h-4 w-4 text-primary mr-3" />
                    <span>Apresentação clara dos serviços oferecidos</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="h-4 w-4 text-primary mr-3" />
                    <span>Seção de depoimentos para construção de confiança</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="h-4 w-4 text-primary mr-3" />
                    <span>Botão de agendamento integrado ao WhatsApp</span>
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
                src="/images/dra-valentina-hero.jpg"
                alt="Dr.Valentina - Hero Section"
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
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Captura%20de%20Tela%202025-05-10%20a%CC%80s%2022.46.44-capn07oFioIJt868yuJ6XH3EVqqKax.png"
                alt="Dr.Valentina - Serviços"
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
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Captura%20de%20Tela%202025-05-10%20a%CC%80s%2022.47.13-TwbvTvC1JozJNOXGQhF4dYEyIJ79Dr.png"
                alt="Dr.Valentina - Depoimentos"
                fill
                className="object-cover hover:scale-105 transition-transform duration-500"
              />
            </motion.div>
          </div>

          <div className="flex justify-between items-center">
            <Link
              href="/projetos/vix-design"
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

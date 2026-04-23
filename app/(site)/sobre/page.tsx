"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Code, Zap, Layout, Users } from "lucide-react"

export default function SobrePage() {
  return (
    <div className="pt-32 pb-24 relative overflow-hidden">
      <div className="blob-shape-2 w-[400px] h-[400px] top-0 right-0 opacity-20 absolute -z-10" />
      <div className="dot-pattern" />
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto mb-16 text-center"
        >
          <span className="badge-modern mb-6 inline-flex">Sobre Nós</span>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 gradient-text">Sobre Nosso Studio</h1>
          <p className="text-xl text-muted-foreground">
            Desenvolvemos sites e landing pages sob medida para alavancar seu negócio e fortalecer sua presença digital
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-24 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h2 className="text-3xl font-bold mb-8 gradient-text">Nossa Visão</h2>
            <div className="space-y-6 text-lg">
              <p>
                Estar online hoje não é uma opção, é essencial. Mas um site que apenas ocupa espaço na internet não
                basta. Templates prontos e designs bonitos são só o começo. O que realmente importa é entender
                profundamente o mercado, o produto, a essência do que você oferece.
              </p>
              <p>
                Porque um website não deve apenas existir, ele deve vender. Deve comunicar, persuadir, criar conexões.
                E para isso, não basta aparência: é preciso estratégia, estudo, um propósito claro. Cada palavra, cada
                chamada à ação deve ser pensada para converter visitantes em clientes.
              </p>
              <p>
                Isso não é só design. Não é só tecnologia. É a interseção entre arte e negócios. E quando feito direito,
                não representa sua empresa, ele é sua empresa, no mundo digital.
              </p>
              <p>
                Pense diferente. Exija mais. Porque o seu site não é só um site, é o seu maior vendedor, funcionando 24
                horas por dia, 7 dias por semana. E ele merece ser extraordinário.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.98, opacity: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="relative"
          >
            <div className="relative h-72 md:h-96 w-full">
              <div className="absolute inset-0 rounded-3xl bg-accent/10 blur-3xl" />
              <div className="relative h-full w-full rounded-3xl glass-card-modern overflow-hidden flex items-center justify-center px-8">
                <p className="text-lg md:text-xl text-muted-foreground text-center max-w-md">
                  Cada projeto é pensado para ser o{" "}
                  <span className="font-semibold text-foreground">melhor vendedor digital</span> da sua empresa.
                  Comunicando com clareza, gerando desejo e transformando tráfego em resultado real.
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mb-24"
        >
          <h2 className="text-3xl font-bold mb-8 text-center gradient-text">Nossa Abordagem</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <Layout className="h-12 w-12 mb-4 text-accent" />,
                title: "Design Centrado no Usuário",
                description:
                  "Criamos projetos que priorizam a experiência do usuário, garantindo navegação intuitiva e foco na conversão.",
              },
              {
                icon: <Zap className="h-12 w-12 mb-4 text-accent" />,
                title: "Performance Otimizada",
                description:
                  "Todos os nossos projetos são otimizados para carregamento rápido e melhor desempenho em todos os dispositivos.",
              },
              {
                icon: <Code className="h-12 w-12 mb-4 text-accent" />,
                title: "Código Limpo",
                description:
                  "Desenvolvemos com as melhores práticas de codificação, garantindo projetos fáceis de personalizar e manter.",
              },
              {
                icon: <Users className="h-12 w-12 mb-4 text-accent" />,
                title: "Suporte Personalizado",
                description:
                  "Oferecemos suporte dedicado para garantir que seu projeto seja personalizado de acordo com suas necessidades específicas.",
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * index + 0.6 }}
                className="glass-card-modern p-8 rounded-2xl text-center card-hover"
              >
                <div className="flex justify-center">{item.icon}</div>
                <h3 className="text-xl font-bold mb-2 text-foreground">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="mb-24"
        >
          <h2 className="text-3xl font-bold mb-8 text-center gradient-text">Nossa Equipe</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {[
              {
                name: "Lorenço Alba",
                role: "Analista de Marketing & UX/UI",
                image: "/01.jpg",
                description:
                  "Especialista em estratégias de marketing digital e design de experiência do usuário, com foco em unir análise de dados e criatividade para criar interfaces intuitivas e visualmente atraentes. Atua liderando equipes multidisciplinares e desenvolvendo soluções orientadas à conversão e à experiência do cliente.",
              },
              {
                name: "Alexandre Maia",
                role: "Desenvolvedor",
                image: "/02.jpg",
                description:
                  "Desenvolvedor versátil com expertise em tecnologias front-end e back-end, implementando soluções técnicas robustas e escaláveis. Comprometido com performance, usabilidade e boas práticas de desenvolvimento em todos os projetos que realiza.",
              },
            ].map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * index + 0.8 }}
                className="glass-card-modern rounded-2xl overflow-hidden card-hover"
              >
                <div className="relative h-64 w-full">
                  <Image
                    src={member.image || "/placeholder.svg"}
                    alt={member.name}
                    fill
                    className="object-cover object-center"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-1">{member.name}</h3>
                  <p className="text-accent mb-4">{member.role}</p>
                  <p className="text-muted-foreground">{member.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1 }}
        >
          <div className="glass-card-modern rounded-2xl p-8 md:p-12 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 gradient-text">Pronto para um Site Exclusivo?</h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Explore nosso portfólio de projetos para ver exemplos do nosso trabalho e solicite um orçamento para um
              site totalmente personalizado para o seu negócio.
            </p>
            <Link href="/projetos" className="btn-modern-filled inline-flex items-center text-lg">
              Ver Projetos <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

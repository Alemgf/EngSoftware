'use client'

import Link from 'next/link'
import { CheckCircle2, ArrowRight, FolderKanban } from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'

export default function SolicitacaoEnviadaPage() {
  return (
    <div className="pt-32 pb-24 relative overflow-hidden">
      <div className="blob-shape-2 w-[400px] h-[400px] top-0 right-0 opacity-20 absolute -z-10" />
      <div className="dot-pattern" />
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto text-center"
        >
          <div className="mb-8 flex justify-center">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary/30">
              <CheckCircle2 className="h-10 w-10 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 gradient-text">
            Solicitação enviada com sucesso!
          </h1>
          <p className="text-muted-foreground text-lg mb-10">
            Recebemos sua mensagem e entraremos em contato em até 24 horas úteis.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button asChild className="btn-modern-filled">
              <Link href="/projetos" className="inline-flex items-center gap-2">
                <FolderKanban className="h-4 w-4" />
                Ver projetos
              </Link>
            </Button>
            <Button asChild variant="outline" className="border-accent/30 hover:bg-accent/10">
              <Link href="/" className="inline-flex items-center gap-2">
                Início
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

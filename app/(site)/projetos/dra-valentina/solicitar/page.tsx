"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function SolicitarDraValentinaPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirecionar para a página de solicitação de orçamento com o projeto como parâmetro
    router.push("/solicitar-orcamento?projeto=dra-valentina")
  }, [router])

  return (
    <div className="pt-32 pb-24 flex items-center justify-center">
      <div className="animate-pulse">
        <div className="h-8 w-32 bg-muted rounded mb-4"></div>
        <div className="h-12 w-64 bg-muted rounded mb-8"></div>
        <div className="h-64 w-full max-w-3xl bg-muted rounded"></div>
      </div>
    </div>
  )
}

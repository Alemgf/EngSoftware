'use client'

import type React from 'react'
import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Image from 'next/image'
import { User, Briefcase, Calendar, Check, Send } from 'lucide-react'
import { motion } from 'framer-motion'
import { createSupabaseClient } from '@/lib/supabase/client'

import { BackButton } from '@/components/BackButton'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { toast } from '@/components/ui/use-toast'
import { saveOrcamento } from '../../../solicitar-orcamento/actions'

const supabase = createSupabaseClient()

type Projeto = {
  id: string
  nome: string
  categorias: string[]
  complexidade?: string | null
  faixa_preco_min?: number | null
  faixa_preco_max?: number | null
  thumb_url?: string | null
}

type FormData = {
  name: string
  email: string
  phone: string
  businessArea: string
  objective: string
  deadline: string
  budget: string
}

function formatDateForInput() {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export default function SolicitarPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()

  const [project, setProject] = useState<Projeto | null>(null)
  const [loadingProj, setLoadingProj] = useState(true)

  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    businessArea: '',
    objective: '',
    deadline: '',
    budget: '',
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    ;(async () => {
      const { data, error } = await supabase
        .from('projetos')
        .select(`
          id,
          nome,
          complexidade,
          faixa_preco_min,
          faixa_preco_max,
          projetos_imagens(url, principal),
          projetos_categorias(categorias(nome))
        `)
        .eq('id', id)
        .single()

      if (error || !data) {
        setLoadingProj(false)
        return
      }

      const thumb =
        data.projetos_imagens?.find((i: { principal?: boolean }) => i.principal)?.url ??
        data.projetos_imagens?.[0]?.url ??
        null

      setProject({
        id: data.id,
        nome: data.nome,
        categorias: data.projetos_categorias?.map((p: { categorias?: { nome: string } }) => p.categorias?.nome) ?? [],
        complexidade: data.complexidade,
        faixa_preco_min: data.faixa_preco_min,
        faixa_preco_max: data.faixa_preco_max,
        thumb_url: thumb,
      })
      setLoadingProj(false)
    })()
  }, [id])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[name]
        return next
      })
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.name.trim()) newErrors.name = 'Nome é obrigatório'
    if (!formData.email.trim()) newErrors.email = 'Email é obrigatório'
    else if (!/^\S+@\S+\.\S+$/.test(formData.email)) newErrors.email = 'Email inválido'
    if (!formData.phone.trim()) newErrors.phone = 'Telefone é obrigatório'
    if (!formData.businessArea.trim()) newErrors.businessArea = 'Área de atuação é obrigatória'
    if (!formData.objective.trim()) newErrors.objective = 'Objetivo é obrigatório'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!project) return

    if (!validateForm()) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Preencha todos os campos marcados com *.',
        variant: 'destructive',
      })
      return
    }

    setIsSubmitting(true)

    try {
      const serverFormData = new FormData()
      serverFormData.append('name', formData.name)
      serverFormData.append('email', formData.email)
      serverFormData.append('phone', formData.phone)
      serverFormData.append('business_area', formData.businessArea)
      serverFormData.append('objective', formData.objective)
      if (formData.deadline) serverFormData.append('deadline', formData.deadline)
      if (formData.budget) serverFormData.append('budget', formData.budget)
      serverFormData.append('reference_project', project.id)

      const result = await saveOrcamento(serverFormData)

      if (result.success) {
        setIsSubmitted(true)
        toast({
          title: 'Orçamento enviado com sucesso!',
          description: `Seu número de referência é: ${result.referenceId}`,
        })
        setTimeout(() => {
          router.push('/projetos/solicitacao-enviada')
        }, 2000)
      } else {
        toast({
          title: 'Erro ao enviar orçamento',
          description: result.message || 'Ocorreu um erro ao enviar o formulário. Por favor, tente novamente.',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Erro ao enviar formulário:', error)
      toast({
        title: 'Erro ao enviar orçamento',
        description: 'Ocorreu um erro ao enviar o formulário. Por favor, tente novamente.',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loadingProj) {
    return (
      <div className="container py-20 text-center">
        <p className="text-muted-foreground">Carregando dados…</p>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="container py-20">
        <div className="mb-8">
          <BackButton href="/projetos" label="Voltar para Projetos" />
        </div>
        <div className="text-center">
          <h1 className="mb-4 text-3xl font-bold">Projeto não encontrado</h1>
          <p className="text-muted-foreground">O projeto solicitado não existe ou não está disponível.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="py-32 relative overflow-hidden">
      <div className="blob-shape-2 w-[400px] h-[400px] top-0 left-0 opacity-20 absolute -z-10" />
      <div className="dot-pattern" />
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="mb-8">
          <BackButton href={`/projetos/${project.id}`} label={`Voltar para ${project.nome}`} />
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="mb-12 flex flex-wrap items-center gap-6">
            {project.thumb_url && (
              <div className="relative h-20 w-20 overflow-hidden rounded-full border-2 border-accent/30">
                <Image src={project.thumb_url} alt="" fill className="object-cover" />
              </div>
            )}
            <div>
              <h1 className="text-4xl font-bold md:text-6xl gradient-text">Solicitar Orçamento</h1>
              <p className="mt-2 text-muted-foreground">
                Preencha o formulário para solicitar um orçamento inspirado em {project.nome}
              </p>
            </div>
          </div>

          <div className="grid gap-12 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit} className="glass-card-modern p-8 rounded-2xl space-y-6">
                <h2 className="text-2xl font-bold mb-2 flex items-center text-foreground">
                  <User className="mr-2 h-5 w-5 text-accent" /> Dados do Cliente
                </h2>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Nome Completo *</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Seu nome completo"
                      className={`mt-1 bg-secondary/50 border-accent/20 focus:border-accent focus:ring-accent/30 ${errors.name ? 'border-red-500' : ''}`}
                    />
                    {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                  </div>

                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="seu.email@exemplo.com"
                      className={`mt-1 bg-secondary/50 border-accent/20 focus:border-accent focus:ring-accent/30 ${errors.email ? 'border-red-500' : ''}`}
                    />
                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                  </div>

                  <div>
                    <Label htmlFor="phone">Telefone / WhatsApp *</Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="(00) 00000-0000"
                      className={`mt-1 bg-secondary/50 border-accent/20 focus:border-accent focus:ring-accent/30 ${errors.phone ? 'border-red-500' : ''}`}
                    />
                    {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                  </div>
                </div>

                <h2 className="text-2xl font-bold mt-6 mb-2 flex items-center text-foreground">
                  <Briefcase className="mr-2 h-5 w-5 text-accent" /> Sobre o Projeto
                </h2>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="businessArea">Área de Atuação *</Label>
                    <Input
                      id="businessArea"
                      name="businessArea"
                      value={formData.businessArea}
                      onChange={handleChange}
                      placeholder="Ex: Clínica, E-commerce, Consultoria..."
                      className={`mt-1 bg-secondary/50 border-accent/20 focus:border-accent focus:ring-accent/30 ${errors.businessArea ? 'border-red-500' : ''}`}
                    />
                    {errors.businessArea && <p className="text-red-500 text-sm mt-1">{errors.businessArea}</p>}
                  </div>

                  <div>
                    <Label htmlFor="objective">Objetivo com o Website *</Label>
                    <Textarea
                      id="objective"
                      name="objective"
                      value={formData.objective}
                      onChange={handleChange}
                      placeholder="Descreva o que você espera alcançar com este website"
                      className={`mt-1 min-h-[120px] bg-secondary/50 border-accent/20 focus:border-accent focus:ring-accent/30 ${errors.objective ? 'border-red-500' : ''}`}
                    />
                    {errors.objective && <p className="text-red-500 text-sm mt-1">{errors.objective}</p>}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="deadline">Prazo Desejado</Label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="deadline"
                          name="deadline"
                          type="date"
                          value={formData.deadline}
                          onChange={handleChange}
                          min={formatDateForInput()}
                          className="pl-10 mt-1 bg-secondary/50 border-accent/20 focus:border-accent focus:ring-accent/30"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="budget">Orçamento (opcional)</Label>
                      <Input
                        id="budget"
                        name="budget"
                        value={formData.budget}
                        onChange={handleChange}
                        placeholder="Seu orçamento disponível"
                        className="mt-1 bg-secondary/50 border-accent/20 focus:border-accent focus:ring-accent/30"
                      />
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting || isSubmitted}
                  className={`w-full btn-modern-filled ${isSubmitted ? '!bg-green-600 hover:!bg-green-700' : ''}`}
                >
                  {isSubmitting ? (
                    <span className="flex items-center">
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Enviando solicitação...
                    </span>
                  ) : isSubmitted ? (
                    <span className="flex items-center">
                      <Check className="mr-2 h-5 w-5" /> Solicitação enviada!
                    </span>
                  ) : (
                    <span className="flex items-center">
                      Enviar Orçamento <Send className="ml-2 h-5 w-5" />
                    </span>
                  )}
                </Button>
              </form>
            </div>

            <div className="space-y-8">
              <div className="glass-card-modern rounded-2xl p-6">
                <h2 className="mb-6 text-2xl font-bold text-foreground">Resumo do Projeto</h2>
                <div className="space-y-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Projeto:</span>
                    <span className="font-medium">{project.nome}</span>
                  </div>
                  {project.categorias.length > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Categoria:</span>
                      <span className="font-medium">{project.categorias.join(', ')}</span>
                    </div>
                  )}
                  {project.complexidade && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Complexidade:</span>
                      <span className="font-medium">{project.complexidade}</span>
                    </div>
                  )}
                  {(project.faixa_preco_min ?? project.faixa_preco_max) && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Faixa de preço:</span>
                      <span className="font-medium">
                        {project.faixa_preco_min ? `R$ ${project.faixa_preco_min}` : '—'}
                        {project.faixa_preco_max ? ` - R$ ${project.faixa_preco_max}` : ''}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="glass-card-modern rounded-2xl p-6">
                <h2 className="mb-4 text-xl font-bold text-foreground">Processo de Desenvolvimento</h2>
                <ol className="list-decimal list-inside space-y-3 text-muted-foreground">
                  <li>Envie este formulário</li>
                  <li>Contato em até 24 h úteis</li>
                  <li>Reunião de briefing</li>
                  <li>Proposta de orçamento e cronograma</li>
                  <li>Início do desenvolvimento</li>
                  <li>Apresentação e ajustes</li>
                  <li>Entrega e publicação</li>
                </ol>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

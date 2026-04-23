'use client'

import type React from 'react'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Mail, Phone, MapPin, Send, User, Briefcase, Calendar, Check } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { toast } from '@/components/ui/use-toast'
import { saveOrcamento } from '../solicitar-orcamento/actions'

type FormDataContato = {
  name: string
  email: string
  phone: string
  businessArea: string
  objective: string
  deadline: string
  budget: string
}

export default function ContatoPage() {
  const router = useRouter()

  const [formData, setFormData] = useState<FormDataContato>({
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
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
      console.error('Erro ao enviar formulário de contato:', error)
      toast({
        title: 'Erro ao enviar orçamento',
        description: 'Ocorreu um erro ao enviar o formulário. Por favor, tente novamente.',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatDateForInput = () => {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  return (
    <div className="pt-32 pb-24 relative overflow-hidden">
      <div className="blob-shape-2 w-[400px] h-[400px] top-0 left-0 opacity-20 absolute -z-10" />
      <div className="dot-pattern" />
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto mb-16 text-center"
        >
          <span className="badge-modern mb-6 inline-flex">Contato</span>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 gradient-text">Conte-nos seus objetivos</h1>
          <p className="text-xl text-muted-foreground">
            Preencha os dados abaixo e retornaremos com uma proposta personalizada para o seu projeto.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h2 className="text-3xl font-bold mb-8 gradient-text">Informações de Contato</h2>

            <div className="space-y-6 mb-12">
              <div className="flex items-start">
                <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mr-4 flex-shrink-0 border border-accent/20">
                  <Mail className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-1">Email</h3>
                  <p className="text-muted-foreground">landingstudiopro@gmail.com</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mr-4 flex-shrink-0 border border-accent/20">
                  <Phone className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-1">Telefone</h3>
                  <p className="text-muted-foreground">+55 (27) 998170613</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mr-4 flex-shrink-0 border border-accent/20">
                  <MapPin className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-1">Localização</h3>
                  <p className="text-muted-foreground">Espírito Santo, Brasil</p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
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
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
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
          </motion.div>
        </div>
      </div>
    </div>
  )
}


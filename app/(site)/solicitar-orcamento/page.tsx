"use client"

import type React from "react"

import { useState, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { BackButton } from "@/components/BackButton"
import { Upload, X, Check, Calendar, Phone, Mail, User, Briefcase, FileText } from "lucide-react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { saveOrcamento } from "./actions"

// Tipos para o formulário e projetos
type FormData = {
  name: string
  email: string
  phone: string
  businessArea: string
  objective: string
  deadline: string
  budget: string
  referenceProject: string
}

type Project = {
  id: string
  title: string
  category: string
  complexity: string
  priceRange: string
  deliveryTime: string
  color: string
  image: string
}

// Dados de projetos disponíveis
const availableProjects: Record<string, Project> = {
  "vix-design": {
    id: "vix-design",
    title: "Vix Design",
    category: "Interiores",
    complexity: "Básico",
    priceRange: "R$ 1.500 - R$ 2.500",
    deliveryTime: "2-3 semanas",
    color: "bg-accent",
    image: "/images/vix-design-hero.png",
  },
  "dra-valentina": {
    id: "dra-valentina",
    title: "Odontologia & Estética Dr.Valentina",
    category: "Saúde",
    complexity: "Básico",
    priceRange: "R$ 1.500 - R$ 2.500",
    deliveryTime: "2-3 semanas",
    color: "bg-accent",
    image: "/images/dra-valentina-hero.jpg",
  },
}

export default function SolicitarOrcamentoPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Obter o projeto de referência da URL, se existir
  const projectId = searchParams.get("projeto")
  const referenceProject = projectId ? availableProjects[projectId] : null

  // Estado do formulário
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    businessArea: "",
    objective: "",
    deadline: "",
    budget: referenceProject ? `Faixa de preço estimada: ${referenceProject.priceRange}` : "",
    referenceProject: projectId || "",
  })

  const [files, setFiles] = useState<File[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Manipuladores de eventos
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Limpar erro quando o campo for preenchido
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Limpar erro quando o campo for preenchido
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      setFiles((prev) => [...prev, ...newFiles])
    }
  }

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  // Validação do formulário
  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) newErrors.name = "Nome é obrigatório"
    if (!formData.email.trim()) newErrors.email = "Email é obrigatório"
    else if (!/^\S+@\S+\.\S+$/.test(formData.email)) newErrors.email = "Email inválido"
    if (!formData.phone.trim()) newErrors.phone = "Telefone é obrigatório"
    if (!formData.businessArea.trim()) newErrors.businessArea = "Área de atuação é obrigatória"
    if (!formData.objective.trim()) newErrors.objective = "Objetivo é obrigatório"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Envio do formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsSubmitting(true)

    try {
      // Criar um FormData para enviar ao servidor
      const serverFormData = new FormData()
      serverFormData.append("name", formData.name)
      serverFormData.append("email", formData.email)
      serverFormData.append("phone", formData.phone)
      serverFormData.append("business_area", formData.businessArea)
      serverFormData.append("objective", formData.objective)
      if (formData.deadline) serverFormData.append("deadline", formData.deadline)
      if (formData.budget) serverFormData.append("budget", formData.budget)
      if (formData.referenceProject) serverFormData.append("reference_project", formData.referenceProject)

      // Enviar dados para o servidor
      const result = await saveOrcamento(serverFormData)

      if (result.success) {
        setIsSubmitted(true)

        // Mostrar toast de sucesso
        toast({
          title: "Orçamento enviado com sucesso!",
          description: `Seu número de referência é: ${result.referenceId}`,
        })

        // Redirecionamento após envio bem-sucedido
        setTimeout(() => {
          router.push("/projetos/solicitacao-enviada")
        }, 2000)
      } else {
        toast({
          title: "Erro ao enviar orçamento",
          description: result.message || "Ocorreu um erro ao enviar o formulário. Por favor, tente novamente.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Erro ao enviar formulário:", error)
      toast({
        title: "Erro ao enviar orçamento",
        description: "Ocorreu um erro ao enviar o formulário. Por favor, tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Formatação de data para o input
  const formatDateForInput = () => {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, "0")
    const day = String(today.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
  }

  return (
    <div className="pt-32 pb-24 relative overflow-hidden">
      <div className="blob-shape-2 w-[400px] h-[400px] top-0 right-0 opacity-20 absolute -z-10" />
      <div className="dot-pattern" />
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="mb-8">
          <BackButton
            href={referenceProject ? `/projetos/${projectId}` : "/projetos"}
            label={referenceProject ? `Voltar para ${referenceProject.title}` : "Voltar para Projetos"}
          />
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="flex flex-wrap items-center gap-4 mb-8">
            <div
              className={`w-16 h-16 ${referenceProject ? referenceProject.color : "bg-accent"} rounded-full flex items-center justify-center border-2 border-accent/50`}
            >
              <span className="text-2xl font-bold text-white">
                {referenceProject ? referenceProject.title.charAt(0) : "O"}
              </span>
            </div>
            <div>
              <h1 className="text-4xl md:text-6xl font-bold gradient-text">Solicitar Orçamento</h1>
              <p className="text-muted-foreground mt-2">
                {referenceProject
                  ? `Preencha o formulário abaixo para solicitar um orçamento personalizado inspirado no projeto ${referenceProject.title}`
                  : "Preencha o formulário abaixo para solicitar um orçamento personalizado para o seu projeto"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-16">
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="space-y-6">
                  {/* Informações Pessoais */}
                  <div className="glass-card-modern p-6 rounded-2xl">
                    <h2 className="text-xl font-bold mb-4 flex items-center text-foreground">
                      <User className="mr-2 h-5 w-5 text-accent" /> Informações Pessoais
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <Label htmlFor="name" className="flex items-center">
                          Nome Completo <span className="text-red-500 ml-1">*</span>
                        </Label>
                        <Input
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="Seu nome completo"
                          className={`mt-1 bg-secondary/50 border-accent/20 focus:border-accent focus:ring-accent/30 ${errors.name ? "border-red-500" : ""}`}
                        />
                        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                      </div>

                      <div>
                        <Label htmlFor="email" className="flex items-center">
                          Email <span className="text-red-500 ml-1">*</span>
                        </Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="seu.email@exemplo.com"
                            className={`pl-10 mt-1 bg-secondary/50 border-accent/20 focus:border-accent focus:ring-accent/30 ${errors.email ? "border-red-500" : ""}`}
                          />
                        </div>
                        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                      </div>

                      <div>
                        <Label htmlFor="phone" className="flex items-center">
                          Telefone <span className="text-red-500 ml-1">*</span>
                        </Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="(00) 00000-0000"
                            className={`pl-10 mt-1 bg-secondary/50 border-accent/20 focus:border-accent focus:ring-accent/30 ${errors.phone ? "border-red-500" : ""}`}
                          />
                        </div>
                        {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                      </div>
                    </div>
                  </div>

                  {/* Informações do Projeto */}
                  <div className="glass-card-modern p-6 rounded-2xl">
                    <h2 className="text-xl font-bold mb-4 flex items-center text-foreground">
                      <Briefcase className="mr-2 h-5 w-5 text-accent" /> Informações do Projeto
                    </h2>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="businessArea" className="flex items-center">
                          Área de Atuação <span className="text-red-500 ml-1">*</span>
                        </Label>
                        <Input
                          id="businessArea"
                          name="businessArea"
                          value={formData.businessArea}
                          onChange={handleChange}
                          placeholder="Ex: Marketing, Saúde, Educação, etc."
                          className={`mt-1 bg-secondary/50 border-accent/20 focus:border-accent focus:ring-accent/30 ${errors.businessArea ? "border-red-500" : ""}`}
                        />
                        {errors.businessArea && <p className="text-red-500 text-sm mt-1">{errors.businessArea}</p>}
                      </div>

                      <div>
                        <Label htmlFor="objective" className="flex items-center">
                          Objetivo com o Website <span className="text-red-500 ml-1">*</span>
                        </Label>
                        <Textarea
                          id="objective"
                          name="objective"
                          value={formData.objective}
                          onChange={handleChange}
                          placeholder="Descreva o que você espera alcançar com este website"
                          className={`mt-1 min-h-[120px] bg-secondary/50 border-accent/20 focus:border-accent focus:ring-accent/30 ${errors.objective ? "border-red-500" : ""}`}
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

                      {!referenceProject && (
                        <div>
                          <Label htmlFor="referenceProject">Projeto de Referência (opcional)</Label>
                          <Select
                            value={formData.referenceProject}
                            onValueChange={(value) => {
                              handleSelectChange("referenceProject", value)
                              // Atualizar o orçamento com base no projeto selecionado
                              if (value && value !== "none") {
                                const selectedProject = availableProjects[value]
                                handleSelectChange("budget", `Faixa de preço estimada: ${selectedProject.priceRange}`)
                              }
                            }}
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="Selecione um projeto como referência" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">Nenhum</SelectItem>
                              {Object.values(availableProjects).map((project) => (
                                <SelectItem key={project.id} value={project.id}>
                                  {project.title} - {project.category}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Documentos Adicionais */}
                  <div className="glass-card-modern p-6 rounded-2xl">
                    <h2 className="text-xl font-bold mb-4 flex items-center text-foreground">
                      <FileText className="mr-2 h-5 w-5 text-accent" /> Documentos Adicionais (opcional)
                    </h2>
                    <div>
                      <div className="mt-1 border-2 border-dashed border-accent/20 rounded-lg p-6 text-center cursor-pointer hover:border-accent/50 transition-colors">
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} multiple className="hidden" />
                        <div
                          onClick={() => fileInputRef.current?.click()}
                          className="flex flex-col items-center justify-center"
                        >
                          <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                          <p className="text-muted-foreground mb-1">
                            Clique para fazer upload ou arraste e solte arquivos aqui
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Suporta imagens, PDFs, documentos Word/Excel (máx. 10MB cada)
                          </p>
                        </div>
                      </div>

                      {files.length > 0 && (
                        <div className="mt-4 space-y-2">
                          <p className="text-sm font-medium">Arquivos anexados:</p>
                          {files.map((file, index) => (
                            <div key={index} className="flex items-center justify-between bg-secondary p-2 rounded-md">
                              <span className="text-sm truncate max-w-[80%]">{file.name}</span>
                              <button
                                type="button"
                                onClick={() => removeFile(index)}
                                className="text-muted-foreground hover:text-primary"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting || isSubmitted}
                  className={`w-full btn-modern-filled ${
                    isSubmitted ? "!bg-green-600 hover:!bg-green-700" : ""
                  }`}
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
                    "Solicitar Orçamento"
                  )}
                </Button>
              </form>
            </div>

            <div className="space-y-8">
              {/* Resumo do Projeto de Referência */}
              {referenceProject && (
                <div className="glass-card-modern rounded-2xl p-6">
                  <h2 className="text-2xl font-bold mb-6 text-foreground">Projeto de Referência</h2>
                  <div className="relative w-full aspect-video rounded-lg overflow-hidden mb-6">
                    <Image
                      src={referenceProject.image || "/placeholder.svg"}
                      alt={referenceProject.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Projeto:</span>
                      <span className="font-medium">{referenceProject.title}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Categoria:</span>
                      <span className="font-medium">{referenceProject.category}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Nível de Complexidade:</span>
                      <span className="font-medium">{referenceProject.complexity}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Faixa de Preço Estimada:</span>
                      <span className="font-medium">{referenceProject.priceRange}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tempo de Entrega Estimado:</span>
                      <span className="font-medium">{referenceProject.deliveryTime}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Processo de Desenvolvimento */}
              <div className="glass-card-modern rounded-2xl p-6">
                <h2 className="text-xl font-bold mb-4 text-foreground">Processo de Desenvolvimento</h2>
                <ol className="space-y-4 list-decimal list-inside text-muted-foreground">
                  <li>Envie este formulário com suas necessidades</li>
                  <li>Nossa equipe entrará em contato em até 24 horas úteis</li>
                  <li>Realizamos uma reunião de briefing detalhado</li>
                  <li>Enviamos uma proposta com orçamento e cronograma</li>
                  <li>Após aprovação, iniciamos o desenvolvimento do seu site exclusivo</li>
                  <li>Apresentamos o projeto para aprovação e ajustes</li>
                  <li>Entregamos seu site pronto para publicação</li>
                </ol>
              </div>

              {/* Garantias */}
              <div className="glass-card-modern rounded-2xl p-6">
                <h2 className="text-xl font-bold mb-4 text-foreground">Nossas Garantias</h2>
                <div className="space-y-3">
                  <div className="flex items-start">
                    <Check className="h-5 w-5 text-accent mt-0.5 mr-2 flex-shrink-0" />
                    <p>Orçamento transparente sem custos ocultos</p>
                  </div>
                  <div className="flex items-start">
                    <Check className="h-5 w-5 text-accent mt-0.5 mr-2 flex-shrink-0" />
                    <p>Prazo de entrega garantido</p>
                  </div>
                  <div className="flex items-start">
                    <Check className="h-5 w-5 text-accent mt-0.5 mr-2 flex-shrink-0" />
                    <p>Suporte técnico por 30 dias após a entrega</p>
                  </div>
                  <div className="flex items-start">
                    <Check className="h-5 w-5 text-accent mt-0.5 mr-2 flex-shrink-0" />
                    <p>Treinamento para gerenciamento do conteúdo</p>
                  </div>
                  <div className="flex items-start">
                    <Check className="h-5 w-5 text-accent mt-0.5 mr-2 flex-shrink-0" />
                    <p>Satisfação garantida</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

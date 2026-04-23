/* ------------------------------------------------------------------------- */
/* /app/admin/orcamentos/page.tsx                                            */
/* ------------------------------------------------------------------------- */
'use client'

import type React from 'react'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Eye, Trash, Search, Filter, Download, ArrowUpDown, CheckCircle, Clock,
  AlertCircle, Calendar, Mail, LogOut, PlusCircle
} from 'lucide-react'

import { Button }   from '@/components/ui/button'
import { Input }    from '@/components/ui/input'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from '@/components/ui/use-toast'

import { getOrcamentos, deleteOrcamento } from './actions'
import { logout } from '@/lib/auth'

/* ------------------------------------------------------------------------- */
/* Tipagens                                                                  */
/* ------------------------------------------------------------------------- */
type OrcamentoStatus =
  | 'novo'
  | 'em_analise'
  | 'proposta_enviada'
  | 'aprovado'
  | 'recusado'
  | 'concluido'

interface Orcamento {
  id: string
  reference_id: string
  name: string
  email: string
  phone: string
  business_area: string
  objective: string
  deadline: string | null
  budget: string | null
  reference_project: string | null  // uuid
  projetos?: { nome: string } | null // join com projetos
  status: OrcamentoStatus
  created_at: string
  updated_at: string
  files: any | null
}

/* ------------------------------------------------------------------------- */
/* Mapeamento de status                                                      */
/* ------------------------------------------------------------------------- */
const statusMap: Record<
  OrcamentoStatus,
  { label: string; color: string; icon: React.ReactNode }
> = {
  novo: {
    label: 'Novo',
    color: 'bg-blue-500 hover:bg-blue-600',
    icon: <Clock className="h-4 w-4 mr-1" />,
  },
  em_analise: {
    label: 'Em Análise',
    color: 'bg-yellow-500 hover:bg-yellow-600',
    icon: <AlertCircle className="h-4 w-4 mr-1" />,
  },
  proposta_enviada: {
    label: 'Proposta Enviada',
    color: 'bg-purple-500 hover:bg-purple-600',
    icon: <Mail className="h-4 w-4 mr-1" />,
  },
  aprovado: {
    label: 'Aprovado',
    color: 'bg-green-500 hover:bg-green-600',
    icon: <CheckCircle className="h-4 w-4 mr-1" />,
  },
  recusado: {
    label: 'Recusado',
    color: 'bg-red-500 hover:bg-red-600',
    icon: <Trash className="h-4 w-4 mr-1" />,
  },
  concluido: {
    label: 'Concluído',
    color: 'bg-gray-500 hover:bg-gray-600',
    icon: <CheckCircle className="h-4 w-4 mr-1" />,
  },
}

/* ------------------------------------------------------------------------- */
/* Componente                                                                */
/* ------------------------------------------------------------------------- */
export default function OrcamentosPage() {
  const router = useRouter()

  const [orcamentos, setOrcamentos] = useState<Orcamento[]>([])
  const [isLoading, setIsLoading]   = useState(true)

  const [searchTerm,   setSearchTerm]   = useState('')
  const [statusFilter, setStatusFilter] = useState('todos')
  const [dateFilter,   setDateFilter]   = useState('todos')

  const [sortConfig, setSortConfig] = useState<{
    key: keyof Orcamento
    direction: 'asc' | 'desc'
  }>({ key: 'created_at', direction: 'desc' })

  /* ----------------------- Helper: Nome do Projeto ----------------------- */
  const getProjectName = (orcamento: Orcamento): string => {
    // O Supabase pode retornar projetos como objeto único ou array
    if (Array.isArray(orcamento.projetos)) {
      return orcamento.projetos[0]?.nome ?? (orcamento.reference_project ? 'Projeto não encontrado' : '—')
    }
    return orcamento.projetos?.nome ?? (orcamento.reference_project ? 'Projeto não encontrado' : '—')
  }

  /* ----------------------- Carregar orçamentos ----------------------- */
  useEffect(() => {
    const fetch = async () => {
      setIsLoading(true)
      try {
        const res = await getOrcamentos()
        if (res.success) setOrcamentos(res.data as Orcamento[])
        else
          toast({
            title: 'Erro ao carregar orçamentos',
            description: res.message,
            variant: 'destructive',
          })
      } catch (err) {
        console.error(err)
        toast({
          title: 'Erro ao carregar orçamentos',
          description: 'Falha inesperada; tente novamente.',
          variant: 'destructive',
        })
      } finally {
        setIsLoading(false)
      }
    }
    fetch()
  }, [])

  /* ---------------- Filtragem & Ordenação --------------------------- */
  const filtered = orcamentos.filter(o => {
    const search = searchTerm.toLowerCase()
    const matchesSearch =
      o.name.toLowerCase().includes(search) ||
      o.email.toLowerCase().includes(search) ||
      o.business_area.toLowerCase().includes(search) ||
      o.reference_id.toLowerCase().includes(search) ||
      getProjectName(o).toLowerCase().includes(search)

    const matchesStatus = statusFilter === 'todos' || o.status === statusFilter

    const matchesDate = (() => {
      if (dateFilter === 'todos') return true
      const created = new Date(o.created_at)
      const today   = new Date()
      today.setHours(0,0,0,0)
      const diffDays = (ms: number) => new Date(today.getTime() - ms)

      switch (dateFilter) {
        case 'hoje':   return created.toDateString() === today.toDateString()
        case 'ontem':  return created.toDateString() === diffDays(864e5).toDateString()
        case 'semana': return created >= diffDays(6 * 864e5)
        case 'mes':    return created >= diffDays(29 * 864e5)
        default:       return true
      }
    })()

    return matchesSearch && matchesStatus && matchesDate
  })

  const sorted = [...filtered].sort((a, b) => {
    if (a[sortConfig.key]! < b[sortConfig.key]!) return sortConfig.direction === 'asc' ? -1 : 1
    if (a[sortConfig.key]! > b[sortConfig.key]!) return sortConfig.direction === 'asc' ? 1 : -1
    return 0
  })

  const requestSort = (key: keyof Orcamento) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }))
  }

  /* -------------------- Helper de data ------------------------------ */
  const fmt = (d: string) =>
    new Intl.DateTimeFormat('pt-BR', {
      day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit'
    }).format(new Date(d))

  /* ------------------- Delete -------------------- */
  const remove = async (id:string) => {
    const res = await deleteOrcamento(id)
    if (!res.success) {
      toast({ title:'Erro', description:res.message, variant:'destructive' })
      return
    }
    setOrcamentos(prev => prev.filter(o => o.id !== id))
    toast({ title:'Orçamento excluído' })
  }

  /* --------------------- Render ------------------------------------- */
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 md:px-6 py-8">
        <motion.div
          initial={{ opacity:0, y:20 }}
          animate={{ opacity:1, y:0 }}
          transition={{ duration:0.5 }}
        >
          {/* Cabeçalho -------------------------------------------------- */}
          <header className="mb-8 flex flex-col md:flex-row justify-between gap-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-2">Gerenciamento de Orçamentos</h1>
              <p className="text-muted-foreground text-lg">
                Gerencie e acompanhe todas as solicitações de orçamento.
              </p>
            </div>
            <div className="flex gap-2 shrink-0">
              <Button
                size="lg"
                className="shadow-md hover:shadow-lg transition-shadow"
                onClick={() => router.push('/admin/orcamentos/novo')}
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Novo Orçamento
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="shadow-md hover:shadow-lg transition-shadow"
                onClick={() => {
                  const headers = ['ID','Nome','Email','Telefone','Área','Status','Data']
                  const csv = [
                    headers.join(','),
                    ...orcamentos.map(o => [
                      o.reference_id, o.name, o.email, o.phone,
                      o.business_area, statusMap[o.status].label, fmt(o.created_at)
                    ].join(','))
                  ].join('\n')
                  const blob = new Blob([csv],{type:'text/csv;charset=utf-8;'})
                  const url  = URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = `orcamentos_${new Date().toISOString().slice(0,10)}.csv`
                  a.click()
                }}
              >
                <Download className="mr-2 h-4 w-4" /> Exportar Dados
              </Button>
              <Button variant="ghost" size="lg" onClick={async()=>{ await logout(); router.push('/admin/login') }}>
                <LogOut className="mr-2 h-4 w-4" /> Sair
              </Button>
            </div>
          </header>

          {/* Lista de Orçamentos */}
          <Card className="mb-8 shadow-lg border-2">
                <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar por nome, email, área ou ID"
                      value={searchTerm}
                      onChange={e=>setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  <div className="w-full md:w-48">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger>
                        <Filter className="mr-2 h-4 w-4" />
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todos os status</SelectItem>
                        {Object.keys(statusMap).map(s=>(
                          <SelectItem key={s} value={s}>{statusMap[s as OrcamentoStatus].label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="w-full md:w-48">
                    <Select value={dateFilter} onValueChange={setDateFilter}>
                      <SelectTrigger>
                        <Calendar className="mr-2 h-4 w-4" />
                        <SelectValue placeholder="Período" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todos os períodos</SelectItem>
                        <SelectItem value="hoje">Hoje</SelectItem>
                        <SelectItem value="ontem">Ontem</SelectItem>
                        <SelectItem value="semana">Últimos 7 dias</SelectItem>
                        <SelectItem value="mes">Último mês</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Tabela */}
                <div className="rounded-lg border-2 overflow-hidden shadow-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {['reference_id','name','business_area','created_at','status'].map((col,i)=>(
                          <TableHead key={col} className={i===1?'':'hidden md:table-cell'}>
                            <button onClick={()=>requestSort(col as keyof Orcamento)} className="flex items-center">
                              {col==='reference_id' ? 'ID'
                               : col==='name'        ? 'Cliente'
                               : col==='business_area' ? 'Área'
                               : col==='created_at' ? 'Data'
                               : 'Status'}
                              <ArrowUpDown className="ml-1 h-3 w-3" />
                            </button>
                          </TableHead>
                        ))}
                        <TableHead>Projeto</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>

                    <TableBody>
                      {isLoading ? (
                        <TableRow>
                          <TableCell colSpan={7} className="py-8 text-center">
                            <svg className="h-8 w-8 animate-spin text-primary" viewBox="0 0 24 24" />
                          </TableCell>
                        </TableRow>
                      ) : sorted.length ? (
                        sorted.map(o=>(
                          <TableRow key={o.id}>
                            <TableCell className="font-medium">{o.reference_id}</TableCell>
                            <TableCell>
                              <div className="font-medium">{o.name}</div>
                              <div className="text-xs text-muted-foreground">{o.email}</div>
                            </TableCell>
                            <TableCell className="hidden md:table-cell">{o.business_area}</TableCell>
                            <TableCell className="hidden md:table-cell">{fmt(o.created_at)}</TableCell>
                            <TableCell>
                              <Badge className={`flex w-fit items-center ${statusMap[o.status].color}`}>
                                {statusMap[o.status].icon}
                                {statusMap[o.status].label}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {getProjectName(o)}
                            </TableCell>

                            {/* Ações ------------------------------------------------ */}
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="ghost" size="icon" title="Ver detalhes"
                                  asChild
                                >
                                  <Link href={`/admin/orcamentos/${o.id}`}>
                                    <Eye className="h-4 w-4" />
                                  </Link>
                                </Button>

                                {/* Edit e Delete (placeholder + delete real) */}
                                <Button variant="ghost" size="icon" title="Excluir"
                                  onClick={()=>remove(o.id)}
                                >
                                  <Trash className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                            Nenhum orçamento encontrado com os filtros atuais.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
                </CardContent>
              </Card>
        </motion.div>
      </div>
    </div>
  )
}


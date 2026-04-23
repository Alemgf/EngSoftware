'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, FileText, Clock, TrendingUp, ArrowRight, FolderKanban, LayoutList } from 'lucide-react'
import { motion } from 'framer-motion'
import { logout } from '@/lib/auth'
import { KeepAliveStatus } from '@/components/KeepAliveStatus'
import { getOrcamentos } from '../orcamentos/actions'

type OrcamentoStatus =
  | 'novo'
  | 'em_analise'
  | 'proposta_enviada'
  | 'aprovado'
  | 'recusado'
  | 'concluido'

type Orcamento = {
  id: string
  status: OrcamentoStatus
  email: string
  reference_project: string | null
  projetos?: { nome: string } | null
}

function getProjectName(o: Orcamento): string {
  if (Array.isArray(o.projetos)) {
    return o.projetos[0]?.nome ?? (o.reference_project ? 'Projeto não encontrado' : '—')
  }
  return o.projetos?.nome ?? (o.reference_project ? 'Projeto não encontrado' : '—')
}

export default function AdminPage() {
  const router = useRouter()
  const [orcamentos, setOrcamentos] = useState<Orcamento[]>([])
  const [stats, setStats] = useState({
    total: 0,
    novos: 0,
    clientesUnicos: 0,
    taxaConversao: 0,
  })

  useEffect(() => {
    const load = async () => {
      const res = await getOrcamentos()
      if (!res.success) return

      const data = res.data as Orcamento[]
      setOrcamentos(data)
      const total = data.length
      const novos = data.filter((o) => o.status === 'novo').length
      const aprovados = data.filter((o) => o.status === 'aprovado').length
      const clientesUnicos = new Set(data.map((o) => o.email)).size
      const taxaConversao = total ? Math.round((aprovados / total) * 100) : 0

      setStats({
        total,
        novos,
        clientesUnicos,
        taxaConversao,
      })
    }
    load()
  }, [])

  const projectCounts = orcamentos.reduce<Record<string, number>>((acc, o) => {
    const key = getProjectName(o)
    acc[key] = (acc[key] || 0) + 1
    return acc
  }, {})
  const topProjects = Object.entries(projectCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  const handleLogout = async () => {
    await logout()
    router.push('/')
  }

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 md:px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8"
        >
          <div>
            <h1 className="text-4xl md:text-5xl font-bold mb-2">Painel Administrativo</h1>
            <p className="text-muted-foreground">Gerencie seus projetos e orçamentos de forma eficiente</p>
          </div>
          <Button variant="outline" onClick={handleLogout} className="shrink-0">
            Sair
          </Button>
        </motion.div>

        {/* Keep Alive Status */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <KeepAliveStatus />
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <motion.div variants={fadeInUp}>
            <Card className="border-2 hover:border-primary/50 transition-colors shadow-lg hover:shadow-xl">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total de Orçamentos</CardTitle>
                <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.total}</div>
                <p className="text-xs text-muted-foreground mt-1">Todos os tempos</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={fadeInUp}>
            <Card className="border-2 hover:border-primary/50 transition-colors shadow-lg hover:shadow-xl">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Orçamentos Novos</CardTitle>
                <div className="h-10 w-10 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.novos}</div>
                <p className="text-xs text-muted-foreground mt-1">Aguardando análise</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={fadeInUp}>
            <Card className="border-2 hover:border-primary/50 transition-colors shadow-lg hover:shadow-xl">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Clientes Únicos</CardTitle>
                <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <Users className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.clientesUnicos}</div>
                <p className="text-xs text-muted-foreground mt-1">Total de contatos</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={fadeInUp}>
            <Card className="border-2 hover:border-primary/50 transition-colors shadow-lg hover:shadow-xl">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Taxa de Conversão</CardTitle>
                <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.taxaConversao}%</div>
                <p className="text-xs text-muted-foreground mt-1">Aprovados vs Total</p>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
          {/* Quick Actions */}
          <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"
        >
          <Card
            className="border-2 hover:border-primary/50 transition-all shadow-lg hover:shadow-xl group cursor-pointer"
            onClick={() => router.push('/admin/orcamentos')}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl mb-2">Gerenciar Orçamentos</CardTitle>
                  <CardDescription>Visualize, gerencie e acompanhe todas as solicitações de orçamento</CardDescription>
                </div>
                <div className="h-12 w-12 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors flex items-center justify-center">
                  <LayoutList className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button className="w-full group-hover:bg-primary/90" size="lg">
                Acessar <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

          <Card
            className="border-2 hover:border-primary/50 transition-all shadow-lg hover:shadow-xl group cursor-pointer"
            onClick={() => router.push('/admin/projetos')}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl mb-2">Gerenciar Projetos</CardTitle>
                  <CardDescription>Crie, edite e gerencie seus projetos de portfólio</CardDescription>
                </div>
                <div className="h-12 w-12 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors flex items-center justify-center">
                  <FolderKanban className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground" size="lg">
                Acessar <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </motion.div>


         {/* Projetos Mais Solicitados */}
         <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className=""
        >
          <Card className="border-2 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl">Projetos Mais Solicitados</CardTitle>
              <CardDescription>Top 5 projetos de referência mais solicitados</CardDescription>
            </CardHeader>
            <CardContent>
              {topProjects.length ? (
                <div className="space-y-4">
                  {topProjects.map(([name, count], index) => {
                    const pct = stats.total ? Math.round((count / stats.total) * 100) : 0
                    return (
                      <motion.div
                        key={name}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="space-y-2"
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{name}</span>
                          <span className="text-sm font-bold text-primary">{count} solicitações</span>
                        </div>
                        <div className="h-3 w-full bg-secondary rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.5, delay: index * 0.1 + 0.2 }}
                            className="h-full bg-gradient-to-r from-primary to-accent"
                          />
                        </div>
                        <p className="text-xs text-muted-foreground text-right">{pct}% do total</p>
                      </motion.div>
                    )
                  })}
                </div>
              ) : (
                <div className="py-12 text-center">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground">
                    Nenhum projeto de referência encontrado.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
       

       






  )
}

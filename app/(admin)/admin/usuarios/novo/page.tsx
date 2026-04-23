'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Check, User, Lock } from 'lucide-react'
import { AdminBackButton } from '@/components/ui/AdminBackButton'
import { createUsuario } from '../actions'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'

export default function NovoUsuarioPage() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    setError(null)

    const login = (formData.get('login') as string)?.trim()
    const senha = (formData.get('senha') as string)?.trim()

    if (!login || !senha) {
      setError('Login e senha são obrigatórios.')
      return
    }

    startTransition(async () => {
      const result = await createUsuario(formData)
      if (!result.success) {
        setError(result.message ?? 'Erro ao criar usuário.')
        return
      }
      router.push('/admin/usuarios')
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      <div className="container mx-auto px-4 md:px-6 py-8">
        <div className="mb-6">
          <AdminBackButton href="/admin/usuarios" label="Voltar para usuários" />
        </div>

        <Card className="max-w-md mx-auto border-2 shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl">Novo Usuário</CardTitle>
            <CardDescription>
              Crie um usuário com login e senha para acessar a área admin.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login" className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  Login *
                </Label>
                <Input
                  id="login"
                  name="login"
                  placeholder="Ex: admin"
                  autoComplete="username"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="senha" className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-muted-foreground" />
                  Senha *
                </Label>
                <Input
                  id="senha"
                  name="senha"
                  type="password"
                  placeholder="Senha de acesso"
                  autoComplete="new-password"
                  required
                />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <Button type="submit" disabled={isPending} className="w-full">
                {isPending ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Salvando...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Check className="h-4 w-4" />
                    Criar Usuário
                  </span>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

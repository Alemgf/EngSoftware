"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Lock, LogIn, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { validateLogin } from "../usuarios/actions"

export default function AdminLoginPage() {
  const router = useRouter()
  const [login, setLogin] = useState("")
  const [senha, setSenha] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const checkAuth = () => {
      const cookies = document.cookie.split(";").map((cookie) => cookie.trim())
      const hasSession = cookies.some((cookie) => cookie.startsWith("admin_session="))

      if (hasSession) {
        setIsAuthenticated(true)
        router.push("/admin/projetos")
      }
    }

    checkAuth()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!login.trim() || !senha.trim()) {
      setError("Por favor, insira login e senha")
      return
    }

    setIsLoading(true)
    setError("")

    const result = await validateLogin(login.trim(), senha.trim())

    if (result.success) {
      const expiryDate = new Date()
      expiryDate.setDate(expiryDate.getDate() + 7)

      document.cookie = `admin_session=authenticated; path=/; expires=${expiryDate.toUTCString()}; SameSite=Lax`

      setTimeout(() => {
        router.push("/admin/projetos")
      }, 500)
    } else {
      setError(result.message ?? "Login ou senha inválidos. Tente novamente.")
      setIsLoading(false)
    }
  }

  if (isAuthenticated) {
    return (
      <div className="pt-32 pb-24 flex items-center justify-center">
        <div className="text-center">
          <div
            className="animate-spin inline-block w-8 h-8 border-4 border-current border-t-transparent text-primary rounded-full"
            role="status"
            aria-label="loading"
          >
            <span className="sr-only">Carregando...</span>
          </div>
          <p className="mt-4">Redirecionando para o painel administrativo...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="pt-32 pb-24 flex items-center justify-center">
      <div className="w-full max-w-md px-4">
        <Card className="border shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Área Administrativa</CardTitle>
            <CardDescription>Entre com seu login e senha para acessar o painel</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login">Login</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="login"
                    type="text"
                    placeholder="Digite o login"
                    value={login}
                    onChange={(e) => setLogin(e.target.value)}
                    className="pl-10"
                    autoComplete="username"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="senha">Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="senha"
                    type="password"
                    placeholder="Digite a senha"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    className="pl-10"
                    autoComplete="current-password"
                  />
                </div>
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
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
                    Verificando...
                  </span>
                ) : (
                  <span className="flex items-center">
                    <LogIn className="mr-2 h-5 w-5" /> Entrar
                  </span>
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}

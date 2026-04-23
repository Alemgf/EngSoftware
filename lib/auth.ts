"use server"

import { cookies } from "next/headers"

// Função para verificar se o usuário está autenticado
export async function checkAuth() {
  const sessionCookie = cookies().get("admin_session")

  if (!sessionCookie?.value) {
    return { authenticated: false }
  }

  return { authenticated: true, userId: "admin" }
}

// Função para fazer logout
export async function logout() {
  cookies().delete("admin_session")
  return { success: true }
}

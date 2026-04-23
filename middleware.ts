import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Verificar se é uma rota administrativa protegida
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    // Verificar se o usuário está autenticado
    const session = request.cookies.get("admin_session")

    // Se não estiver autenticado, redirecionar para a página de login
    if (!session) {
      const loginUrl = new URL("/admin/login", request.url)
      return NextResponse.redirect(loginUrl)
    }
  }

  // Se o usuário estiver autenticado e tentar acessar a página de login,
  // redirecionar para a página de orçamentos
  if (pathname === "/admin/login") {
    const session = request.cookies.get("admin_session")

    if (session) {
      const dashboardUrl = new URL("/admin/orcamentos", request.url)
      return NextResponse.redirect(dashboardUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*"],
}

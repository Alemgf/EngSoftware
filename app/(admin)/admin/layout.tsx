'use client'

import { ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import AdminSidebar from '@/components/ui/AdminSidebar'

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()

  const isLoginPage = pathname === '/admin/login'

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      {!isLoginPage && <AdminSidebar />}
      <main className="flex-1 p-6 overflow-y-auto">{children}</main>
    </div>
  )
}


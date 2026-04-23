'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet'
import { AdminNavContent } from '@/components/ui/AdminNavContent'

export default function AdminSidebar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="sticky top-0 h-screen w-64 shrink-0 border-r bg-background p-4 hidden lg:block">
        <AdminNavContent />
      </aside>

      {/* Mobile: top bar + sheet menu */}
      <header className="flex h-14 shrink-0 items-center gap-2 border-b bg-background px-4 lg:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Abrir menu">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-4">
            <AdminNavContent />
          </SheetContent>
        </Sheet>
        <span className="text-lg font-bold">
          LANDING.<span className="text-primary">Studio</span>
        </span>
      </header>
    </>
  )
}

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { PlusCircle, FileStack, FolderKanban, Users } from 'lucide-react'
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion'

const linkStyle =
  'flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground'

export function AdminNavContent() {
  const pathname = usePathname()

  const isActive = (href: string) =>
    pathname === href ? 'bg-accent text-accent-foreground font-medium' : ''

  return (
    <>
      <Link href="/admin/projetos" className="mb-6 block text-xl font-bold">
        LANDING.<span className="text-primary">Studio</span>
      </Link>

      <nav className="space-y-2 text-sm">
        <Accordion type="single" collapsible>
          <AccordionItem value="projetos">
            <AccordionTrigger className="px-3 py-2 rounded-lg">
              <FolderKanban className="h-4 w-4" /> Gerenciar Projetos
            </AccordionTrigger>
            <AccordionContent className="ml-6 mt-1 space-y-1">
              <Link
                href="/admin/projetos"
                className={`${linkStyle} ${isActive('/admin/projetos')}`}
              >
                <FileStack className="h-4 w-4" /> Lista Projetos
              </Link>
              <Link
                href="/admin/projetos/novo"
                className={`${linkStyle} ${isActive('/admin/projetos/novo')}`}
              >
                <PlusCircle className="h-4 w-4" /> Novo Projeto
              </Link>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <Accordion type="single" collapsible>
          <AccordionItem value="usuarios">
            <AccordionTrigger className="px-3 py-2 rounded-lg">
              <Users className="h-4 w-4" /> Gerenciar Usuários
            </AccordionTrigger>
            <AccordionContent className="ml-6 mt-1 space-y-1">
              <Link
                href="/admin/usuarios"
                className={`${linkStyle} ${isActive('/admin/usuarios')}`}
              >
                <FileStack className="h-4 w-4" /> Lista Usuários
              </Link>
              <Link
                href="/admin/usuarios/novo"
                className={`${linkStyle} ${isActive('/admin/usuarios/novo')}`}
              >
                <PlusCircle className="h-4 w-4" /> Novo Usuário
              </Link>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </nav>
    </>
  )
}

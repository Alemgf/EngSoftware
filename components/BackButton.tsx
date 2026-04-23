'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

type BackButtonProps = {
  href: string
  label: string
}

export function BackButton({ href, label }: BackButtonProps) {
  return (
    <Button variant="outline" asChild>
      <Link href={href} className="inline-flex items-center">
        <ArrowLeft className="mr-2 h-4 w-4" />
        {label}
      </Link>
    </Button>
  )
}

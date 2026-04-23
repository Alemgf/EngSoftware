import { z } from 'zod'

export function brlToNumber(value: unknown) {
  if (typeof value === 'string') {
    const numeric = value.replace(/[^0-9,-]+/g, '').replace(',', '.')
    return parseFloat(numeric)
  }
  return value
}

export function fileListToArray(val: unknown): File[] | undefined {
  if (val instanceof FileList) return Array.from(val)
  if (Array.isArray(val) && val.every((f) => f instanceof File)) return val
  return undefined
}

export function ensureStringArray(val: unknown): string[] {
  if (Array.isArray(val)) return val.filter((x): x is string => typeof x === 'string')
  if (typeof val === 'string' && val) return [val]
  return []
}

export const ProjectSchema = z.object({
  nome: z.string().min(3, 'Obrigatório'),
  descricao: z.string().optional(),
  sobre: z.string().optional(),
  url_demo: z.union([z.string().url('URL inválida'), z.literal('')]).optional(),
  faixa_preco_min: z.preprocess(brlToNumber, z.number().positive().optional()),
  faixa_preco_max: z.preprocess(brlToNumber, z.number().positive().optional()),
  complexidade: z.enum(['basico', 'intermediario', 'avancado']),
  responsivo: z.boolean().default(true),
  tempo_estimado: z.string().optional(),
  cliente_nome: z.string().optional(),
  categorias: z.preprocess(
    ensureStringArray,
    z.array(z.string()).min(1, 'Escolha ao menos 1 categoria')
  ),
  destaques: z.string().optional(),
  caracteristicas: z.string().optional(),
  nivel_complexidade_itens: z.string().optional(),
  informacoes_projeto: z.string().optional(),
  imagens: z.preprocess(fileListToArray, z.array(z.instanceof(File)).optional()),
})

export type FormData = z.infer<typeof ProjectSchema>
export type Category = { id: string; nome: string }
export type Img = { id: string; url: string; legenda?: string | null; principal: boolean; ordem: number }

export function formatCurrencyBRL(v: number | string | null) {
  if (v == null) return ''
  const num = typeof v === 'number' ? v : parseFloat(String(v))
  if (isNaN(num)) return ''
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(num)
}

export type DestaquesSection = { titulo: string; itens: string }

export function parseDestaques(str: string | null | undefined): DestaquesSection[] {
  if (!str?.trim()) return [{ titulo: '', itens: '' }, { titulo: '', itens: '' }]
  const raw = str.trim()
  if (!raw.includes('---')) {
    const lines = raw.split('\n').map((s) => s.trim()).filter(Boolean)
    if (lines.length === 0) return [{ titulo: '', itens: '' }, { titulo: '', itens: '' }]
    return [{ titulo: '', itens: lines.join('\n') }, { titulo: '', itens: '' }]
  }
  const blocks = raw.split(/\n---\n/).map((s) => s.trim()).filter(Boolean)
  const sections: DestaquesSection[] = blocks.map((block) => {
    const lines = block.split('\n').map((s) => s.trim())
    const titulo = lines[0] ?? ''
    const itens = lines.slice(1).filter(Boolean).join('\n')
    return { titulo, itens }
  })
  if (sections.length === 0) return [{ titulo: '', itens: '' }, { titulo: '', itens: '' }]
  if (sections.length === 1) return [...sections, { titulo: '', itens: '' }]
  return sections.slice(0, 3)
}

export function serializeDestaques(sections: DestaquesSection[]): string {
  return sections
    .filter((s) => s.titulo.trim() || s.itens.trim())
    .map((s) => {
      const titulo = s.titulo.trim()
      const itens = s.itens
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean)
      return titulo ? [titulo, ...itens].join('\n') : itens.join('\n')
    })
    .join('\n---\n')
}

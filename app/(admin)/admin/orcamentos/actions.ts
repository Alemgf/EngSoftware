'use server'

import { revalidatePath } from 'next/cache'
import { createSupabaseServer } from '@/lib/supabase/server'

type OrcamentoStatus =
  | 'novo'
  | 'em_analise'
  | 'proposta_enviada'
  | 'aprovado'
  | 'recusado'
  | 'concluido'

/* ------------------------ GET Orçamentos ------------------------------ */
export async function getOrcamentos() {
  try {
    const supabase = createSupabaseServer()
    const { data, error } = await supabase
      .from('orcamentos')
      .select('*,projetos!reference_project(nome)')
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(error.message)
    }

    return { success: true, data: data ?? [] }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro ao carregar orçamentos'
    console.error('Erro no getOrcamentos:', err)
    return {
      success: false,
      data: [],
      message,
    }
  }
}

/* ------------------------ GET Orçamento por ID ----------------------- */
export async function getOrcamentoById(id: string) {
  try {
    const supabase = createSupabaseServer()
    const { data: row, error } = await supabase
      .from('orcamentos')
      .select('*,projetos!reference_project(nome)')
      .eq('id', id)
      .maybeSingle()

    if (error) {
      throw new Error(error.message)
    }
    if (!row) {
      return { success: false, data: null, message: 'Orçamento não encontrado' }
    }
    return { success: true, data: row, message: null }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro ao carregar orçamento'
    console.error('getOrcamentoById:', err)
    return {
      success: false,
      data: null,
      message,
    }
  }
}

/* ------------------- UPDATE status ----------------------------------- */
export async function updateOrcamentoStatus(id: string, status: OrcamentoStatus) {
  try {
    const supabase = createSupabaseServer()
    const { error } = await supabase
      .from('orcamentos')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)

    if (error) {
      throw new Error(error.message)
    }

    revalidatePath('/admin/orcamentos')
    revalidatePath(`/admin/orcamentos/${id}`)
    return { success: true, message: 'Status atualizado' }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro ao atualizar status'
    console.error('updateOrcamentoStatus:', err)
    return {
      success: false,
      message,
    }
  }
}

export type OrcamentoUpdatePayload = {
  name?: string
  email?: string
  phone?: string | null
  business_area?: string | null
  objective?: string | null
  deadline?: string | null
  budget?: string | null
  reference_project?: string | null
}

/* ------------------- UPDATE orçamento (dados gerais) ----------------- */
export async function updateOrcamento(id: string, payload: OrcamentoUpdatePayload) {
  try {
    const body: Record<string, unknown> = { ...payload, updated_at: new Date().toISOString() }
    const supabase = createSupabaseServer()
    const { error } = await supabase.from('orcamentos').update(body).eq('id', id)

    if (error) {
      throw new Error(error.message)
    }

    revalidatePath('/admin/orcamentos')
    revalidatePath(`/admin/orcamentos/${id}`)
    return { success: true, message: 'Informações atualizadas' }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro ao atualizar informações'
    console.error('updateOrcamento:', err)
    return {
      success: false,
      message,
    }
  }
}

/* ------------------- CREATE orçamento (admin) ----------------------- */
export async function createOrcamentoAdmin(formData: FormData) {
  try {
    const name = (formData.get('name') as string)?.trim()
    const email = (formData.get('email') as string)?.trim()
    const phone = (formData.get('phone') as string)?.trim() ?? ''
    const business_area = (formData.get('business_area') as string)?.trim() ?? ''
    const objective = (formData.get('objective') as string)?.trim() ?? ''
    const deadlineRaw = (formData.get('deadline') as string)?.trim() || null
    const deadline = deadlineRaw || null
    const budget = (formData.get('budget') as string)?.trim() || null
    const refRaw = (formData.get('reference_project') as string)?.trim() || null
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    const reference_project = refRaw && uuidRegex.test(refRaw) ? refRaw : null

    if (!name || !email) {
      return { success: false, message: 'Nome e e-mail são obrigatórios.' }
    }

    const reference_id = `ORC-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`

    const supabase = createSupabaseServer()
    const { error } = await supabase.from('orcamentos').insert({
      reference_id,
      name,
      email,
      phone,
      business_area,
      objective,
      deadline: deadline || null,
      budget,
      reference_project: reference_project || null,
      status: 'novo',
      files: null,
    })

    if (error) {
      console.error('createOrcamentoAdmin:', error)
      return { success: false, message: error.message ?? 'Erro ao salvar orçamento.' }
    }

    revalidatePath('/admin/orcamentos')
    return { success: true, message: 'Orçamento criado.' }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro ao processar.'
    console.error('createOrcamentoAdmin:', err)
    return { success: false, message }
  }
}

/* ------------------- DELETE orçamento -------------------------------- */
export async function deleteOrcamento(id: string) {
  try {
    const supabase = createSupabaseServer()
    const { error } = await supabase.from('orcamentos').delete().eq('id', id)

    if (error) {
      throw new Error(error.message)
    }

    revalidatePath('/admin/orcamentos')
    return { success: true, message: 'Orçamento excluído' }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro ao excluir orçamento'
    console.error('deleteOrcamento:', err)
    return {
      success: false,
      message,
    }
  }
}

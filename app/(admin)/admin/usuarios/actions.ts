'use server'

import { revalidatePath } from 'next/cache'
import { hashPassword, verifyPassword } from '@/lib/password'
import { createSupabaseServer } from '@/lib/supabase/server'

export interface Usuario {
  id: string
  login: string
  senha: string
  ativo: boolean
  created_at: string
}

/** Usuário sem senha (nunca enviar hash ao client). */
export type UsuarioPublic = Omit<Usuario, 'senha'>

function isDuplicateKeyError(message: string | undefined, code: string | undefined) {
  return code === '23505' || (message?.toLowerCase().includes('duplicate') ?? false)
}

/* ------------------------ GET Usuários ------------------------------ */
export async function getUsuarios() {
  try {
    const supabase = createSupabaseServer()
    const { data, error } = await supabase
      .from('usuarios')
      .select('id,login,ativo,created_at')
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(error.message)
    }

    return { success: true, data: data ?? [] }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro ao carregar usuários'
    console.error('getUsuarios:', err)
    return { success: false, data: [], message }
  }
}

/* ------------------------ GET Usuário por ID ----------------------- */
export async function getUsuarioById(id: string) {
  try {
    const supabase = createSupabaseServer()
    const { data: row, error } = await supabase
      .from('usuarios')
      .select('id,login,ativo,created_at')
      .eq('id', id)
      .maybeSingle()

    if (error) {
      throw new Error(error.message)
    }
    if (!row) {
      return { success: false, data: null, message: 'Usuário não encontrado' }
    }
    return { success: true, data: row as UsuarioPublic, message: null }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro ao carregar usuário'
    console.error('getUsuarioById:', err)
    return { success: false, data: null, message }
  }
}

function isBcryptHash(value: string): boolean {
  return value.startsWith('$2a$') || value.startsWith('$2b$') || value.startsWith('$2y$')
}

/* ------------------------ validateLogin (login + senha) ------------- */
export async function validateLogin(
  login: string,
  senha: string
): Promise<{ success: boolean; message?: string }> {
  try {
    const trimmedLogin = login?.trim()
    const trimmedSenha = senha?.trim()
    if (!trimmedLogin || !trimmedSenha) {
      return { success: false, message: 'Login e senha são obrigatórios.' }
    }

    const supabase = createSupabaseServer()
    const { data: row, error } = await supabase
      .from('usuarios')
      .select('id,senha')
      .eq('login', trimmedLogin)
      .eq('ativo', true)
      .maybeSingle()

    if (error) {
      return { success: false, message: 'Erro ao validar credenciais.' }
    }
    if (!row) {
      return { success: false, message: 'Login ou senha inválidos.' }
    }

    if (isBcryptHash(row.senha)) {
      const ok = await verifyPassword(trimmedSenha, row.senha)
      return ok ? { success: true } : { success: false, message: 'Login ou senha inválidos.' }
    }

    if (row.senha !== trimmedSenha) {
      return { success: false, message: 'Login ou senha inválidos.' }
    }
    const senhaHash = await hashPassword(trimmedSenha)
    const { error: updErr } = await supabase
      .from('usuarios')
      .update({ senha: senhaHash })
      .eq('id', row.id)

    if (updErr) {
      return { success: false, message: 'Erro ao validar credenciais.' }
    }
    return { success: true }
  } catch {
    return { success: false, message: 'Erro ao validar login.' }
  }
}

/* ------------------------ CREATE usuário --------------------------- */
export async function createUsuario(formData: FormData) {
  try {
    const login = (formData.get('login') as string)?.trim()
    const senha = (formData.get('senha') as string)?.trim()

    if (!login || !senha) {
      return { success: false, message: 'Login e senha são obrigatórios.' }
    }

    const senhaHash = await hashPassword(senha)
    const supabase = createSupabaseServer()
    const { error } = await supabase.from('usuarios').insert({ login, senha: senhaHash, ativo: true })

    if (error) {
      if (isDuplicateKeyError(error.message, error.code)) {
        return { success: false, message: 'Este login já está em uso.' }
      }
      throw new Error(error.message)
    }

    revalidatePath('/admin/usuarios')
    return { success: true, message: 'Usuário criado.' }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro ao criar usuário.'
    console.error('createUsuario:', err)
    return { success: false, message }
  }
}

/* ------------------------ UPDATE usuário (login e/ou senha) ---------- */
export async function updateUsuario(
  id: string,
  payload: { login?: string; senha?: string }
): Promise<{ success: boolean; message?: string }> {
  try {
    const body: Record<string, string> = {}
    if (payload.login !== undefined) {
      const trimmed = payload.login.trim()
      if (!trimmed) return { success: false, message: 'Login não pode ser vazio.' }
      body.login = trimmed
    }
    if (payload.senha !== undefined && payload.senha.trim() !== '') {
      body.senha = await hashPassword(payload.senha.trim())
    }
    if (Object.keys(body).length === 0) {
      return { success: true, message: 'Nada a atualizar.' }
    }

    const supabase = createSupabaseServer()
    const { error } = await supabase.from('usuarios').update(body).eq('id', id)

    if (error) {
      if (isDuplicateKeyError(error.message, error.code)) {
        return { success: false, message: 'Este login já está em uso.' }
      }
      throw new Error(error.message)
    }

    revalidatePath('/admin/usuarios')
    revalidatePath(`/admin/usuarios/${id}`)
    return { success: true, message: 'Usuário atualizado.' }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro ao atualizar usuário.'
    console.error('updateUsuario:', err)
    return { success: false, message }
  }
}

/* ------------------------ UPDATE usuário (situação) ----------------- */
export async function updateUsuarioSituacao(id: string, ativo: boolean) {
  try {
    const supabase = createSupabaseServer()
    const { error } = await supabase.from('usuarios').update({ ativo }).eq('id', id)

    if (error) {
      throw new Error(error.message)
    }

    revalidatePath('/admin/usuarios')
    revalidatePath(`/admin/usuarios/${id}`)
    return { success: true, message: ativo ? 'Usuário ativado.' : 'Usuário desativado.' }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro ao atualizar situação.'
    console.error('updateUsuarioSituacao:', err)
    return { success: false, message }
  }
}

/* ------------------------ DELETE usuário --------------------------- */
export async function deleteUsuario(id: string) {
  try {
    const supabase = createSupabaseServer()
    const { error } = await supabase.from('usuarios').delete().eq('id', id)

    if (error) {
      throw new Error(error.message)
    }

    revalidatePath('/admin/usuarios')
    return { success: true, message: 'Usuário excluído.' }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro ao excluir usuário.'
    console.error('deleteUsuario:', err)
    return { success: false, message }
  }
}

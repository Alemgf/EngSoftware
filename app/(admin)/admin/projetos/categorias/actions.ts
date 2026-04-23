'use server'

import { createSupabaseServer } from '@/lib/supabase/server'

export async function deleteCategoria(categoriaId: string) {
  const supabase = createSupabaseServer()

  const { error: delVincErr } = await supabase
    .from('projetos_categorias')
    .delete()
    .eq('categoria_id', categoriaId)

  if (delVincErr) {
    return { success: false, message: `Erro ao desvincular projetos: ${delVincErr.message}` }
  }

  const { error } = await supabase.from('categorias').delete().eq('id', categoriaId)

  if (error) {
    return { success: false, message: `Erro ao excluir: ${error.message}` }
  }

  return { success: true, message: null }
}

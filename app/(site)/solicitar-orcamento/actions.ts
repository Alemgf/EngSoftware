"use server"

import { revalidatePath } from "next/cache"
import { createSupabaseServer } from "@/lib/supabase/server"

export async function saveOrcamento(formData: FormData) {
  try {
    const name = (formData.get("name") as string)?.trim()
    const email = (formData.get("email") as string)?.trim()
    const phone = (formData.get("phone") as string)?.trim() ?? ""
    const businessArea = (formData.get("business_area") as string)?.trim() ?? ""
    const objective = (formData.get("objective") as string)?.trim() ?? ""
    const deadline = (formData.get("deadline") as string)?.trim() || null
    const budget = (formData.get("budget") as string)?.trim() || null
    const referenceProject = (formData.get("reference_project") as string)?.trim() || null

    if (!name || !email) {
      return { success: false, message: "Nome e e-mail são obrigatórios.", referenceId: null }
    }

    const referenceId = `ORC-${Math.floor(Math.random() * 10000).toString().padStart(4, "0")}`

    const supabase = createSupabaseServer()
    const { error } = await supabase.from("orcamentos").insert({
      reference_id: referenceId,
      name,
      email,
      phone,
      business_area: businessArea,
      objective,
      deadline,
      budget,
      reference_project: referenceProject || null,
      status: "novo",
      files: null,
    })

    if (error) {
      console.error("saveOrcamento:", error)
      const message =
        error.message ?? "Erro ao salvar orçamento."
      const detail = error.code ? ` [${error.code}]` : ""
      return { success: false, message: `${message}${detail}`, referenceId: null }
    }

    revalidatePath("/admin/orcamentos")
    return { success: true, message: "Orçamento enviado com sucesso!", referenceId }
  } catch (err: any) {
    console.error("saveOrcamento:", err)
    const message = err?.message ?? "Erro ao processar orçamento."
    return { success: false, message, referenceId: null }
  }
}

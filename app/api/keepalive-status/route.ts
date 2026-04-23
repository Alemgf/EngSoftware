import { NextResponse } from 'next/server';
import { createSupabaseClient } from '@/lib/supabase/client';

const supabase = createSupabaseClient();

export async function GET() {
  const { data, error } = await supabase
    .from('Supla')
    .select('inserted_at')
    .order('inserted_at', { ascending: false })
    .limit(1);

  console.log('data:', data);
  console.log('error:', error);

  if (error) {
  return NextResponse.json({
    error: true,
    message: 'Erro ao consultar o Supabase.',
    details: error,
  }, { status: 500 });
}

if (!data?.length) {
  return NextResponse.json({
    lastKeepAlive: null
  });
}


  return NextResponse.json({ lastKeepAlive: data[0].inserted_at });
}

/** POST: insere um novo registro na tabela Supla (keep-alive). */
export async function POST() {
  const { data, error } = await supabase
    .from('Supla')
    .insert({ inserted_at: new Date().toISOString() })
    .select('inserted_at')
    .single();

  if (error) {
    return NextResponse.json(
      { error: true, message: 'Erro ao registrar keep-alive.', details: error },
      { status: 500 }
    );
  }

  return NextResponse.json({ lastKeepAlive: data?.inserted_at ?? new Date().toISOString() });
}

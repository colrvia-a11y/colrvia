import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
export async function GET(_req: NextRequest, { params }:{ params:{ id:string }}) {
  const supabase = supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error:'UNAUTH' }, { status: 401 });
  const { data, error } = await supabase.from('stories').select('*').eq('id', params.id).single();
  if (error) return NextResponse.json({ error:'NOT_FOUND' }, { status: 404 });
  return NextResponse.json(data);
}
export async function DELETE(_req: NextRequest, { params }:{ params:{ id:string }}) {
  const supabase = supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error:'UNAUTH' }, { status: 401 });
  const { error } = await supabase.from('stories').delete().eq('id', params.id);
  if (error) return NextResponse.json({ error:'DELETE_FAILED' }, { status: 400 });
  return NextResponse.json({ ok:true });
}

import { supabase, hasSupabase } from '../lib/supabaseClient'

export type Note = {
  id?: string
  quote: string
  created_at?: string
}

const TABLE = (import.meta.env.VITE_NOTES_TABLE as string | undefined) ?? 'notes'
const COLUMN = (import.meta.env.VITE_NOTES_COLUMN as string | undefined) ?? 'quote'

export async function fetchNotes(limit = 50): Promise<Note[]> {
  if (!hasSupabase()) return []
  const { data, error } = await supabase
    .from(TABLE)
    .select(`id, ${COLUMN}, created_at`)
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) {
    console.error('[Supabase] fetchNotes error:', error)
    return []
  }
  const rows = (data as any[]) ?? []
  return rows
    .map((r) => ({ id: r.id as string, quote: String(r[COLUMN] ?? ''), created_at: r.created_at as string }))
    .filter((n) => n.quote.length > 0)
}

export async function createNote(quote: string): Promise<Note | null> {
  if (!hasSupabase()) return null
  const payload: Record<string, unknown> = { [COLUMN]: quote }
  const { data, error } = await supabase
    .from(TABLE)
    .insert([payload])
    .select(`id, ${COLUMN}, created_at`)
    .single()
  if (error) {
    console.error('[Supabase] createNote error:', error)
    return null
  }
  const row = data as any
  return { id: row.id as string, quote: String(row[COLUMN] ?? ''), created_at: row.created_at as string }
}

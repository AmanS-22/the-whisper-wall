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

// Subscribe to realtime INSERTs on the notes table
export type NoteChange = { type: 'INSERT' | 'UPDATE' | 'DELETE'; note: Note; id?: string }

export function subscribeToNotes(onChange: (change: NoteChange) => void): () => void {
  if (!hasSupabase()) return () => {}
  console.info('[Realtime] Subscribing to * events on', TABLE)
  const channel = (supabase as any)
    .channel(`notes-realtime`)
    .on('postgres_changes', { event: '*', schema: 'public', table: TABLE }, (payload: any) => {
      const eventType = (payload?.eventType ?? payload?.type ?? '').toUpperCase()
      if (eventType === 'INSERT') {
        console.info('[Realtime] INSERT payload:', payload)
        const row = payload?.new ?? {}
        const note: Note = { id: row.id as string, quote: String(row[COLUMN] ?? ''), created_at: row.created_at as string }
        if (note.quote) onChange({ type: 'INSERT', note, id: note.id })
      } else if (eventType === 'UPDATE') {
        console.info('[Realtime] UPDATE payload:', payload)
        const row = payload?.new ?? {}
        const note: Note = { id: row.id as string, quote: String(row[COLUMN] ?? ''), created_at: row.created_at as string }
        if (note.id) onChange({ type: 'UPDATE', note, id: note.id })
      } else if (eventType === 'DELETE') {
        console.info('[Realtime] DELETE payload:', payload)
        const oldRow = payload?.old ?? {}
        const id = oldRow.id as string | undefined
        onChange({ type: 'DELETE', note: { id, quote: '', created_at: oldRow.created_at as string }, id })
      }
    })
    .subscribe()

  return () => {
    try { (supabase as any).removeChannel(channel) } catch {}
  }
}

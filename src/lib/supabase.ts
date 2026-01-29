import { createClient } from '@supabase/supabase-js'

// URL correta do projeto Supabase (formato: https://[PROJECT_ID].supabase.co)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://tbpqefsratlqpuljcaio.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

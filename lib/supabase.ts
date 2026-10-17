import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'URL_SUPABASE_ANDA'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'KEY_SUPABASE_ANDA'

export const supabase = createClient(supabaseUrl, supabaseKey)
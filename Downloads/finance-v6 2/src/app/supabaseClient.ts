import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

// 환경변수가 없어도 빌드/로컬 개발이 깨지지 않도록 더미 값으로 폴백
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
)

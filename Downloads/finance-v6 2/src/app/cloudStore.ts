import { supabase } from './supabaseClient'
import type { EncryptedPayload } from './crypto'

const TABLE = 'finance_vaults'

export interface VaultRow {
  user_id: string
  salt: string
  iv: string
  data: string
  updated_at: string
}

// 현재 로그인된 사용자의 암호화 데이터(vault)를 가져온다. 없으면 null.
export async function fetchVault(userId: string): Promise<EncryptedPayload | null> {
  const { data, error } = await supabase
    .from(TABLE)
    .select('salt, iv, data')
    .eq('user_id', userId)
    .maybeSingle()

  if (error) {
    console.error('fetchVault error:', error.message)
    return null
  }
  if (!data) return null
  return { salt: data.salt, iv: data.iv, data: data.data }
}

// 암호화된 데이터를 업서트(없으면 생성, 있으면 갱신)한다.
export async function upsertVault(userId: string, payload: EncryptedPayload): Promise<boolean> {
  const { error } = await supabase
    .from(TABLE)
    .upsert({
      user_id: userId,
      salt: payload.salt,
      iv: payload.iv,
      data: payload.data,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' })

  if (error) {
    console.error('upsertVault error:', error.message)
    return false
  }
  return true
}

// 비밀번호 분실 시 해당 계정의 vault 행을 완전히 삭제한다.
export async function deleteVault(userId: string): Promise<boolean> {
  const { error } = await supabase.from(TABLE).delete().eq('user_id', userId)
  if (error) {
    console.error('deleteVault error:', error.message)
    return false
  }
  return true
}

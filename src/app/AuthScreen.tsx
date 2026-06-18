'use client'

import { useState } from 'react'
import { supabase } from './supabaseClient'

export function AuthScreen({ onAuthed }: { onAuthed: () => void }) {
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [pw, setPw] = useState('')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async () => {
    setError('')
    setInfo('')
    if (!email || !pw) { setError('이메일과 비밀번호를 입력하세요'); return }
    if (pw.length < 6) { setError('비밀번호는 6자 이상이어야 합니다'); return }

    setLoading(true)
    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password: pw })
      setLoading(false)
      if (error) { setError('이메일 또는 비밀번호가 올바르지 않습니다'); return }
      onAuthed()
    } else {
      const { error } = await supabase.auth.signUp({ email, password: pw })
      setLoading(false)
      if (error) { setError(error.message); return }
      setInfo('가입 확인 이메일을 보냈습니다. 이메일을 확인한 뒤 로그인해 주세요.')
      setMode('login')
    }
  }

  return (
    <div className="lock-wrap">
      <div className="lock-card">
        <div className="lock-icon">☁️</div>
        <h1 className="lock-title">{mode === 'login' ? '계정 로그인' : '계정 만들기'}</h1>
        <p className="lock-desc">
          {mode === 'login'
            ? '계정으로 로그인하면 여러 기기에서 데이터를 동기화할 수 있습니다.'
            : '이메일과 비밀번호로 새 계정을 만듭니다.'}
        </p>
        <input
          type="email"
          value={email}
          onChange={e => { setEmail(e.target.value); setError('') }}
          placeholder="이메일"
          className="lock-input"
          autoFocus
        />
        <input
          type="password"
          value={pw}
          onChange={e => { setPw(e.target.value); setError('') }}
          placeholder="계정 비밀번호 (6자 이상)"
          className="lock-input"
          onKeyDown={e => e.key === 'Enter' && submit()}
        />
        {error && <div className="lock-error">{error}</div>}
        {info && <div className="lock-info">{info}</div>}
        <button className="lock-btn" onClick={submit} disabled={loading}>
          {loading ? '처리 중...' : mode === 'login' ? '로그인' : '가입하기'}
        </button>
        <button
          className="lock-link"
          onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); setInfo('') }}
        >
          {mode === 'login' ? '계정이 없으신가요? 가입하기' : '이미 계정이 있으신가요? 로그인'}
        </button>
        <p className="lock-note">
          ⚠️ 이 계정 비밀번호는 로그인용입니다.<br />
          실제 재정 데이터는 별도의 <b>앱 잠금 비밀번호</b>로 암호화되어 저장되며,<br />
          Supabase 서버는 암호화된 데이터만 보관합니다.
        </p>
      </div>
    </div>
  )
}

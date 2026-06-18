-- Supabase SQL Editor에서 이 스크립트를 실행하세요.
-- 여러 번 실행해도 안전합니다(이미 존재하는 테이블/정책은 건너뛰거나 재생성합니다).
--
-- 사용자별로 암호화된 데이터 1행만 저장하는 단순한 "vault" 테이블입니다.
-- salt/iv/data는 모두 클라이언트에서 AES-GCM으로 암호화된 base64 문자열이며,
-- Supabase(서버)는 평문 데이터를 절대 볼 수 없습니다.

create table if not exists public.finance_vaults (
  user_id uuid primary key references auth.users(id) on delete cascade,
  salt text not null,
  iv text not null,
  data text not null,
  updated_at timestamptz not null default now()
);

-- 행 단위 보안(RLS) 활성화: 본인 행만 접근 가능
alter table public.finance_vaults enable row level security;

-- 기존 정책이 있다면 먼저 삭제 (policy already exists 에러 방지)
drop policy if exists "Users can read own vault"   on public.finance_vaults;
drop policy if exists "Users can insert own vault" on public.finance_vaults;
drop policy if exists "Users can update own vault" on public.finance_vaults;
drop policy if exists "Users can delete own vault" on public.finance_vaults;

-- 본인 데이터 조회
create policy "Users can read own vault"
  on public.finance_vaults for select
  using (auth.uid() = user_id);

-- 본인 데이터 생성
create policy "Users can insert own vault"
  on public.finance_vaults for insert
  with check (auth.uid() = user_id);

-- 본인 데이터 수정
create policy "Users can update own vault"
  on public.finance_vaults for update
  using (auth.uid() = user_id);

-- 본인 데이터 삭제 (비밀번호 재설정 시 사용)
create policy "Users can delete own vault"
  on public.finance_vaults for delete
  using (auth.uid() = user_id);

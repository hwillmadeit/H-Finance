# 개인 재정 관리

보험, 구독, 교육, 대출, 투자, 생활비, 경조사비를 한눈에 관리하는 웹앱입니다. 계정 로그인과 클라우드 동기화(Supabase)를 지원합니다.

## 보안 구조 (2단계)

이 앱은 **계정 비밀번호**와 **앱 잠금 비밀번호**를 분리합니다.

1. **계정 로그인** (Supabase Auth, 이메일/비밀번호) — "누가 이 클라우드 저장공간의 주인인가"를 확인
2. **앱 잠금 비밀번호** — 실제 재정 데이터를 AES-256-GCM으로 암호화/복호화하는 키. Supabase에는 **암호문만** 저장되고, 이 비밀번호 자체는 어디에도 저장되지 않습니다.

즉 Supabase 계정이 해킹되거나 DB가 유출되어도, 앱 잠금 비밀번호를 모르면 데이터는 의미 없는 암호문일 뿐입니다. 반대로 앱 잠금 비밀번호를 잊으면 클라우드에 백업된 데이터도 복구할 수 없습니다(서버는 평문을 본 적이 없으므로).

추가로 로컬에도 같은 암호문을 캐싱해 두어, 오프라인 상태이거나 Supabase 환경변수가 설정되지 않은 경우에도 동작합니다(로컬 전용 모드).

- **30분간 미사용 시 자동 잠금** (앱 잠금 비밀번호 재입력 필요, 계정 로그인은 유지됨)
- 우측 상단 🔒 버튼으로 즉시 수동 잠금

## Supabase 설정 방법

1. supabase.com에서 새 프로젝트 생성
2. 프로젝트의 SQL Editor에서 `supabase/schema.sql` 파일 내용을 실행 (테이블 생성 + RLS 정책 적용)
3. 프로젝트 설정 → API 메뉴에서 Project URL과 anon public key 확인
4. `.env.local.example`을 `.env.local`로 복사하고 값 입력:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```
5. Vercel에 배포할 경우, Vercel 프로젝트 설정의 Environment Variables에 동일한 두 값을 추가

참고: Supabase Auth의 이메일 인증 기능이 기본적으로 켜져 있습니다. 테스트 중에는 Supabase 대시보드의 Authentication → Providers → Email에서 "Confirm email"을 잠시 꺼두면 가입 즉시 로그인할 수 있어 편리합니다.

환경변수를 설정하지 않으면 앱은 자동으로 로컬 전용 모드(이전 버전과 동일하게 localStorage만 사용)로 동작합니다.

## 프로젝트 구조

```
finance-tracker/
├── src/
│   └── app/
│       ├── layout.tsx          # 루트 레이아웃 (서버 컴포넌트)
│       ├── page.tsx            # 진입점 (서버 컴포넌트)
│       ├── FinanceApp.tsx      # 클라이언트 앱 전체 ('use client')
│       ├── AuthScreen.tsx      # Supabase 계정 로그인/가입 화면
│       ├── LockScreen.tsx      # 앱 잠금 비밀번호 설정/해제 화면
│       ├── crypto.ts           # AES-GCM 암복호화 유틸
│       ├── supabaseClient.ts   # Supabase 클라이언트 초기화
│       ├── cloudStore.ts       # Supabase 데이터 읽기/쓰기 헬퍼
│       └── globals.css         # 전역 스타일
├── supabase/
│   └── schema.sql              # 테이블 생성 + RLS 정책 SQL
├── public/
├── .env.local.example
├── .eslintrc.json
├── .gitignore
├── next.config.js
├── package.json
└── tsconfig.json
```

## GitHub → Vercel 배포

1. 이 폴더를 GitHub에 새 저장소로 push (.env.local은 .gitignore에 포함되어 올라가지 않습니다)
2. vercel.com → Add New → Project → GitHub 저장소 Import
3. Environment Variables에 NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY 추가
4. Deploy

## 로컬 실행

```bash
npm install
cp .env.local.example .env.local
npm run dev
```

## 기능

| 탭 | 내용 |
|---|---|
| 요약 | 월 지출 추이 차트, 투자 자산 배분 차트, 주요 지표 |
| 투자 | 종목 관리(수정 가능), 매수/매도 거래 기록·수정·필터, 이율/만기(예금·채권), 평가액 갱신 배지 |
| 보험 | 월 보험료, 결제수단(계좌이체/카드), 결제일, 수정 가능 |
| 구독 | 서비스별 구독료(멤버십 카테고리 포함), 결제수단, 결제일, 수정 가능 |
| 교육 | 과정별 월 비용, 수강 기간, 결제수단, 결제일, 수정 가능 |
| 대출 | 잔여 원금, 금리, 월 상환액, 수정 가능 |
| 생활비 | 고정 지출(곗돈 카테고리 포함) + 경조사비 건별 기록, 수정 가능, 연간 예산 연동 |
| 검색 | 전체 항목 이름·메모·태그·결제수단 통합 검색 |

### 결제수단
보험·구독·교육 탭에서 결제수단을 선택할 수 있습니다. 계좌이체(은행명+계좌명/별칭)와 카드(카드사명)를 동시에 체크할 수 있고, 결제일도 별도 입력합니다.

### 수정 기능
모든 탭의 항목 옆 연필 아이콘을 누르면 해당 줄이 그 자리에서 입력 폼으로 바뀌어 수정할 수 있습니다.

- 모바일 최적화: 폰트 확대, 탭과 검색 아이콘이 한 줄에 정렬
- CSV 내보내기 (각 탭, 결제수단 정보 포함)
- 다크모드 지원
- Supabase 연동 시 여러 기기에서 동일한 암호화 데이터 동기화

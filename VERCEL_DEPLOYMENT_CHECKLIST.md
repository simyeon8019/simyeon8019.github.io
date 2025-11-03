# 🚀 Vercel 배포 전 체크리스트

Vercel로 배포하기 전에 반드시 확인해야 할 사항들을 정리했습니다.

## ✅ 필수 설정 사항

### 1. 환경 변수 설정 (Vercel Dashboard)

Vercel Dashboard → 프로젝트 선택 → **Settings** → **Environment Variables**에서 다음 환경 변수들을 설정해야 합니다:

#### Clerk 인증 변수

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx
CLERK_SECRET_KEY=sk_test_xxxxxxxxxxxxx
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/
```

#### Supabase 데이터베이스 변수

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_STORAGE_BUCKET=uploads
```

#### Tavily API (제품 이미지 검색용 - 선택사항)

```
TAVILY_API_KEY=tvly-xxxxxxxxxxxxx
```

> **⚠️ 중요**: `SUPABASE_SERVICE_ROLE_KEY`와 `CLERK_SECRET_KEY`는 절대 공개하지 마세요!
> 이 키들은 서버 사이드에서만 사용되며, 클라이언트 코드에 노출되면 안 됩니다.

### 2. 환경별 환경 변수 설정

Vercel에서는 환경별로 다른 값을 설정할 수 있습니다:

- **Production**: 프로덕션 배포용
- **Preview**: PR/브랜치 배포용
- **Development**: 로컬 개발용 (선택사항)

각 환경에 맞는 키 값을 설정하세요.

## 🗄️ 데이터베이스 마이그레이션 확인

### Supabase 마이그레이션 적용 확인

다음 테이블들이 Supabase에 생성되어 있는지 확인하세요:

1. **`users`** 테이블

   - Clerk 사용자와 동기화되는 테이블

2. **`products`** 테이블

   - 제품 정보 저장

3. **`cart_items`** 테이블 ⚠️ **최근 생성됨**
   - 장바구니 아이템 저장
   - 아래 SQL로 확인 및 생성 가능:

```sql
-- cart_items 테이블 확인
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name = 'cart_items';

-- 없으면 아래 SQL 실행
CREATE TABLE IF NOT EXISTS cart_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clerk_id TEXT NOT NULL,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    size TEXT NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0 AND quantity <= 99),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(clerk_id, product_id, size)
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_cart_items_clerk_id ON cart_items(clerk_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_product_id ON cart_items(product_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_clerk_created ON cart_items(clerk_id, created_at DESC);

-- updated_at 자동 업데이트 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 트리거 생성
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger
        WHERE tgname = 'update_cart_items_updated_at'
    ) THEN
        CREATE TRIGGER update_cart_items_updated_at
            BEFORE UPDATE ON cart_items
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;
```

### 마이그레이션 파일 위치

- `supabase/migrations/001_initial_schema.sql`: 초기 스키마 (products, users 등)
- `supabase/migrations/`: 기타 마이그레이션 파일들

## 🔐 Clerk + Supabase 통합 확인

### Clerk Dashboard 설정

1. **Clerk Dashboard** → **API Keys**에서 **Frontend API** URL 확인

   - 예: `https://your-app-12.clerk.accounts.dev`

2. **Clerk Dashboard** → **Domains & URLs**
   - **Production URLs**: Vercel 배포 URL 추가
     - 예: `https://shoppingmall-iota.vercel.app` (실제 프로덕션 URL)
     - 예: `https://your-app.vercel.app`
     - 예: `https://your-domain.com` (커스텀 도메인 사용 시)

### Supabase Dashboard 설정

1. **Supabase Dashboard** → **Settings** → **Authentication** → **Providers**
2. **Third-Party Auth** 섹션에서 Clerk 설정 확인:
   - **JWT Issuer (Issuer URL)**: `https://your-app-12.clerk.accounts.dev`
   - **JWKS Endpoint (JWKS URI)**: `https://your-app-12.clerk.accounts.dev/.well-known/jwks.json`

## 📦 Vercel 프로젝트 설정

### 1. Git 저장소 연결

1. [Vercel Dashboard](https://vercel.com/dashboard) 접속
2. **Add New...** → **Project** 클릭
3. GitHub 저장소 선택
4. 프로젝트 이름 확인 (원하는 대로 변경 가능)

### 2. 빌드 설정 확인

Vercel은 Next.js 프로젝트를 자동으로 감지하지만, 다음 설정을 확인하세요:

- **Framework Preset**: Next.js
- **Root Directory**: `/` (루트)
- **Build Command**: `next build` (자동 감지)
- **Output Directory**: `.next` (자동 감지)
- **Install Command**: `pnpm install` (자동 감지 또는 수동 설정)

### 3. 패키지 매니저 확인

Vercel이 `pnpm-lock.yaml` 또는 `package-lock.json`을 감지하면 자동으로 사용합니다.
프로젝트에서 `pnpm`을 사용하고 있다면 `pnpm-lock.yaml`이 있는지 확인하세요.

## 🖼️ 이미지 도메인 설정

`next.config.ts`에서 이미지 도메인 설정을 확인하세요:

```typescript
images: {
  remotePatterns: [
    { hostname: "img.clerk.com" },
    { hostname: "images.unsplash.com" },
    { protocol: "https", hostname: "**" }, // 개발용 (프로덕션에서는 제한 권장)
  ],
}
```

프로덕션에서는 모든 HTTPS 도메인(`**`) 허용을 제한하는 것이 좋습니다.
실제 사용하는 이미지 도메인만 추가하세요.

## 🧪 배포 전 테스트

### 로컬 빌드 테스트

배포 전에 로컬에서 프로덕션 빌드를 테스트하세요:

```bash
# 의존성 설치
pnpm install

# 프로덕션 빌드
pnpm build

# 빌드 성공 확인
# 에러가 없다면 Vercel 배포 가능
```

### 기능 테스트 체크리스트

배포 전에 다음 기능들을 로컬에서 테스트하세요:

- [ ] 사용자 회원가입/로그인 (Clerk)
- [ ] 제품 목록 조회
- [ ] 제품 상세 페이지
- [ ] 장바구니 추가 기능 ⚠️ **최근 추가됨**
- [ ] 장바구니 조회
- [ ] 장바구니 수량 변경
- [ ] 장바구니 아이템 삭제
- [ ] 제품 이미지 표시 (Tavily 연동 시)

## 📝 Vercel 배포 단계

1. **GitHub에 코드 푸시**

   ```bash
   git push origin main
   ```

2. **Vercel 자동 배포 확인**

   - Vercel이 GitHub 푸시를 감지하면 자동으로 빌드 시작
   - 빌드 로그 확인

3. **배포 완료 후 확인**
   - 배포된 URL로 접속하여 기능 테스트
   - 환경 변수가 제대로 설정되었는지 확인

## ⚠️ 주의사항

### 1. 환경 변수 보안

- `SUPABASE_SERVICE_ROLE_KEY`: 절대 클라이언트 코드에 노출되면 안 됨
- `CLERK_SECRET_KEY`: 절대 클라이언트 코드에 노출되면 안 됨
- `.env.local` 파일은 Git에 커밋하지 않음 (이미 `.gitignore`에 포함됨)

### 2. 데이터베이스 연결

- 프로덕션 Supabase 프로젝트와 개발 프로젝트를 분리하는 것을 권장
- 각 환경에 맞는 Supabase 프로젝트 URL과 키 사용

### 3. CORS 설정

- Clerk와 Supabase는 CORS를 자동으로 처리하므로 별도 설정 불필요
- Vercel 배포 URL을 Clerk Dashboard에 등록해야 함

### 4. 도메인 설정

커스텀 도메인을 사용하는 경우:

1. **Vercel Dashboard** → 프로젝트 → **Settings** → **Domains**
2. 도메인 추가 및 DNS 설정
3. **Clerk Dashboard** → **Domains & URLs**에서도 도메인 추가

## 🔍 문제 해결

### 빌드 실패 시

1. **빌드 로그 확인**: Vercel Dashboard → 프로젝트 → **Deployments** → 빌드 클릭
2. **로컬 빌드 테스트**: `pnpm build` 실행하여 에러 확인
3. **환경 변수 확인**: 모든 필수 환경 변수가 설정되었는지 확인

### 런타임 에러 시

1. **Vercel 로그 확인**: 프로젝트 → **Functions** → 에러 확인
2. **브라우저 콘솔 확인**: 클라이언트 사이드 에러 확인
3. **환경 변수 확인**: `NEXT_PUBLIC_*` 변수가 클라이언트에서 접근 가능한지 확인

### 데이터베이스 연결 에러 시

1. **Supabase 연결 확인**: Dashboard에서 프로젝트 상태 확인
2. **환경 변수 확인**: `NEXT_PUBLIC_SUPABASE_URL`과 키 값 확인
3. **Clerk 통합 확인**: Supabase Authentication Providers 설정 확인

## 📚 추가 리소스

- [Vercel 배포 가이드](https://vercel.com/docs)
- [Next.js 배포 가이드](https://nextjs.org/docs/deployment)
- [Clerk 배포 가이드](https://clerk.com/docs/deployments/overview)
- [Supabase 프로덕션 체크리스트](https://supabase.com/docs/guides/platform/going-into-prod)

---

**배포 준비가 완료되면 위 항목들을 모두 확인한 후 Vercel에 배포하세요!** 🚀

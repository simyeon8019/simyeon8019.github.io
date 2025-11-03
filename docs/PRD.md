# 쇼핑몰 MVP PRD (Product Requirements Document)

## 1. 프로젝트 개요

### 1.1 프로젝트명

의류 쇼핑몰 MVP

### 1.2 프로젝트 목적

20-30대 타겟 의류 쇼핑몰의 MVP를 2주 내 개발하여 빠르게 시장 검증

### 1.3 개발 기간

2주 (MVP 개발 및 배포)

### 1.4 타겟 사용자

- 주 타겟: 20-30대 남녀
- 주요 사용 시나리오: 의류 상품 탐색 → 장바구니 추가 → 주문 및 결제

---

## 2. 기술 스택

### 2.1 프론트엔드

- **Framework**: Next.js (App Router)
- **언어**: TypeScript
- **스타일링**: Tailwind CSS (또는 선택 가능한 CSS 프레임워크)

### 2.2 백엔드 & 데이터베이스

- **Database**: Supabase (PostgreSQL)
- **인증**: Clerk (로그인/회원가입만 담당)
- **결제**: Toss Payments (테스트 모드)
- **RLS**: 사용하지 않음 (서버 사이드에서 권한 관리)
- **이미지 검색**: Tavily API (제품 이미지 플레이스홀더 기능)

### 2.3 인프라

- **배포**: Vercel (권장) 또는 선택 가능한 플랫폼

---

## 3. 기능 요구사항

### 3.1 필수 기능 (MVP)

#### 3.1.1 홈페이지

**우선순위: P0 (최우선)**

홈페이지는 사용자가 처음 방문하는 진입점으로, 쇼핑몰의 전체 상품을 한눈에 볼 수 있도록 구성됩니다.

**주요 기능:**

1. **카테고리 네비게이션 섹션**

   - [ ] 6개 주요 카테고리 표시 (상의, 하의, 아우터, 드레스, 신발, 액세서리)
   - [ ] 카테고리 클릭 시 해당 카테고리 상품 목록 페이지로 이동
   - [ ] 각 카테고리 아이콘 또는 대표 이미지 표시
   - [ ] 반응형 그리드 레이아웃 (모바일: 2열, 태블릿: 3열, 데스크톱: 6열)

2. **인기 상품 섹션**

   - [ ] 주문량 기준 인기 상품 8-12개 표시
   - [ ] 상품 카드 컴포넌트 (이미지, 이름, 가격)
   - [ ] 더보기 버튼 (전체 상품 목록 페이지로 이동)
   - [ ] 로딩 상태 및 에러 처리

3. **전체 상품 목록 섹션**
   - [ ] 최신 상품 12-16개 미리보기 표시
   - [ ] 기본 정렬: 최신순 (created_at DESC)
   - [ ] 상품 카드 컴포넌트 (이미지, 이름, 가격)
   - [ ] 더보기 버튼 (전체 상품 목록 페이지로 이동)
   - [ ] 로딩 상태 및 에러 처리

**기술 요구사항:**

- API Route: `GET /api/products/popular` - 인기 상품 조회
- API Route: `GET /api/products` - 최신 상품 조회 (기존 API 활용)
- Supabase에서 상품 데이터 조회
- 이미지는 Supabase Storage 또는 CDN 사용
- 반응형 디자인 (모바일 우선)
- SEO 최적화 (메타데이터 설정)

#### 3.1.2 상품 목록 페이지

**우선순위: P0 (최우선)**

- [ ] 상품 목록 표시 (그리드 레이아웃)
- [ ] 상품 이미지, 이름, 가격 표시
- [ ] 무한 스크롤 또는 페이지네이션
- [ ] 카테고리 필터링 (선택사항: 상의, 하의, 아우터 등)
- [ ] 검색 기능 (상품명 기준)

**기술 요구사항:**

- Supabase에서 상품 데이터 조회
- 이미지는 Supabase Storage 또는 CDN 사용

#### 3.1.3 상품 상세 페이지

**우선순위: P0**

- [ ] 상품 이미지 갤러리 (메인 이미지 + 썸네일)
- [ ] 상품명, 가격, 설명 표시
- [ ] 수량 선택
- [ ] 장바구니 추가 버튼
- [ ] 바로 구매 버튼

**기술 요구사항:**

- 단일 상품 데이터 조회
- 재고 확인 (선택사항, MVP에서는 간단히만 처리)

#### 3.1.4 장바구니

**우선순위: P0**

- [ ] 장바구니에 담긴 상품 목록 표시
- [ ] 상품별 수량 변경
- [ ] 개별 상품 삭제
- [ ] 전체 선택/해제
- [ ] 선택된 상품 총 금액 계산
- [ ] 주문하기 버튼
**참고:** 사이즈 선택 기능은 제거되었습니다.

**기술 요구사항:**

- 로컬 스토리지 또는 Supabase에 저장 (선택)
- Clerk 인증 사용자만 장바구니 접근 가능

#### 3.1.5 주문 프로세스

**우선순위: P0**

- [ ] 주문서 작성 페이지
  - 배송지 정보 입력 (수령인, 주소, 연락처)
  - 주문 상품 확인
  - 최종 결제 금액 확인
- [ ] 주문 정보 Supabase에 저장
- [ ] 주문 완료 후 주문번호 생성

**기술 요구사항:**

- Clerk 사용자 ID와 연결
- 주문 상태: 대기, 완료, 취소

#### 3.1.6 결제 (Toss Payments)

**우선순위: P0**

- [ ] Toss Payments 테스트 모드 연동
- [ ] 결제 위젯 표시
- [ ] 결제 성공/실패 처리
- [ ] 결제 완료 후 주문 상태 업데이트

**기술 요구사항:**

- Toss Payments SDK 사용
- 결제 검증은 서버 사이드에서 처리 (API Route)

#### 3.1.7 마이페이지

**우선순위: P0**

- [ ] 주문 내역 조회
- [ ] 주문 상세 정보 확인
- [ ] 프로필 정보 수정 (선택사항)

**기술 요구사항:**

- Clerk 인증 정보와 Supabase 사용자 정보 연동
- 주문 내역은 사용자별로 필터링

---

## 4. 데이터베이스 스키마 (Supabase)

### 4.1 테이블 구조

#### 4.1.1 users (사용자 추가 정보)

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id TEXT UNIQUE NOT NULL, -- Clerk 사용자 ID
  email TEXT,
  name TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 4.1.2 products (상품)

```sql
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL CHECK (price >= 0), -- 원 단위, DECIMAL 타입
  image_url TEXT,
  category TEXT, -- 카테고리 (제약조건 없음, 자유로운 카테고리)
  stock_quantity INTEGER DEFAULT 0 CHECK (stock_quantity >= 0), -- 재고 수량, 음수 불가
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 4.1.3 cart_items (장바구니)

```sql
CREATE TABLE cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_id TEXT NOT NULL, -- Clerk 사용자 ID (users 테이블 없이 직접 사용)
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0), -- 수량
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  -- 같은 상품은 중복 방지 (클라이언트에서 수량만 업데이트하도록)
  UNIQUE(clerk_id, product_id)
);
```

#### 4.1.4 orders (주문)

```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_id TEXT NOT NULL, -- Clerk 사용자 ID
  total_amount DECIMAL(10,2) NOT NULL CHECK (total_amount >= 0), -- 총 주문 금액 (원 단위, DECIMAL)
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')), -- 주문 상태
  shipping_address JSONB, -- 배송지 정보 (JSONB)
  order_note TEXT, -- 주문 메모
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 4.1.5 order_items (주문 상품)

```sql
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  product_name TEXT NOT NULL, -- 주문 시점 상품명 (스냅샷)
  quantity INTEGER NOT NULL CHECK (quantity > 0), -- 주문 수량
  price DECIMAL(10,2) NOT NULL CHECK (price >= 0), -- 주문 시점 가격 (스냅샷, DECIMAL)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**참고:** 배송지 정보는 `orders` 테이블의 `shipping_address` JSONB 필드에 저장됩니다.

### 4.2 인덱스

```sql
-- 성능 최적화를 위한 인덱스
-- products 테이블 인덱스
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_is_active ON products(is_active);
CREATE INDEX idx_products_created_at ON products(created_at DESC); -- 최신순 정렬용

-- cart_items 테이블 인덱스
CREATE INDEX idx_cart_items_clerk_id ON cart_items(clerk_id);
CREATE INDEX idx_cart_items_product_id ON cart_items(product_id);
CREATE INDEX idx_cart_items_clerk_created ON cart_items(clerk_id, created_at DESC);

-- orders 테이블 인덱스
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_order_number ON orders(order_number);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
```

---

## 5. 인증 및 사용자 관리

### 5.1 Clerk 설정

- Clerk는 **로그인/회원가입만** 담당
- 로그인 성공 시, 사용자 정보를 Supabase `users` 테이블에 저장/업데이트
- Clerk User ID를 `clerk_user_id`로 저장하여 연결

### 5.2 사용자 정보 동기화

- Clerk 로그인 성공 시:
  1. Clerk에서 사용자 정보 조회
  2. Supabase `users` 테이블에서 `clerk_user_id`로 조회
  3. 없으면 새로 생성, 있으면 업데이트
- 이 로직은 서버 사이드 (API Route)에서 처리

### 5.3 권한 관리

- **RLS 사용 안 함**: 서버 사이드에서 권한 체크
- 주문 조회, 장바구니 등은 Clerk 인증 확인 후 처리
- Next.js Middleware에서 Clerk 세션 확인

---

## 6. API 설계 (Next.js API Routes)

### 6.1 사용자 관련

- `POST /api/users/sync` - Clerk 사용자 정보를 Supabase에 동기화

### 6.2 상품 관련

- `GET /api/products` - 상품 목록 조회 (쿼리 파라미터: category, search, page)
- `GET /api/products/[id]` - 상품 상세 조회
- `GET /api/products/popular` - 인기 상품 조회 (주문량 기준, 상위 8-12개)

### 6.3 주문 관련

- `POST /api/orders` - 주문 생성
- `GET /api/orders` - 사용자 주문 목록 조회
- `GET /api/orders/[id]` - 주문 상세 조회

### 6.4 결제 관련

- `POST /api/payments/verify` - Toss Payments 결제 검증
- `POST /api/payments/callback` - Toss Payments 웹훅 처리

---

## 7. UI/UX 요구사항

### 7.1 디자인 원칙

- **20-30대 타겟**: 모던하고 깔끔한 디자인
- **반응형 디자인**: 모바일 우선, 데스크톱 지원
- **직관적인 UX**: 최소 클릭으로 주문 완료

### 7.2 페이지 구성

1. **홈페이지**:
   - 카테고리 네비게이션 (6개 카테고리)
   - 인기 상품 섹션 (8-12개 상품)
   - 전체 상품 목록 섹션 (12-16개 최신 상품)
   - 반응형 그리드 레이아웃
   - SEO 최적화
2. **상품 목록**: 네비게이션, 상품 그리드, 필터링, 검색
3. **상품 상세**: 이미지, 정보, 선택 옵션, CTA 버튼
4. **장바구니**: 상품 목록, 수량 조절, 주문 버튼
5. **주문서**: 배송지 입력, 주문 확인
6. **결제**: Toss Payments 위젯
7. **주문 완료**: 주문번호, 완료 메시지
8. **마이페이지**: 주문 내역, 프로필

### 7.3 상태 관리

- 장바구니: Context API 또는 Zustand (선택)
- 사용자 정보: Clerk hooks 사용

---

## 8. 개발 우선순위

### Phase 1 (Week 1): 기본 구조 및 핵심 기능

1. ✅ Next.js 프로젝트 설정
2. ✅ Supabase 연동 및 스키마 생성
3. ✅ Clerk 인증 설정
4. ✅ 상품 목록/상세 페이지
5. ✅ 장바구니 기능

### Phase 2: 상품 기능 (1주)

1. 홈페이지 구현
   - 카테고리 네비게이션 섹션
   - 인기 상품 섹션 (API 개발 포함)
   - 전체 상품 목록 섹션
   - 반응형 디자인
   - SEO 최적화

### Phase 3 (Week 2): 주문 및 결제

1. ✅ 주문 프로세스 구현
2. ✅ Toss Payments 연동
3. ✅ 마이페이지 (주문 내역)
4. ✅ 배포 및 테스트

---

## 9. 제약사항 및 고려사항

### 9.1 MVP 범위 제외 기능

- ❌ 관리자 페이지 (초기에는 Supabase 직접 관리)
- ❌ 재고 관리 (간단한 플래그만 사용)
- ❌ 배송 추적
- ❌ 리뷰/평점
- ❌ 할인/쿠폰
- ❌ 이메일 알림
- ❌ 소셜 로그인 (Clerk 기본 제공)

### 9.2 보안 고려사항

- RLS 미사용 시, 서버 사이드에서 모든 데이터 접근 권한 체크
- 결제 검증은 반드시 서버에서 처리
- 환경 변수로 API 키 관리

### 9.3 성능 고려사항

- 이미지는 최적화 필요 (Next.js Image 컴포넌트 사용)
- 상품 목록은 페이지네이션 또는 무한 스크롤
- API 응답 캐싱 고려

---

## 10. 테스트 계획

### 10.1 주요 테스트 시나리오

1. 회원가입/로그인 → 상품 목록 조회
2. 상품 상세 → 장바구니 추가
3. 장바구니 → 주문하기
4. 주문서 작성 → 결제 진행
5. 결제 완료 → 주문 내역 확인

### 10.2 테스트 데이터

- 최소 10-20개 의류 상품 데이터 준비
- 다양한 카테고리 (상의, 하의, 아우터)
- 다양한 가격대

---

## 11. 배포 체크리스트

- [ ] 환경 변수 설정 (Clerk, Supabase, Toss Payments, Tavily API)
- [ ] Vercel 배포
- [ ] 도메인 연결 (선택사항)
- [ ] Toss Payments 테스트 모드 설정 확인
- [ ] 에러 로깅 설정 (Sentry 등, 선택사항)

---

## 12. 다음 단계 (MVP 이후)

- 관리자 대시보드 개발
- 재고 관리 시스템
- 배송 추적
- 리뷰/평점 시스템
- 할인/쿠폰 기능
- 이메일 알림

---

**작성일**: 2025-01-XX  
**작성자**: [작성자명]  
**버전**: 1.0 (MVP)

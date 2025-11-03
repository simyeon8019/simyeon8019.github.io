# 변경 이력 (Changelog)

프로젝트의 주요 변경사항과 개선 내역을 기록합니다.

---

## 2025-11-03 - 제품 이미지 검색 기능 개선 및 오류 해결

### 개요

제품 이미지 로딩 실패 오류를 해결하고, Unsplash API를 통합하여 안정적인 이미지 검색 시스템을 구축했습니다.

### 변경 파일

- `lib/utils/image-placeholder.ts` (수정)
- `next.config.ts` (수정)
- `app/api/products/route.ts` (수정)
- `app/api/products/[id]/route.ts` (수정)
- `app/page.tsx` (수정)
- `AGENTS.md` (수정)
- `docs/error-report-product-images.md` (신규)

### 주요 변경사항

#### 1. Unsplash API 통합 (1순위 이미지 소스)

- Unsplash API를 1순위 이미지 검색 소스로 추가
- 고품질, 안정적인 이미지 제공
- 한국어 제품명을 영어 키워드로 자동 변환 (요가 매트 → yoga mat)
- 스포츠 카테고리 검색 쿼리 최적화

**주요 기능**:
- `searchUnsplashImage()` 함수 추가
- 제품명 기반 영어 키워드 매핑
- 카테고리별 검색 쿼리 최적화

#### 2. 불안정한 도메인 이미지 필터링

- 티몬(폐업), Cafe24, 크로켓 등 불안정한 도메인 자동 필터링
- 검증 없이 바로 무시하고 새 이미지 검색
- 안정적인 도메인(Unsplash 등)만 사용

**필터링되는 도메인**:
- `tmon.kr` (티몬 - 폐업)
- `cafe24` (Cafe24)
- `croket.co.kr` (크로켓)

#### 3. 다중 이미지 소스 검색 전략

검색 순서:
1. **Unsplash API** (1순위) - 안정적이고 고품질
2. **Tavily API** (2순위) - 폴백, 다양한 소스

#### 4. 이미지 검증 및 자동 DB 저장

- 이미지 검색 성공 시 자동으로 DB에 저장
- 불안정한 도메인 이미지 감지 시 자동으로 새 이미지 검색
- 성공/실패 상세 로그 기록

**적용 위치**:
- `GET /api/products` - 상품 목록 조회 시
- `GET /api/products/[id]` - 상품 상세 조회 시
- 홈페이지 (`/`) - 인기 상품, 최신 상품 조회 시

#### 5. Next.js Image 도메인 설정

**`next.config.ts` 업데이트**:
- Unsplash 도메인 추가 (`images.unsplash.com`, `plus.unsplash.com`)
- 티몬, Cafe24, 크로켓 도메인 추가 (호환성)
- HTTP/HTTPS 모든 프로토콜 허용

#### 6. 환경 변수 설정

- `UNSPLASH_ACCESS_KEY` 추가 (1순위)
- `TAVILY_API_KEY` 유지 (2순위 폴백)

### 해결된 오류

#### 1. Next.js Image 도메인 미설정 오류

**오류 메시지**:
```
⨯ Invalid src prop (http://img2.tmon.kr/...) on `next/image`, 
hostname "img2.tmon.kr" is not configured under images in your `next.config.js`
```

**해결**: `next.config.ts`에 외부 이미지 도메인 `remotePatterns` 추가

#### 2. 외부 이미지 로딩 실패 오류

**오류 메시지**:
```
⨯ upstream image response failed for https://cafe24.poxo.com/... 404
⨯ upstream image response failed for https://img.croket.co.kr/... 403
⨯ upstream image response failed for http://img2.tmon.kr/... 500
```

**해결**: 
- 불안정한 도메인 이미지 자동 필터링
- Unsplash API를 통한 안정적인 이미지 소스 사용

### 관련 문서

- 에러 리포트: `docs/error-report-product-images.md`
- 작업 목록: `docs/TODO.md` - Phase 1: 제품 이미지 플레이스홀더 기능
- 환경 변수 가이드: `AGENTS.md`

---

## 2025-11-03 - 다양한 카테고리 테스트 상품 추가

### 개요

패션 상품만 있던 DB에 다른 카테고리(전자제품, 도서, 식품, 스포츠, 뷰티, 생활/가정)의 테스트 상품을 추가했습니다.

### 변경 파일

- `supabase/migrations/20251103111938_add_multi_category_products.sql` (신규)

### 주요 변경사항

#### 1. 테스트 상품 추가

총 52개의 다양한 카테고리 테스트 상품 추가:

- **전자제품 (electronics)**: 8개
  - 아이폰 15 Pro, 갤럭시 S24 울트라, 맥북 프로 16인치, 에어팟 프로 2세대, 아이패드 에어, 갤럭시 버즈 프로, 로지텍 MX 마스터 3S, LG 그램 17인치

- **도서 (books)**: 8개
  - 클린 코드, 이펙티브 타입스크립트, HTTP 완벽 가이드, 해리 포터와 마법사의 돌, 불편한 편의점, 미드나잇 라이브러리, 세이노의 가르침, 혼자 공부하는 머신러닝+딥러닝

- **식품 (food)**: 8개
  - 프리미엄 원두 커피, 유기농 아몬드, 올리브 오일 엑스트라 버진, 마트차 차이티, 유기농 꿀, 그래놀라 시리얼, 프리미엄 초콜릿 세트, 유기농 퀴노아

- **스포츠 (sports)**: 8개
  - 요가 매트, 덤벨 세트, 운동화 나이키 에어맥스, 등산 배낭, 자전거 헬멧, 프로틴 파우더, 수영 고글, 요가 블록 세트

- **뷰티 (beauty)**: 8개
  - 비타민C 세럼, 선크림 SPF50+, 히알루론산 수분 크림, 립스틱 세트, 아이크림, 클렌징 오일, 마스크팩, 향수

- **생활/가정 (home)**: 8개
  - 디퓨저 세트, 무선 청소기, 에어프라이어, 스마트 조명, 수면 안대, 주방 도마 세트, 차량용 공기청정기, 양탄자 러그

- **의류 (clothing)**: 4개
  - 오버핏 후드티, 슬림핏 청바지, 코치 재킷, 베이직 반팔 티셔츠

#### 2. 코드 연동 확인

기존 코드는 이미 7개 카테고리를 모두 지원하므로 추가 코드 변경 없음:

- `app/products/page.tsx`: 카테고리 필터 목록 (7개 카테고리)
- `components/ProductCard.tsx`: getCategoryLabel 함수 (7개 카테고리 매핑)
- `components/CategoryNavigation.tsx`: 홈페이지 카테고리 네비게이션 (7개 카테고리)
- `app/page.tsx`: 홈페이지 카테고리 표시

#### 3. 주의사항

실제 DB 스키마는 아직 shoppingmall.sql 구조로 마이그레이션되지 않아, 기존 스키마 구조에 맞춰 마이그레이션 파일을 생성했습니다:
- `price`: INTEGER (DECIMAL 아님)
- `stock_quantity` → `stock` (필드명)
- `sizes`: 배열 필드 (빈 배열로 처리)

---

## 2025-11-03 - shoppingmall.sql 구조로 DB 스키마 전환

### 개요

기존 의류 쇼핑몰 스키마를 shoppingmall.sql의 일반 상품 쇼핑몰 구조로 완전히 전환했습니다. 사이즈 선택 기능을 제거하고, 카테고리를 확장하여 다양한 상품 유형을 지원합니다.

### 변경 파일

- `supabase/migrations/20251103111020_migrate_to_shoppingmall_schema.sql` (신규)
- 모든 Product 인터페이스 파일
- 모든 API Route 파일
- 모든 UI 컴포넌트 파일
- `docs/PRD.md`

### 주요 변경사항

#### 1. 데이터베이스 스키마 변경

**products 테이블:**
- `price`: INTEGER → DECIMAL(10,2)
- `category`: CHECK 제약조건 제거 (자유로운 카테고리)
- `sizes`: 완전 제거
- `stock` → `stock_quantity` (필드명 변경)

**cart_items 테이블:**
- `size` 필드 완전 제거
- UNIQUE 제약조건 변경: `UNIQUE(clerk_id, product_id, size)` → `UNIQUE(clerk_id, product_id)`

**orders 테이블:**
- `user_id` → `clerk_id` (직접 Clerk ID 사용)
- `total_amount`: INTEGER → DECIMAL(10,2)
- `shipping_address`: JSONB 필드 추가
- `order_note`: TEXT 필드 추가
- `status`: 주문 상태 확장 ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')
- `payment_status`, `payment_id`, `order_number` 필드 제거 (shoppingmall.sql 구조에 맞춤)

**order_items 테이블:**
- `size` 필드 제거
- `product_price`: INTEGER → DECIMAL(10,2)

#### 2. 카테고리 변경

**기존 카테고리:**
- tops, bottoms, outerwear, dresses, shoes, accessories

**신규 카테고리:**
- electronics (전자제품)
- clothing (의류)
- books (도서)
- food (식품)
- sports (스포츠)
- beauty (뷰티)
- home (생활/가정)

#### 3. UI 변경사항

**상품 상세 페이지:**
- 사이즈 선택 UI 완전 제거
- 장바구니 추가 시 사이즈 선택 불필요

**장바구니 페이지:**
- 사이즈 표시 제거
- 상품 정보에서 사이즈 관련 정보 삭제

**카테고리 네비게이션:**
- 6개 → 7개 카테고리로 확장
- 아이콘 변경 (새 카테고리에 맞는 아이콘)
- 그리드 레이아웃 조정 (xl:grid-cols-7)

#### 4. 코드 변경사항

**타입 정의:**
- 모든 Product 인터페이스에서 `sizes` 필드 제거
- `stock` → `stock_quantity` 필드명 변경

**API Route:**
- 장바구니 API에서 `size` 파라미터 제거
- 장바구니 조회 시 `size` 필드 제거

**카테고리 라벨 변환 함수:**
- 모든 컴포넌트에서 새 카테고리 매핑 추가

### 샘플 데이터

20개의 샘플 상품이 마이그레이션과 함께 삽입되었습니다:
- 전자제품: 5개
- 의류: 4개
- 도서: 3개
- 식품: 3개
- 스포츠: 2개
- 뷰티: 2개
- 생활/가정: 1개

### 마이그레이션 파일

- 파일명: `supabase/migrations/20251103111020_migrate_to_shoppingmall_schema.sql`
- 기존 테이블 삭제 후 재생성
- 샘플 데이터 자동 삽입

---

## 2025-01-XX - 상품 목록 페이지 반응형 그리드 레이아웃 개선

### 개요

상품 목록 페이지(`app/products/page.tsx`)와 상품 카드 컴포넌트(`components/ProductCard.tsx`)의 반응형 디자인을 개선하여 다양한 화면 크기에서 최적화된 사용자 경험을 제공합니다.

### 변경 파일

- `app/products/page.tsx`
- `components/ProductCard.tsx`

### 주요 개선 사항

#### 1. 반응형 그리드 레이아웃 개선

**변경 전:**

- 모바일: 2열 고정
- 태블릿: 3열 고정
- 데스크톱: 4열 고정

**변경 후:**

- 모바일 (기본): 2열 (`grid-cols-2`)
- 태블릿 (sm 이상): 3열 (`sm:grid-cols-3`)
- 데스크톱 (lg 이상): 4열 (`lg:grid-cols-4`, `xl:grid-cols-4`)
- 그리드 간격 조정: 모바일 `gap-3`, 큰 화면 `gap-4`

#### 2. 상품 카드 컴포넌트 개선

**반응형 텍스트 크기:**

- 카테고리 라벨: 모바일 `text-[10px]`, 데스크톱 `sm:text-xs`
- 상품명: 모바일 `text-sm`, 데스크톱 `sm:text-base`
- 가격: 모바일 `text-sm`, 데스크톱 `sm:text-base`

**호버 효과 개선:**

- 카드 전체 확대 효과 추가 (`hover:scale-[1.02]`)
- 이미지에 그림자 효과 추가 (`shadow-sm` → `group-hover:shadow-md`)
- 부드러운 전환 애니메이션 (`transition-transform duration-200`)

**이미지 최적화:**

- `sizes` 속성 최적화: `(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw`
- 이미지 없을 때 아이콘 크기 반응형 조정

#### 3. 필터 및 검색 UI 반응형 개선

**레이아웃:**

- 모바일: 세로 배치 (`flex-col`)
- 데스크톱: 가로 배치 (`sm:flex-row`)
- 간격 조정: 모바일 `gap-3`, 데스크톱 자동 간격

**컴포넌트 크기:**

- 카테고리 선택기: 모바일 전체 너비, 태블릿 `sm:w-[180px]`, 데스크톱 `lg:w-[200px]`
- 검색 입력: 모바일 전체 너비, 태블릿 `sm:max-w-xs`, 데스크톱 `lg:max-w-md`

#### 4. 로딩 및 빈 상태 UI 개선

**로딩 상태:**

- 스피너와 안내 메시지 추가
- 반응형 크기: 모바일 `h-8 w-8`, 데스크톱 `sm:h-10 sm:w-10`
- 텍스트 크기 조정: 모바일 `text-sm`, 데스크톱 `sm:text-base`

**빈 상태:**

- 아이콘 추가 (`Grid3x3`)
- 검색/필터 결과에 따른 동적 메시지 표시
- 모바일 친화적인 레이아웃

#### 5. 페이지네이션 개선

**반응형 버튼:**

- 모바일: `h-8 w-8`, 데스크톱: `sm:h-9 sm:w-9`
- 페이지 번호 텍스트 크기: 모바일 `text-xs`, 데스크톱 `sm:text-sm`
- 생략 표시(`...`) 간격 조정

**정보 표시:**

- "전체 N개 중 X-Y개 표시 중" 형태로 상세 정보 제공
- 반응형 텍스트 크기 조정

#### 6. 헤더 및 메타 정보 개선

**헤더:**

- 아이콘 추가 (`Grid3x3`)
- 반응형 텍스트 크기: 모바일 `text-2xl`, 데스크톱 `sm:text-3xl`
- 상품 개수 실시간 표시 (`({total}개)`)
- 로딩 중에는 개수 숨김 처리

**간격 및 패딩:**

- 전체 페이지 패딩: 모바일 `py-4`, 태블릿 `sm:py-6`, 데스크톱 `lg:py-8`
- 섹션 간격 최적화

### 기술적 세부사항

#### 반응형 브레이크포인트

- 기본: 모바일 (640px 미만)
- `sm:`: 태블릿 (640px 이상)
- `lg:`: 데스크톱 (1024px 이상)
- `xl:`: 큰 화면 (1280px 이상)

#### 성능 최적화

- 이미지 `sizes` 속성으로 불필요한 이미지 다운로드 방지
- CSS 트랜지션으로 부드러운 애니메이션 (GPU 가속)
- 조건부 렌더링으로 불필요한 DOM 요소 최소화

### 사용자 경험 개선

1. **모바일 최적화**

   - 작은 화면에서도 읽기 쉬운 텍스트 크기
   - 터치하기 쉬운 버튼 크기
   - 효율적인 화면 공간 활용

2. **데스크톱 최적화**

   - 더 많은 정보를 한 번에 표시
   - 호버 효과로 인터랙션 피드백 강화
   - 넓은 화면 공간 활용

3. **일관성 유지**
   - 모든 화면 크기에서 일관된 디자인 언어
   - 부드러운 전환 효과로 자연스러운 사용자 경험

### 테스트 확인사항

- [x] 모바일 (375px, 414px)에서 2열 그리드 정상 동작
- [x] 태블릿 (768px)에서 3열 그리드 정상 동작
- [x] 데스크톱 (1024px, 1280px 이상)에서 4열 그리드 정상 동작
- [x] 필터 및 검색 UI 반응형 동작 확인
- [x] 페이지네이션 반응형 동작 확인
- [x] 로딩 및 빈 상태 UI 확인
- [x] 다크 모드에서 정상 동작 확인

### 관련 문서

- PRD 요구사항: `docs/PRD.md` - 3.1.2 상품 목록 페이지
- 작업 목록: `docs/TODO.md` - Phase 1: 상품 관련 기능
- 디자인 가이드: `.cursor/rules/web/design-rules.mdc`

---

**작성일**: 2025-01-XX  
**버전**: 1.0

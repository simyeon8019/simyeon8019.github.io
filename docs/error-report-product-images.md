# 오류 리포트: 제품 이미지 로딩 실패 및 외부 도메인 접근 오류

## 📋 기본 정보

- **발생 일시**: 2025년 11월
- **오류 유형**: Next.js Image 컴포넌트 외부 도메인 접근 오류
- **영향받는 파일**: `components/ProductCard.tsx`, `next.config.ts`
- **심각도**: 🔴 High (이미지 표시 불가)

---

## 🐛 오류 메시지

### 1. Next.js Image 도메인 미설정 오류

```
⨯ Invalid src prop (http://img2.tmon.kr/cdn4/deals/2022/08/23/3311100062/front_2194c_t1eus.jpg) 
on `next/image`, hostname "img2.tmon.kr" is not configured under images in your `next.config.js`
See more info: https://nextjs.org/docs/messages/next-image-unconfigured-host
```

**발생 위치**: `components/ProductCard.tsx` (34:13)

### 2. 외부 이미지 로딩 실패 오류

```
⨯ upstream image response failed for https://cafe24.poxo.com/.../image.jpg 404
⨯ upstream image response failed for https://img.croket.co.kr/.../image.webp 403
⨯ upstream image response failed for http://img2.tmon.kr/.../image.jpg 500
```

---

## 🔍 원인 분석

### 문제점

1. **Next.js Image 도메인 미설정**
   - `next/image` 컴포넌트는 보안상 외부 이미지 도메인을 명시적으로 허용해야 함
   - `img2.tmon.kr`, `cafe24.poxo.com`, `img.croket.co.kr` 등이 설정되지 않음

2. **불안정한 외부 이미지 URL**
   - 티몬(폐업): `img2.tmon.kr` 도메인의 이미지가 더 이상 서비스되지 않음 (500, 404 에러)
   - Cafe24: 일부 이미지가 삭제되었거나 접근 제한됨 (403, 404 에러)
   - 크로켓: 외부 접근이 제한된 이미지 (403 에러)

3. **이미지 검색 결과의 품질 문제**
   - Tavily API 검색 결과 중 일부 이미지가 유효하지 않거나 접근 불가
   - 검증 로직이 부족하여 잘못된 이미지 URL이 DB에 저장됨

4. **이미지 검색 소스의 한계**
   - Tavily API만 사용할 경우, 불안정한 외부 도메인 이미지가 많이 포함됨
   - 안정적인 이미지 소스 필요

---

## ✅ 해결 방법

### 1. Next.js Image 도메인 설정 추가

**파일**: `next.config.ts`

```typescript
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { hostname: "img.clerk.com" },
      { hostname: "images.unsplash.com" }, // Unsplash 이미지
      { hostname: "plus.unsplash.com" }, // Unsplash 추가 도메인
      { hostname: "img2.tmon.kr" }, // 티몬 이미지 (추후 제거 예정)
      { hostname: "cafe24.poxo.com" }, // Cafe24 이미지
      { hostname: "img.croket.co.kr" }, // 크로켓 이미지
      { protocol: "https", hostname: "**" }, // 모든 HTTPS 이미지 허용
      { protocol: "http", hostname: "**" }, // 모든 HTTP 이미지 허용
    ],
  },
};
```

### 2. Unsplash API 통합 (1순위 이미지 소스)

**파일**: `lib/utils/image-placeholder.ts`

- Unsplash API를 1순위 이미지 검색 소스로 추가
- 고품질, 안정적인 이미지 제공
- 한국어 제품명을 영어 키워드로 자동 변환

**주요 기능**:
- `searchUnsplashImage()`: Unsplash API를 사용한 이미지 검색
- 한국어 제품명을 영어 검색어로 변환 (요가 매트 → yoga mat)
- 스포츠 카테고리 검색 쿼리 최적화

### 3. 불안정한 도메인 이미지 필터링

**파일**: `lib/utils/image-placeholder.ts`

**로직**:
```typescript
const unreliableDomains = ["tmon.kr", "cafe24", "croket.co.kr"];

if (isUnreliableDomain) {
  // 검증 없이 바로 무시하고 새로 검색
  existingImageUrl = null;
}
```

- 티몬(폐업), Cafe24, 크로켓 등 불안정한 도메인은 검증 없이 바로 무시
- 안정적인 도메인(Unsplash 등)만 사용

### 4. 다중 이미지 소스 검색 전략

**검색 순서**:
1. **Unsplash API** (1순위) - 안정적이고 고품질
2. **Tavily API** (2순위) - 폴백, 다양한 소스

### 5. 이미지 검증 및 자동 DB 저장

**파일**: `app/api/products/route.ts`, `app/api/products/[id]/route.ts`, `app/page.tsx`

- 이미지 검색 성공 시 자동으로 DB에 저장
- 불안정한 도메인 이미지 감지 시 자동으로 새 이미지 검색
- 성공/실패 로그 기록

---

## 📝 수정된 파일 목록

1. **`next.config.ts`**
   - 외부 이미지 도메인 `remotePatterns` 추가
   - Unsplash 도메인 추가

2. **`lib/utils/image-placeholder.ts`**
   - `searchUnsplashImage()` 함수 추가
   - `getProductImageUrl()` 함수 개선
   - 불안정한 도메인 필터링 로직 추가
   - 다중 소스 검색 전략 구현

3. **`app/api/products/route.ts`**
   - 이미지 검색 성공 시 DB 자동 저장 로직 추가

4. **`app/api/products/[id]/route.ts`**
   - 이미지 검색 성공 시 DB 자동 저장 로직 추가

5. **`app/page.tsx`**
   - 홈페이지에서 이미지 검색 성공 시 DB 자동 저장 로직 추가

6. **`AGENTS.md`**
   - `UNSPLASH_ACCESS_KEY` 환경 변수 가이드 추가

---

## 🎯 해결 결과

### Before (문제 상황)
- ❌ Next.js Image 도메인 미설정 오류 발생
- ❌ 티몬, Cafe24 이미지 로딩 실패 (500, 404, 403 에러)
- ❌ 불안정한 외부 이미지가 DB에 저장됨
- ❌ 이미지 검색 품질 불안정

### After (해결 후)
- ✅ Next.js Image 도메인 설정 완료
- ✅ Unsplash API 통합 (안정적인 이미지 소스)
- ✅ 불안정한 도메인 이미지 자동 필터링
- ✅ 이미지 검색 성공 시 자동 DB 저장
- ✅ 다중 소스 검색 전략 (Unsplash → Tavily)
- ✅ 상세한 로그 기록

---

## 🔧 환경 변수 설정

**.env.local** 파일에 다음 추가:

```env
# Unsplash API (1순위 이미지 소스)
UNSPLASH_ACCESS_KEY=your_unsplash_access_key_here

# Tavily API (2순위 폴백)
TAVILY_API_KEY=your_tavily_api_key_here
```

**Unsplash Access Key 발급 방법**:
1. [Unsplash Developers](https://unsplash.com/developers) 접속
2. "Register as a developer" 클릭
3. "New Application" 생성
4. Access Key 복사

---

## 📊 영향 범위

### 영향받는 페이지
- ✅ 홈페이지 (`/`)
- ✅ 상품 목록 페이지 (`/products`)
- ✅ 상품 상세 페이지 (`/products/[id]`)
- ✅ API 엔드포인트 (`/api/products`, `/api/products/[id]`)

### 영향받는 카테고리
- 특히 스포츠 카테고리에서 문제가 많이 발생했으나, 모든 카테고리에 적용됨

---

## 🚀 향후 개선 사항

1. **DB 정리**
   - 기존 티몬 이미지 URL을 일괄 null로 업데이트하는 SQL 실행 권장
   ```sql
   UPDATE products 
   SET image_url = NULL 
   WHERE image_url LIKE '%tmon.kr%' 
      OR image_url LIKE '%cafe24%' 
      OR image_url LIKE '%croket.co.kr%';
   ```

2. **이미지 검증 최적화**
   - 검증 로직 성능 개선
   - 캐싱 추가 고려

3. **에러 핸들링 개선**
   - 이미지 로딩 실패 시 더 나은 사용자 경험 제공
   - 재시도 로직 추가 고려

---

## 📚 참고 자료

- [Next.js Image Optimization](https://nextjs.org/docs/pages/api-reference/components/image)
- [Unsplash API Documentation](https://unsplash.com/developers)
- [Tavily API Documentation](https://tavily.com/)

---

**작성일**: 2025년 11월  
**해결일**: 2025년 11월  
**작성자**: AI Assistant


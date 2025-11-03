-- =====================================================
-- 쇼핑몰 MVP 데이터베이스 마이그레이션
-- 작성일: 2025-02-13
-- 기술 스택: Next.js, Supabase, Clerk, Toss Payments
-- =====================================================

-- =====================================================
-- 1. Users 테이블 생성
-- =====================================================
-- Clerk 인증과 연동되는 사용자 정보를 저장하는 테이블

CREATE TABLE IF NOT EXISTS public.users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    clerk_id TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- 테이블 소유자 설정
ALTER TABLE public.users OWNER TO postgres;

-- Row Level Security (RLS) 비활성화
-- 개발 단계에서는 RLS를 끄고, 프로덕션에서는 활성화하는 것을 권장합니다
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- 권한 부여
GRANT ALL ON TABLE public.users TO anon;
GRANT ALL ON TABLE public.users TO authenticated;
GRANT ALL ON TABLE public.users TO service_role;

-- =====================================================
-- 2. Products 테이블 생성
-- =====================================================
-- 상품 정보 테이블

CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    price INTEGER NOT NULL CHECK (price > 0), -- 원 단위, 양수만 허용
    image_url TEXT,
    category TEXT NOT NULL CHECK (category IN ('tops', 'bottoms', 'outerwear', 'dresses', 'shoes', 'accessories')), -- 카테고리 제한
    sizes TEXT[] NOT NULL DEFAULT '{}', -- 사용 가능한 사이즈 배열 (예: ['XS', 'S', 'M', 'L', 'XL'])
    stock INTEGER DEFAULT 0 CHECK (stock >= 0), -- 재고 수량, 음수 불가
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE products IS '상품 정보 테이블';
COMMENT ON COLUMN products.price IS '가격 (원 단위)';
COMMENT ON COLUMN products.category IS '상품 카테고리: tops, bottoms, outerwear, dresses, shoes, accessories';
COMMENT ON COLUMN products.sizes IS '사용 가능한 사이즈 배열';
COMMENT ON COLUMN products.stock IS '재고 수량';

-- =====================================================
-- 3. Cart Items 테이블 생성
-- =====================================================
-- 장바구니 아이템 (Clerk 사용자 ID 기반)

CREATE TABLE IF NOT EXISTS cart_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clerk_id TEXT NOT NULL, -- Clerk 사용자 ID (users 테이블 없이 직접 사용)
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    size TEXT NOT NULL, -- 선택한 사이즈
    quantity INTEGER NOT NULL CHECK (quantity > 0 AND quantity <= 99), -- 수량 제한 (1-99)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    -- 같은 상품, 같은 사이즈는 중복 방지 (클라이언트에서 수량만 업데이트하도록)
    UNIQUE(clerk_id, product_id, size)
);

COMMENT ON TABLE cart_items IS '장바구니 아이템 (Clerk 사용자 ID 기반)';
COMMENT ON COLUMN cart_items.clerk_id IS 'Clerk 인증 사용자 ID';
COMMENT ON COLUMN cart_items.quantity IS '수량 (1-99)';

-- =====================================================
-- 4. 인덱스 생성 (성능 최적화)
-- =====================================================

-- products 테이블 인덱스
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC); -- 최신순 정렬용

-- cart_items 테이블 인덱스
CREATE INDEX IF NOT EXISTS idx_cart_items_clerk_id ON cart_items(clerk_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_product_id ON cart_items(product_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_clerk_created ON cart_items(clerk_id, created_at DESC);

-- =====================================================
-- 5. 트리거 함수: updated_at 자동 업데이트
-- =====================================================

-- updated_at 자동 업데이트 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- products 테이블 트리거
DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- cart_items 테이블 트리거
DROP TRIGGER IF EXISTS update_cart_items_updated_at ON cart_items;
CREATE TRIGGER update_cart_items_updated_at
    BEFORE UPDATE ON cart_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 6. RLS (Row Level Security) 명시적 비활성화
-- =====================================================
-- PRD에 명시된대로 RLS를 사용하지 않음
-- 서버 사이드에서 권한 체크 처리

ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items DISABLE ROW LEVEL SECURITY;

-- =====================================================
-- 마이그레이션 완료
-- =====================================================

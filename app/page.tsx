import type { Metadata } from "next";
import CategoryNavigation from "@/components/CategoryNavigation";
import ProductSection from "@/components/ProductSection";
import { createClerkSupabaseClient } from "@/lib/supabase/server";
import { getProductImageUrl } from "@/lib/utils/image-placeholder";

export const metadata: Metadata = {
  title: "홈 - 쇼핑몰",
  description:
    "전자제품, 의류, 도서, 식품, 스포츠, 뷰티, 생활/가정 등 다양한 상품을 한눈에 확인하세요.",
  openGraph: {
    title: "홈 - 쇼핑몰",
    description: "다양한 상품을 한눈에 확인하세요.",
    type: "website",
  },
};

interface Product {
  id: string;
  name: string;
  price: number;
  image_url: string | null;
  category: string;
}

/**
 * 홈페이지
 * 카테고리 네비게이션, 인기 상품, 최신 상품을 표시합니다.
 */
export default async function Home() {
  const supabase = createClerkSupabaseClient();

  // 인기 상품 조회 (API와 동일한 로직 사용)
  let popularProducts: Product[] = [];
  let popularError: string | null = null;
  try {
    // 주문 데이터 조회 시도
    const { data: orderItems, error: orderError } = await supabase
      .from("order_items")
      .select("product_id, quantity")
      .limit(1000); // 최근 주문 아이템 1000개만 확인

    if (!orderError && orderItems && orderItems.length > 0) {
      // 주문량 집계
      const productCounts = orderItems.reduce(
        (acc: Record<string, number>, item) => {
          if (!item.product_id) return acc;
          const productId = item.product_id;
          acc[productId] = (acc[productId] || 0) + item.quantity;
          return acc;
        },
        {} as Record<string, number>
      );

      // 상위 12개 상품 ID 추출
      const topProductIds = Object.entries(productCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 12)
        .map(([id]) => id);

      if (topProductIds.length > 0) {
        // 상품 정보 조회
        const { data, error: productsError } = await supabase
          .from("products")
          .select("*")
          .in("id", topProductIds)
          .eq("is_active", true)
          .limit(12);

        if (!productsError && data) {
          popularProducts = data;
        }
      }
    }

    // 주문 데이터가 없거나 부족하면 최신 상품으로 채우기
    if (popularProducts.length < 12) {
      const { data: latestProducts, error: latestError } = await supabase
        .from("products")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(12 - popularProducts.length);

      if (!latestError && latestProducts) {
        // 중복 제거
        const existingIds = new Set(popularProducts.map((p) => p.id));
        const newProducts = latestProducts.filter(
          (p) => !existingIds.has(p.id)
        );
        popularProducts = [...popularProducts, ...newProducts];
      }
    }

    if (popularProducts.length === 0) {
      console.log("📊 인기 상품 조회: 상품 데이터 없음");
      popularError = null; // 데이터 없음은 에러가 아님
    } else {
      console.log("✅ 인기 상품 조회 성공:", {
        count: popularProducts.length,
        timestamp: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.error("❌ 인기 상품 조회 실패:", error);
    popularError = "인기 상품을 불러오는 중 오류가 발생했습니다.";

    // 에러 발생 시 최신 상품으로 대체
    try {
      const { data } = await supabase
        .from("products")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(12);

      if (data && data.length > 0) {
        popularProducts = data;
        popularError = null; // 데이터가 있으면 에러 없음
      }
    } catch (fallbackError) {
      console.error("❌ 인기 상품 대체 조회 실패:", fallbackError);
    }
  }

  // 인기 상품 이미지 보강
  const popularProductsWithImages = await Promise.all(
    popularProducts.map(async (product) => {
      if (!product.image_url) {
        const imageUrl = await getProductImageUrl(
          product.image_url,
          product.name,
          product.category
        );
        return {
          ...product,
          image_url: imageUrl,
        };
      }
      return product;
    })
  );

  // 최신 상품 조회 (16개)
  const { data: latestProducts, error: latestError } = await supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(16);

  if (latestError) {
    console.error("❌ 최신 상품 조회 실패:", latestError);
  }

  // 최신 상품 이미지 보강
  const latestProductsWithImages =
    latestProducts && latestProducts.length > 0
      ? await Promise.all(
          latestProducts.map(async (product) => {
            if (!product.image_url) {
              const imageUrl = await getProductImageUrl(
                product.image_url,
                product.name,
                product.category
              );
              return {
                ...product,
                image_url: imageUrl,
              };
            }
            return product;
          })
        )
      : [];

  return (
    <main className="min-h-[calc(100vh-80px)]">
      {/* 카테고리 네비게이션 섹션 */}
      <CategoryNavigation />

      {/* 인기 상품 섹션 - 최신 상품 위에 표시 */}
      <div className="bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        <ProductSection
          title="인기 상품"
          products={popularProductsWithImages || []}
          viewAllHref="/products"
          error={
            popularError ||
            (popularProductsWithImages.length === 0 ? "상품이 없습니다." : null)
          }
        />
      </div>

      {/* 최신 상품 섹션 */}
      <ProductSection
        title="최신 상품"
        products={latestProductsWithImages || []}
        viewAllHref="/products"
        error={latestError ? "최신 상품을 불러오는데 실패했습니다." : null}
      />
    </main>
  );
}

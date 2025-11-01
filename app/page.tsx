import type { Metadata } from "next";
import CategoryNavigation from "@/components/CategoryNavigation";
import ProductSection from "@/components/ProductSection";
import { createClerkSupabaseClient } from "@/lib/supabase/server";
import { getProductImageUrl } from "@/lib/utils/image-placeholder";

export const metadata: Metadata = {
  title: "홈 - 의류 쇼핑몰",
  description:
    "트렌디한 의류를 만나보세요. 상의, 하의, 아우터, 드레스, 신발, 액세서리 등 다양한 상품을 한눈에 확인하세요.",
  openGraph: {
    title: "홈 - 의류 쇼핑몰",
    description: "트렌디한 의류를 만나보세요. 다양한 상품을 한눈에 확인하세요.",
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

  // 인기 상품 조회 (최대 12개)
  let popularProducts: Product[] = [];
  try {
    const { data: orderItems } = await supabase
      .from("order_items")
      .select("product_id, quantity")
      .limit(1000); // 최근 주문 아이템 1000개만 확인

    if (orderItems && orderItems.length > 0) {
      // 주문량 집계
      const productCounts = orderItems.reduce(
        (acc: Record<string, number>, item) => {
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
        const { data } = await supabase
          .from("products")
          .select("*")
          .in("id", topProductIds)
          .eq("is_active", true)
          .limit(12);

        if (data) {
          popularProducts = data;
        }
      }
    }

    // 주문 데이터가 없거나 부족하면 최신 상품으로 채우기
    if (popularProducts.length < 12) {
      const { data: latestProducts } = await supabase
        .from("products")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(12 - popularProducts.length);

      if (latestProducts) {
        popularProducts = [...popularProducts, ...latestProducts];
      }
    }
  } catch (error) {
    console.error("❌ 인기 상품 조회 실패:", error);
    // 에러 발생 시 최신 상품으로 대체
    const { data } = await supabase
      .from("products")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(12);

    if (data) {
      popularProducts = data;
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

      {/* 인기 상품 섹션 */}
      <ProductSection
        title="인기 상품"
        products={popularProductsWithImages || []}
        viewAllHref="/products?sort=popular"
        error={
          popularProductsWithImages.length === 0 ? "상품이 없습니다." : null
        }
      />

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

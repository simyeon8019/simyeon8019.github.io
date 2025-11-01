import { NextResponse } from "next/server";
import { createClerkSupabaseClient } from "@/lib/supabase/server";

/**
 * 인기 상품 조회 API
 * 주문량 기준으로 가장 많이 팔린 상품 8-12개를 반환합니다.
 * MVP 단계에서는 주문 데이터가 없을 경우 최신 상품을 반환합니다.
 */
export async function GET() {
  try {
    const supabase = createClerkSupabaseClient();
    let popularProducts = [];

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

    // 최종적으로 데이터가 없으면 빈 배열 반환
    if (popularProducts.length === 0) {
      console.log("📊 인기 상품 조회: 상품 데이터 없음");
    } else {
      console.log("✅ 인기 상품 조회 성공:", {
        count: popularProducts.length,
        timestamp: new Date().toISOString(),
      });
    }

    return NextResponse.json({
      success: true,
      products: popularProducts,
      count: popularProducts.length,
    });
  } catch (error) {
    console.error("❌ 인기 상품 조회 에러:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

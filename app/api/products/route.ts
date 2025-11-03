import { NextRequest, NextResponse } from "next/server";
import { getServiceRoleClient } from "@/lib/supabase/service-role";
import { getProductImageUrl } from "@/lib/utils/image-placeholder";

/**
 * 상품 목록 조회 API
 * 쿼리 파라미터: category, search, page, limit
 * Service Role 클라이언트 사용: 공개 상품 데이터 조회
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "16", 10);

    const supabase = getServiceRoleClient();
    let query = supabase.from("products").select("*").eq("is_active", true);

    // 카테고리 필터링
    if (category) {
      query = query.eq("category", category);
    }

    // 검색 기능 (상품명 기준)
    if (search) {
      query = query.ilike("name", `%${search}%`);
    }

    // 정렬: 최신순
    query = query.order("created_at", { ascending: false });

    // 페이지네이션
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data: products, error } = await query;

    if (error) {
      console.error("❌ 상품 목록 조회 실패:", error);
      return NextResponse.json(
        { error: "상품 목록 조회에 실패했습니다.", details: error.message },
        { status: 500 }
      );
    }

    // 전체 개수 조회 (페이지네이션용)
    let countQuery = supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true);

    if (category) {
      countQuery = countQuery.eq("category", category);
    }

    if (search) {
      countQuery = countQuery.ilike("name", `%${search}%`);
    }

    const { count, error: countError } = await countQuery;

    if (countError) {
      console.error("❌ 상품 개수 조회 실패:", countError);
      // count 에러는 무시하고 계속 진행
    }

    // 이미지 URL이 null인 경우 Tavily 검색으로 보강 및 DB 저장
    const productsWithImages =
      products && products.length > 0
        ? await Promise.all(
            products.map(async (product) => {
              if (!product.image_url) {
                const imageUrl = await getProductImageUrl(
                  product.image_url,
                  product.name,
                  product.category
                );
                
                // 이미지를 찾았으면 DB에 저장 (기존 방법대로)
                if (imageUrl) {
                  try {
                    const { error: updateError } = await supabase
                      .from("products")
                      .update({ image_url: imageUrl })
                      .eq("id", product.id);

                    if (updateError) {
                      console.error("❌ 제품 이미지 DB 업데이트 실패:", {
                        productId: product.id,
                        productName: product.name,
                        error: updateError.message,
                        timestamp: new Date().toISOString(),
                      });
                    } else {
                      console.log("✅ 제품 이미지 DB 업데이트 성공:", {
                        productId: product.id,
                        productName: product.name,
                        imageUrl,
                        timestamp: new Date().toISOString(),
                      });
                    }
                  } catch (updateError) {
                    console.error("❌ 제품 이미지 DB 업데이트 에러:", {
                      productId: product.id,
                      error: updateError instanceof Error ? updateError.message : String(updateError),
                      timestamp: new Date().toISOString(),
                    });
                  }
                }
                
                return {
                  ...product,
                  image_url: imageUrl,
                };
              }
              return product;
            })
          )
        : [];

    console.log("✅ 상품 목록 조회 성공:", {
      count: productsWithImages.length,
      total: count || 0,
      page,
      category,
      search,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      products: productsWithImages,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error("❌ 상품 목록 조회 에러:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

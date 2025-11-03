import { NextRequest, NextResponse } from "next/server";
import { getServiceRoleClient } from "@/lib/supabase/service-role";
import { getProductImageUrl } from "@/lib/utils/image-placeholder";

/**
 * 단일 상품 조회 API
 * Service Role 클라이언트 사용: 공개 상품 데이터 조회
 * @param id - 상품 ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "상품 ID가 필요합니다." },
        { status: 400 }
      );
    }

    const supabase = getServiceRoleClient();

    // 상품 정보 조회
    const { data: product, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .eq("is_active", true)
      .single();

    if (error) {
      console.error("❌ 상품 조회 실패:", error);

      // 상품을 찾을 수 없는 경우
      if (error.code === "PGRST116") {
        return NextResponse.json(
          { error: "상품을 찾을 수 없습니다." },
          { status: 404 }
        );
      }

      return NextResponse.json(
        { error: "상품 조회에 실패했습니다.", details: error.message },
        { status: 500 }
      );
    }

    if (!product) {
      return NextResponse.json(
        { error: "상품을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // 이미지 URL이 null인 경우 Tavily 검색으로 보강 및 DB 저장
    let imageUrl = product.image_url;
    if (!imageUrl) {
      imageUrl = await getProductImageUrl(
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
    }

    const productWithImage = {
      ...product,
      image_url: imageUrl,
    };

    console.log("✅ 상품 조회 성공:", {
      productId: product.id,
      productName: product.name,
      hasImage: !!imageUrl,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      product: productWithImage,
    });
  } catch (error) {
    console.error("❌ 상품 조회 에러:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

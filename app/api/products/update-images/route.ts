import { NextRequest, NextResponse } from "next/server";
import { getServiceRoleClient } from "@/lib/supabase/service-role";

/**
 * 제품 이미지 업데이트 API
 * 제품 ID와 이미지 URL을 받아서 업데이트합니다.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, imageUrl } = body;

    if (!productId || !imageUrl) {
      return NextResponse.json(
        { error: "productId와 imageUrl이 필요합니다." },
        { status: 400 }
      );
    }

    const supabase = getServiceRoleClient();

    const { data, error } = await supabase
      .from("products")
      .update({ image_url: imageUrl })
      .eq("id", productId)
      .select()
      .single();

    if (error) {
      console.error("❌ 제품 이미지 업데이트 실패:", {
        productId,
        error: error.message,
        timestamp: new Date().toISOString(),
      });
      return NextResponse.json(
        {
          error: "제품 이미지 업데이트에 실패했습니다.",
          details: error.message,
        },
        { status: 500 }
      );
    }

    console.log("✅ 제품 이미지 업데이트 성공:", {
      productId,
      productName: data?.name,
      imageUrl,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      product: data,
    });
  } catch (error) {
    console.error("❌ 제품 이미지 업데이트 에러:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

/**
 * 모든 제품의 이미지를 Tavily로 검색하여 업데이트하는 배치 작업
 */
export async function PUT(request: NextRequest) {
  try {
    const supabase = getServiceRoleClient();

    // 모든 활성 제품 조회
    const { data: products, error: fetchError } = await supabase
      .from("products")
      .select("id, name, category, image_url")
      .eq("is_active", true);

    if (fetchError) {
      console.error("❌ 제품 목록 조회 실패:", fetchError);
      return NextResponse.json(
        {
          error: "제품 목록 조회에 실패했습니다.",
          details: fetchError.message,
        },
        { status: 500 }
      );
    }

    if (!products || products.length === 0) {
      return NextResponse.json({
        success: true,
        message: "업데이트할 제품이 없습니다.",
        updated: 0,
      });
    }

    const results = [];

    // 각 제품에 대해 Tavily 검색 및 업데이트
    for (const product of products) {
      try {
        // 이미 이미지가 있으면 건너뛰기 (선택사항)
        // if (product.image_url) {
        //   results.push({
        //     productId: product.id,
        //     productName: product.name,
        //     status: "skipped",
        //     reason: "이미 이미지가 있습니다.",
        //   });
        //   continue;
        // }

        // Tavily API로 이미지 검색
        const searchQuery = `${product.name} ${product.category} 패션 의류 상품 이미지`;

        // 클라이언트 측에서 Tavily를 호출할 수 없으므로,
        // 서버 측에서 환경 변수를 통해 Tavily API 키를 확인
        const tavilyApiKey = process.env.TAVILY_API_KEY;

        if (!tavilyApiKey) {
          results.push({
            productId: product.id,
            productName: product.name,
            status: "error",
            error: "TAVILY_API_KEY가 설정되지 않았습니다.",
          });
          continue;
        }

        // Tavily API 호출
        const tavilyResponse = await fetch("https://api.tavily.com/search", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            api_key: tavilyApiKey,
            query: searchQuery,
            search_depth: "basic",
            include_images: true,
            max_results: 5,
          }),
        });

        if (!tavilyResponse.ok) {
          const errorText = await tavilyResponse.text();
          results.push({
            productId: product.id,
            productName: product.name,
            status: "error",
            error: `Tavily API 호출 실패: ${tavilyResponse.status}`,
          });
          continue;
        }

        const tavilyData = await tavilyResponse.json();
        const images = tavilyData.images || [];

        if (images.length === 0) {
          results.push({
            productId: product.id,
            productName: product.name,
            status: "error",
            error: "이미지 검색 결과가 없습니다.",
          });
          continue;
        }

        // 첫 번째 이미지 URL 사용
        const imageUrl = images[0];

        // DB에 이미지 URL 업데이트
        const { error: updateError } = await supabase
          .from("products")
          .update({ image_url: imageUrl })
          .eq("id", product.id);

        if (updateError) {
          results.push({
            productId: product.id,
            productName: product.name,
            status: "error",
            error: updateError.message,
          });
          continue;
        }

        results.push({
          productId: product.id,
          productName: product.name,
          status: "success",
          imageUrl,
        });

        console.log("✅ 제품 이미지 업데이트 성공:", {
          productId: product.id,
          productName: product.name,
          imageUrl,
          timestamp: new Date().toISOString(),
        });

        // API 호출 간 딜레이 (Rate limiting 방지)
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (error) {
        results.push({
          productId: product.id,
          productName: product.name,
          status: "error",
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    const successCount = results.filter((r) => r.status === "success").length;
    const errorCount = results.filter((r) => r.status === "error").length;

    console.log("✅ 배치 이미지 업데이트 완료:", {
      total: products.length,
      success: successCount,
      error: errorCount,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      total: products.length,
      successCount,
      errorCount,
      results,
    });
  } catch (error) {
    console.error("❌ 배치 이미지 업데이트 에러:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

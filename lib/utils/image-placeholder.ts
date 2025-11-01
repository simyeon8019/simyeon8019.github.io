/**
 * 제품 이미지 플레이스홀더 유틸리티
 * Tavily API를 사용하여 제품명 기반 이미지를 검색합니다.
 */

interface TavilySearchResponse {
  images?: string[];
  error?: string;
}

/**
 * Tavily API를 사용하여 제품 이미지 검색
 * @param productName - 제품명
 * @param category - 제품 카테고리 (선택사항)
 * @returns 이미지 URL 또는 null
 */
export async function searchProductImage(
  productName: string,
  category?: string
): Promise<string | null> {
  try {
    const apiKey = process.env.TAVILY_API_KEY;

    // API 키가 없으면 null 반환 (기존 SVG 플레이스홀더 사용)
    if (!apiKey) {
      console.warn(
        "⚠️ TAVILY_API_KEY가 설정되지 않았습니다. 이미지 검색을 건너뜁니다."
      );
      return null;
    }

    // 검색 쿼리 생성 (제품명 + 카테고리)
    const searchQuery = category
      ? `${productName} ${category} product image`
      : `${productName} product image`;

    console.log("🔍 Tavily 이미지 검색 시작:", {
      query: searchQuery,
      productName,
      category,
      timestamp: new Date().toISOString(),
    });

    // Tavily API 호출
    const response = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        api_key: apiKey,
        query: searchQuery,
        search_depth: "basic",
        include_images: true,
        max_results: 5,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Tavily API 호출 실패:", {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
        timestamp: new Date().toISOString(),
      });
      return null;
    }

    const data = await response.json();

    // 이미지 URL 추출
    const images = data.images || [];

    if (images.length === 0) {
      console.warn("⚠️ Tavily 이미지 검색 결과 없음:", {
        query: searchQuery,
        timestamp: new Date().toISOString(),
      });
      return null;
    }

    // 첫 번째 이미지 URL 반환
    const imageUrl = images[0];

    console.log("✅ Tavily 이미지 검색 성공:", {
      query: searchQuery,
      imageUrl,
      totalImages: images.length,
      timestamp: new Date().toISOString(),
    });

    return imageUrl;
  } catch (error) {
    console.error("❌ Tavily 이미지 검색 에러:", {
      error: error instanceof Error ? error.message : String(error),
      productName,
      category,
      timestamp: new Date().toISOString(),
    });
    return null;
  }
}

/**
 * 제품 이미지 URL 가져오기 (기존 이미지가 있으면 사용, 없으면 Tavily 검색)
 * @param existingImageUrl - 기존 이미지 URL (null 가능)
 * @param productName - 제품명
 * @param category - 제품 카테고리 (선택사항)
 * @returns 이미지 URL 또는 null
 */
export async function getProductImageUrl(
  existingImageUrl: string | null,
  productName: string,
  category?: string
): Promise<string | null> {
  // 기존 이미지가 있으면 그대로 반환
  if (existingImageUrl) {
    return existingImageUrl;
  }

  // 기존 이미지가 없으면 Tavily 검색
  return await searchProductImage(productName, category);
}

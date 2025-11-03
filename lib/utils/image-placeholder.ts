/**
 * 제품 이미지 플레이스홀더 유틸리티
 * Unsplash API와 Tavily API를 사용하여 제품명 기반 이미지를 검색합니다.
 */

interface TavilySearchResponse {
  images?: string[];
  error?: string;
}

interface UnsplashSearchResponse {
  results?: Array<{
    urls: {
      regular: string;
      small: string;
    };
  }>;
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

    // 검색 쿼리 생성 (한국어 제품명에 맞게 개선)
    // 스포츠 카테고리의 경우 한국어 제품명을 영어로 번역하여 검색 개선
    let searchQuery: string;

    // 한국어 제품명을 영어 검색어로 변환 (주요 키워드)
    const koreanToEnglish: Record<string, string> = {
      "요가 매트": "yoga mat",
      덤벨: "dumbbell",
      운동화: "sneakers running shoes",
      나이키: "nike",
      에어맥스: "air max",
      "등산 배낭": "hiking backpack",
      "자전거 헬멧": "bicycle helmet",
      프로틴: "protein",
      "수영 고글": "swimming goggles",
      "요가 블록": "yoga block",
    };

    let englishKeywords = "";
    for (const [korean, english] of Object.entries(koreanToEnglish)) {
      if (productName.includes(korean)) {
        englishKeywords = english;
        break;
      }
    }

    if (category === "sports") {
      // 스포츠 제품은 한국어 + 영어 키워드로 검색
      if (englishKeywords) {
        searchQuery = `${englishKeywords} ${productName} sports equipment product image`;
      } else {
        searchQuery = `${productName} sports equipment product image`;
      }
    } else if (category) {
      searchQuery = `${productName} ${category} product image`;
    } else {
      searchQuery = `${productName} product image`;
    }

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
        max_results: 10, // 더 많은 이미지 후보를 가져와서 검증
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

    // 이미지 검증: 여러 이미지 중 접근 가능한 첫 번째 이미지 찾기
    // 빠른 응답을 위해 처음 3개만 빠르게 검증 시도
    const imagesToCheck = images.slice(0, 3);

    for (const imageUrl of imagesToCheck) {
      const isValid = await validateImageUrl(imageUrl);
      if (isValid) {
        console.log("✅ Tavily 이미지 검색 및 검증 성공:", {
          query: searchQuery,
          imageUrl,
          totalImages: images.length,
          timestamp: new Date().toISOString(),
        });
        return imageUrl;
      } else {
        console.warn("⚠️ 이미지 검증 실패, 다음 이미지 시도:", {
          imageUrl,
          timestamp: new Date().toISOString(),
        });
      }
    }

    // 검증된 이미지가 없어도 첫 번째 이미지를 반환 (Next.js Image가 에러 처리)
    // 많은 경우 검증은 실패하지만 실제로는 이미지가 정상적으로 로드됨
    const firstImage = images[0];
    console.log("⚠️ 이미지 검증 실패했으나 첫 번째 이미지 반환:", {
      query: searchQuery,
      imageUrl: firstImage,
      totalImages: images.length,
      note: "Next.js Image가 에러를 처리할 것입니다.",
      timestamp: new Date().toISOString(),
    });
    return firstImage;
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
 * 이미지 URL이 실제로 접근 가능한지 검증
 * @param imageUrl - 검증할 이미지 URL
 * @returns 접근 가능하면 true, 아니면 false
 */
async function validateImageUrl(imageUrl: string): Promise<boolean> {
  try {
    // 타임아웃 컨트롤러 생성 (3초 타임아웃, 더 빠른 처리)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    // HEAD 요청으로 먼저 시도
    try {
      const headResponse = await fetch(imageUrl, {
        method: "HEAD",
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // 200-299 상태 코드이고 Content-Type이 이미지인 경우 유효
      const contentType = headResponse.headers.get("content-type");
      if (headResponse.ok && contentType && contentType.startsWith("image/")) {
        return true;
      }

      // 상태 코드만 확인 (일부 서버는 Content-Type 헤더를 제대로 반환하지 않을 수 있음)
      if (
        headResponse.ok &&
        headResponse.status >= 200 &&
        headResponse.status < 300
      ) {
        // URL 확장자로 이미지 확장자 확인
        const imageExtensions = [
          ".jpg",
          ".jpeg",
          ".png",
          ".gif",
          ".webp",
          ".svg",
          ".bmp",
        ];
        const lowerUrl = imageUrl.toLowerCase();
        if (imageExtensions.some((ext) => lowerUrl.includes(ext))) {
          return true;
        }
      }
    } catch (headError) {
      // HEAD 요청 실패 시 GET으로 작은 크기만 시도
      clearTimeout(timeoutId);

      try {
        const controller2 = new AbortController();
        const timeoutId2 = setTimeout(() => controller2.abort(), 3000);

        // Range 요청으로 첫 1KB만 가져와서 검증
        const getResponse = await fetch(imageUrl, {
          method: "GET",
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            Range: "bytes=0-1024", // 첫 1KB만 요청
          },
          signal: controller2.signal,
        });

        clearTimeout(timeoutId2);

        if (getResponse.ok || getResponse.status === 206) {
          // 206 Partial Content도 정상
          const contentType = getResponse.headers.get("content-type");
          if (contentType && contentType.startsWith("image/")) {
            return true;
          }

          // URL 확장자로 확인
          const imageExtensions = [
            ".jpg",
            ".jpeg",
            ".png",
            ".gif",
            ".webp",
            ".svg",
            ".bmp",
          ];
          const lowerUrl = imageUrl.toLowerCase();
          if (imageExtensions.some((ext) => lowerUrl.includes(ext))) {
            return true;
          }
        }
      } catch (getError) {
        // GET도 실패하면 유효하지 않은 것으로 간주
      }
    }

    return false;
  } catch (error) {
    // 네트워크 에러, 타임아웃 등은 유효하지 않은 것으로 간주
    console.warn("⚠️ 이미지 검증 중 에러 발생:", {
      imageUrl,
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString(),
    });
    return false;
  }
}

/**
 * Unsplash API를 사용하여 제품 이미지 검색
 * @param productName - 제품명
 * @param category - 제품 카테고리 (선택사항)
 * @returns 이미지 URL 또는 null
 */
async function searchUnsplashImage(
  productName: string,
  category?: string
): Promise<string | null> {
  try {
    const unsplashAccessKey = process.env.UNSPLASH_ACCESS_KEY;

    // API 키가 없으면 null 반환
    if (!unsplashAccessKey) {
      console.warn(
        "⚠️ UNSPLASH_ACCESS_KEY가 설정되지 않았습니다. Unsplash 검색을 건너뜁니다."
      );
      return null;
    }

    // 검색 쿼리 생성
    const koreanToEnglish: Record<string, string> = {
      "요가 매트": "yoga mat",
      덤벨: "dumbbell",
      운동화: "sneakers",
      나이키: "nike",
      에어맥스: "air max",
      "등산 배낭": "hiking backpack",
      "자전거 헬멧": "bicycle helmet",
      프로틴: "protein powder",
      "수영 고글": "swimming goggles",
      "요가 블록": "yoga block",
    };

    let searchQuery = productName;
    for (const [korean, english] of Object.entries(koreanToEnglish)) {
      if (productName.includes(korean)) {
        searchQuery = english;
        break;
      }
    }

    if (category === "sports") {
      searchQuery = `${searchQuery} sports equipment`;
    }

    console.log("🔍 Unsplash 이미지 검색 시작:", {
      query: searchQuery,
      productName,
      category,
      timestamp: new Date().toISOString(),
    });

    // Unsplash API 호출
    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
        searchQuery
      )}&per_page=5&orientation=landscape`,
      {
        headers: {
          Authorization: `Client-ID ${unsplashAccessKey}`,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Unsplash API 호출 실패:", {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
        timestamp: new Date().toISOString(),
      });
      return null;
    }

    const data: UnsplashSearchResponse = await response.json();

    if (!data.results || data.results.length === 0) {
      console.warn("⚠️ Unsplash 이미지 검색 결과 없음:", {
        query: searchQuery,
        timestamp: new Date().toISOString(),
      });
      return null;
    }

    // 첫 번째 이미지의 regular URL 사용
    const imageUrl = data.results[0].urls.regular;

    console.log("✅ Unsplash 이미지 검색 성공:", {
      query: searchQuery,
      imageUrl,
      totalResults: data.results.length,
      timestamp: new Date().toISOString(),
    });

    return imageUrl;
  } catch (error) {
    console.error("❌ Unsplash 이미지 검색 에러:", {
      error: error instanceof Error ? error.message : String(error),
      productName,
      category,
      timestamp: new Date().toISOString(),
    });
    return null;
  }
}

/**
 * 제품 이미지 URL 가져오기 (기존 이미지가 있으면 사용, 없으면 여러 소스로 검색)
 * 검색 순서: Unsplash → Tavily
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
  // 기존 이미지가 있으면 도메인 확인
  if (existingImageUrl) {
    // 티몬(폐업), Cafe24, 크로켓 등 불안정한 도메인은 검증 없이 바로 무시
    const unreliableDomains = ["tmon.kr", "cafe24", "croket.co.kr"];
    const isUnreliableDomain = unreliableDomains.some((domain) =>
      existingImageUrl.includes(domain)
    );

    if (isUnreliableDomain) {
      // 검증 없이 바로 무시하고 새로 검색
      console.warn("⚠️ 불안정한 도메인 이미지 감지, 새로 검색:", {
        existingImageUrl,
        productName,
        timestamp: new Date().toISOString(),
      });
      existingImageUrl = null;
    } else {
      // 안정적인 도메인(Unsplash 등)은 그대로 사용
      return existingImageUrl;
    }
  }

  // 기존 이미지가 없거나 유효하지 않으면 새로 검색
  // 1순위: Unsplash 검색 (더 안정적이고 고품질)
  console.log("🔍 Unsplash 이미지 검색 시작:", {
    productName,
    category,
    timestamp: new Date().toISOString(),
  });
  
  const unsplashImage = await searchUnsplashImage(productName, category);
  if (unsplashImage) {
    console.log("✅ Unsplash 이미지 검색 성공:", {
      productName,
      imageUrl: unsplashImage,
      timestamp: new Date().toISOString(),
    });
    return unsplashImage;
  }

  // 2순위: Tavily 검색 (폴백)
  console.log("⚠️ Unsplash 검색 실패, Tavily 검색 시도:", {
    productName,
    category,
    timestamp: new Date().toISOString(),
  });
  
  const tavilyImage = await searchProductImage(productName, category);
  if (tavilyImage) {
    return tavilyImage;
  }

  // 모두 실패
  console.warn("❌ 모든 이미지 검색 실패:", {
    productName,
    category,
    timestamp: new Date().toISOString(),
  });
  return null;
}

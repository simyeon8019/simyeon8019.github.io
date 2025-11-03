"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Loader2,
  Search,
  ChevronLeft,
  ChevronRight,
  Grid3x3,
} from "lucide-react";

interface Product {
  id: string;
  name: string;
  price: number;
  image_url: string | null;
  category: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface ProductsResponse {
  success: boolean;
  products: Product[];
  pagination: Pagination;
}

/**
 * 상품 목록 페이지 (내부 컴포넌트)
 * useSearchParams를 사용하므로 Suspense로 감싸야 함
 */
function ProductsPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 16,
    total: 0,
    totalPages: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 쿼리 파라미터에서 값 가져오기
  const currentCategory = searchParams.get("category") || "";
  const currentSearch = searchParams.get("search") || "";
  const currentPage = parseInt(searchParams.get("page") || "1", 10);

  // 상품 목록 조회
  const fetchProducts = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (currentCategory) params.append("category", currentCategory);
      if (currentSearch) params.append("search", currentSearch);
      params.append("page", currentPage.toString());
      params.append("limit", "16");

      const response = await fetch(`/api/products?${params.toString()}`);

      if (!response.ok) {
        throw new Error("상품 목록을 불러오는데 실패했습니다.");
      }

      const data: ProductsResponse = await response.json();

      if (data.success) {
        setProducts(data.products);
        setPagination(data.pagination);
        console.log("✅ 상품 목록 조회 성공:", {
          count: data.products.length,
          page: data.pagination.page,
          timestamp: new Date().toISOString(),
        });
      } else {
        throw new Error("상품 목록 조회에 실패했습니다.");
      }
    } catch (err) {
      console.error("❌ 상품 목록 조회 실패:", err);
      setError(
        err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다."
      );
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [currentCategory, currentSearch, currentPage]);

  // 검색 처리
  const handleSearch = (searchValue: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (searchValue) {
      params.set("search", searchValue);
    } else {
      params.delete("search");
    }
    params.set("page", "1"); // 검색 시 첫 페이지로
    router.push(`/products?${params.toString()}`);
  };

  // 카테고리 필터 처리
  const handleCategoryChange = (category: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (category && category !== "all") {
      params.set("category", category);
    } else {
      params.delete("category");
    }
    params.set("page", "1"); // 카테고리 변경 시 첫 페이지로
    router.push(`/products?${params.toString()}`);
  };

  // 페이지 변경
  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.push(`/products?${params.toString()}`);
  };

  const categories = [
    { value: "all", label: "전체" },
    { value: "electronics", label: "전자제품" },
    { value: "clothing", label: "의류" },
    { value: "books", label: "도서" },
    { value: "food", label: "식품" },
    { value: "sports", label: "스포츠" },
    { value: "beauty", label: "뷰티" },
    { value: "home", label: "생활/가정" },
  ];

  return (
    <main className="min-h-[calc(100vh-80px)] bg-gray-50 py-4 sm:py-6 lg:py-8 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* 헤더 */}
        <div className="mb-6 sm:mb-8">
          <div className="mb-4 sm:mb-6 flex items-center gap-2">
            <Grid3x3 className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600 dark:text-gray-400" />
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
              상품 목록
            </h1>
            {!isLoading && pagination.total > 0 && (
              <span className="text-sm sm:text-base text-gray-500 dark:text-gray-400">
                ({pagination.total}개)
              </span>
            )}
          </div>

          {/* 필터 및 검색 */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {/* 카테고리 필터 */}
            <Select
              value={currentCategory || "all"}
              onValueChange={handleCategoryChange}
            >
              <SelectTrigger className="w-full sm:w-[180px] lg:w-[200px]">
                <SelectValue placeholder="카테고리 선택" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* 검색 */}
            <div className="relative flex-1 sm:max-w-xs lg:max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="상품명으로 검색..."
                defaultValue={currentSearch}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSearch(e.currentTarget.value);
                  }
                }}
                className="pl-10"
              />
            </div>
          </div>
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div className="mb-6 sm:mb-8 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
            <p className="text-sm sm:text-base text-red-600 dark:text-red-400">
              {error}
            </p>
          </div>
        )}

        {/* 로딩 상태 */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 sm:py-20">
            <Loader2 className="h-8 w-8 sm:h-10 sm:w-10 animate-spin text-gray-400" />
            <p className="mt-4 text-sm sm:text-base text-gray-600 dark:text-gray-400">
              상품을 불러오는 중...
            </p>
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 sm:py-20">
            <div className="mb-4 rounded-full bg-gray-100 p-4 dark:bg-gray-800">
              <Grid3x3 className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-base sm:text-lg font-medium text-gray-600 dark:text-gray-400">
              상품이 없습니다.
            </p>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-500">
              {currentSearch || currentCategory
                ? "다른 검색어나 카테고리를 시도해보세요."
                : "새로운 상품을 준비 중입니다."}
            </p>
          </div>
        ) : (
          <>
            {/* 상품 그리드 */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  name={product.name}
                  price={product.price}
                  imageUrl={product.image_url}
                  category={product.category}
                />
              ))}
            </div>

            {/* 페이지네이션 */}
            {pagination.totalPages > 1 && (
              <div className="mt-6 sm:mt-8 flex flex-col items-center gap-4">
                <div className="flex items-center justify-center gap-1 sm:gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="h-8 w-8 sm:h-9 sm:w-9"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>

                  <div className="flex items-center gap-1">
                    {Array.from(
                      { length: pagination.totalPages },
                      (_, i) => i + 1
                    )
                      .filter((page) => {
                        // 현재 페이지 주변 2페이지씩만 표시
                        return (
                          page === 1 ||
                          page === pagination.totalPages ||
                          (page >= pagination.page - 2 &&
                            page <= pagination.page + 2)
                        );
                      })
                      .map((page, index, array) => {
                        // 생략 표시
                        if (index > 0 && page - array[index - 1] > 1) {
                          return (
                            <div
                              key={`ellipsis-${page}`}
                              className="px-1 sm:px-2 text-sm text-gray-500"
                            >
                              ...
                            </div>
                          );
                        }

                        return (
                          <Button
                            key={page}
                            variant={
                              pagination.page === page ? "default" : "outline"
                            }
                            size="sm"
                            onClick={() => handlePageChange(page)}
                            className="h-8 w-8 sm:h-9 sm:w-9 text-xs sm:text-sm"
                          >
                            {page}
                          </Button>
                        );
                      })}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.totalPages}
                    className="h-8 w-8 sm:h-9 sm:w-9"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>

                {/* 전체 개수 정보 */}
                <div className="text-center text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  전체 {pagination.total}개 중{" "}
                  {(pagination.page - 1) * pagination.limit + 1}-
                  {Math.min(
                    pagination.page * pagination.limit,
                    pagination.total
                  )}
                  개 표시 중
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}

/**
 * 상품 목록 페이지
 * Suspense 경계로 감싸서 useSearchParams 사용
 */
export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-[calc(100vh-80px)] bg-gray-50 py-4 sm:py-6 lg:py-8 dark:bg-gray-900">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center justify-center py-12 sm:py-20">
              <Loader2 className="h-8 w-8 sm:h-10 sm:w-10 animate-spin text-gray-400" />
              <p className="mt-4 text-sm sm:text-base text-gray-600 dark:text-gray-400">
                상품 목록을 불러오는 중...
              </p>
            </div>
          </div>
        </main>
      }
    >
      <ProductsPageContent />
    </Suspense>
  );
}

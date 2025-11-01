"use client";

import { useEffect, useState } from "react";
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
import { Loader2, Search, ChevronLeft, ChevronRight } from "lucide-react";

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
 * 상품 목록 페이지
 * 카테고리 필터링, 검색, 페이지네이션 기능을 제공합니다.
 */
export default function ProductsPage() {
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
    { value: "tops", label: "상의" },
    { value: "bottoms", label: "하의" },
    { value: "outerwear", label: "아우터" },
    { value: "dresses", label: "드레스" },
    { value: "shoes", label: "신발" },
    { value: "accessories", label: "액세서리" },
  ];

  return (
    <main className="min-h-[calc(100vh-80px)] bg-gray-50 py-8 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="mb-4 text-3xl font-bold text-gray-900 dark:text-gray-100">
            상품 목록
          </h1>

          {/* 필터 및 검색 */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {/* 카테고리 필터 */}
            <Select
              value={currentCategory || "all"}
              onValueChange={handleCategoryChange}
            >
              <SelectTrigger className="w-full sm:w-[200px]">
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
            <div className="relative flex-1 sm:max-w-md">
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
          <div className="mb-8 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* 로딩 상태 */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <p className="text-lg text-gray-600 dark:text-gray-400">
              상품이 없습니다.
            </p>
          </div>
        ) : (
          <>
            {/* 상품 그리드 */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
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
              <div className="mt-8 flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
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
                          <div key={`ellipsis-${page}`} className="px-2">
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
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}

            {/* 전체 개수 정보 */}
            <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
              전체 {pagination.total}개의 상품
            </div>
          </>
        )}
      </div>
    </main>
  );
}

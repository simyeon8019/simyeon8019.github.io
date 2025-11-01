import Link from "next/link";
import { Button } from "@/components/ui/button";
import ProductCard from "./ProductCard";
import { ChevronRight } from "lucide-react";

interface Product {
  id: string;
  name: string;
  price: number;
  image_url: string | null;
  category: string;
}

interface ProductSectionProps {
  title: string;
  products: Product[];
  viewAllHref?: string;
  isLoading?: boolean;
  error?: string | null;
}

/**
 * 상품 섹션 컴포넌트
 * 제목, 상품 그리드, 더보기 버튼을 포함하는 재사용 가능한 섹션
 */
export default function ProductSection({
  title,
  products,
  viewAllHref,
  isLoading = false,
  error = null,
}: ProductSectionProps) {
  if (error) {
    return (
      <section className="w-full py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-8 text-2xl font-bold text-gray-900 dark:text-gray-100">
            {title}
          </h2>
          <div className="flex items-center justify-center rounded-lg border border-red-200 bg-red-50 p-8 dark:border-red-800 dark:bg-red-900/20">
            <p className="text-red-600 dark:text-red-400">
              {error || "데이터를 불러오는 중 오류가 발생했습니다."}
            </p>
          </div>
        </div>
      </section>
    );
  }

  if (isLoading) {
    return (
      <section className="w-full py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-8 text-2xl font-bold text-gray-900 dark:text-gray-100">
            {title}
          </h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse space-y-3">
                <div className="aspect-square w-full rounded-lg bg-gray-200 dark:bg-gray-700" />
                <div className="h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-700" />
                <div className="h-4 w-1/2 rounded bg-gray-200 dark:bg-gray-700" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!products || products.length === 0) {
    return (
      <section className="w-full py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-8 text-2xl font-bold text-gray-900 dark:text-gray-100">
            {title}
          </h2>
          <div className="flex items-center justify-center rounded-lg border border-gray-200 bg-gray-50 p-8 dark:border-gray-700 dark:bg-gray-800">
            <p className="text-gray-600 dark:text-gray-400">상품이 없습니다.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {title}
          </h2>
          {viewAllHref && (
            <Link href={viewAllHref}>
              <Button variant="ghost" className="gap-2">
                더보기
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          )}
        </div>
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
      </div>
    </section>
  );
}

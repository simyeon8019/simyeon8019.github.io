import Link from "next/link";
import {
  Shirt,
  Square,
  Layers,
  Circle,
  Footprints,
  Sparkles,
} from "lucide-react";

interface Category {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
}

const categories: Category[] = [
  {
    id: "tops",
    label: "상의",
    icon: Shirt,
    href: "/products?category=tops",
  },
  {
    id: "bottoms",
    label: "하의",
    icon: Square,
    href: "/products?category=bottoms",
  },
  {
    id: "outerwear",
    label: "아우터",
    icon: Layers,
    href: "/products?category=outerwear",
  },
  {
    id: "dresses",
    label: "드레스",
    icon: Circle,
    href: "/products?category=dresses",
  },
  {
    id: "shoes",
    label: "신발",
    icon: Footprints,
    href: "/products?category=shoes",
  },
  {
    id: "accessories",
    label: "액세서리",
    icon: Sparkles,
    href: "/products?category=accessories",
  },
];

/**
 * 카테고리 네비게이션 컴포넌트
 * 6개 주요 카테고리를 그리드로 표시하고 클릭 시 해당 카테고리 상품 목록으로 이동
 */
export default function CategoryNavigation() {
  return (
    <section className="w-full py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="mb-8 text-2xl font-bold text-gray-900 dark:text-gray-100">
          카테고리
        </h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <Link
                key={category.id}
                href={category.href}
                className="group flex flex-col items-center gap-3 rounded-lg border border-gray-200 bg-white p-6 transition-all hover:border-blue-500 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 hover:dark:border-blue-400"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 transition-colors group-hover:bg-blue-100 dark:bg-gray-700 group-hover:dark:bg-blue-900">
                  <Icon className="h-8 w-8 text-gray-600 transition-colors group-hover:text-blue-600 dark:text-gray-400 group-hover:dark:text-blue-400" />
                </div>
                <span className="text-sm font-medium text-gray-900 group-hover:text-blue-600 dark:text-gray-100 group-hover:dark:text-blue-400">
                  {category.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

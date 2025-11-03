import Link from "next/link";
import {
  Smartphone,
  Shirt,
  BookOpen,
  UtensilsCrossed,
  Dumbbell,
  Sparkles,
  Home,
} from "lucide-react";

interface Category {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
}

const categories: Category[] = [
  {
    id: "electronics",
    label: "전자제품",
    icon: Smartphone,
    href: "/products?category=electronics",
  },
  {
    id: "clothing",
    label: "의류",
    icon: Shirt,
    href: "/products?category=clothing",
  },
  {
    id: "books",
    label: "도서",
    icon: BookOpen,
    href: "/products?category=books",
  },
  {
    id: "food",
    label: "식품",
    icon: UtensilsCrossed,
    href: "/products?category=food",
  },
  {
    id: "sports",
    label: "스포츠",
    icon: Dumbbell,
    href: "/products?category=sports",
  },
  {
    id: "beauty",
    label: "뷰티",
    icon: Sparkles,
    href: "/products?category=beauty",
  },
  {
    id: "home",
    label: "생활/가정",
    icon: Home,
    href: "/products?category=home",
  },
];

/**
 * 카테고리 네비게이션 컴포넌트
 * 7개 주요 카테고리를 그리드로 표시하고 클릭 시 해당 카테고리 상품 목록으로 이동
 */
export default function CategoryNavigation() {
  return (
    <section className="w-full py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="mb-8 text-2xl font-bold text-gray-900 dark:text-gray-100">
          카테고리
        </h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
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

import Image from "next/image";
import Link from "next/link";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  imageUrl: string | null;
  category?: string;
}

/**
 * 상품 카드 컴포넌트
 * 이미지, 이름, 가격을 표시하는 재사용 가능한 카드 컴포넌트
 */
export default function ProductCard({
  id,
  name,
  price,
  imageUrl,
  category,
}: ProductCardProps) {
  const formattedPrice = new Intl.NumberFormat("ko-KR").format(price);

  return (
    <Link href={`/products/${id}`} className="group">
      <div className="flex flex-col gap-3">
        {/* 상품 이미지 */}
        <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-gray-400">
              <svg
                className="h-12 w-12"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          )}
        </div>

        {/* 상품 정보 */}
        <div className="flex flex-col gap-1">
          {category && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {getCategoryLabel(category)}
            </span>
          )}
          <h3 className="line-clamp-2 font-medium text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400">
            {name}
          </h3>
          <p className="font-semibold text-gray-900 dark:text-gray-100">
            {formattedPrice}원
          </p>
        </div>
      </div>
    </Link>
  );
}

/**
 * 카테고리 영어 이름을 한국어로 변환
 */
function getCategoryLabel(category: string): string {
  const categoryMap: Record<string, string> = {
    tops: "상의",
    bottoms: "하의",
    outerwear: "아우터",
    dresses: "드레스",
    shoes: "신발",
    accessories: "액세서리",
  };

  return categoryMap[category] || category;
}

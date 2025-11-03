"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, ShoppingCart, Plus, Minus, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  category: string;
  stock_quantity: number;
}

interface ProductResponse {
  success: boolean;
  product: Product;
}

/**
 * 상품 상세 페이지
 * 상품 이미지, 정보, 수량 선택, 장바구니 추가 기능을 제공합니다.
 */
export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  // 상품 정보 조회
  const fetchProduct = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/products/${productId}`);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("상품을 찾을 수 없습니다.");
        }
        throw new Error("상품 정보를 불러오는데 실패했습니다.");
      }

      const data: ProductResponse = await response.json();

      if (data.success && data.product) {
        setProduct(data.product);
        console.log("✅ 상품 조회 성공:", {
          productId: data.product.id,
          productName: data.product.name,
          timestamp: new Date().toISOString(),
        });
      } else {
        throw new Error("상품 정보를 불러오는데 실패했습니다.");
      }
    } catch (err) {
      console.error("❌ 상품 조회 실패:", err);
      setError(
        err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다."
      );
      setProduct(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  // 수량 증가
  const handleIncreaseQuantity = () => {
    if (product && quantity < 99 && quantity < product.stock_quantity) {
      setQuantity(quantity + 1);
    }
  };

  // 수량 감소
  const handleDecreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  // 장바구니 추가
  const handleAddToCart = async () => {
    setIsAddingToCart(true);

    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          product_id: productId,
          quantity: quantity,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 401) {
          router.push("/sign-in");
          return;
        }
        throw new Error(
          errorData.error || "장바구니에 추가하는데 실패했습니다."
        );
      }

      const data = await response.json();

      console.log("✅ 장바구니 추가 성공:", {
        productId,
        quantity,
        cartItemId: data.cartItem?.id,
        timestamp: new Date().toISOString(),
      });

      if (confirm("장바구니에 추가되었습니다. 장바구니로 이동하시겠습니까?")) {
        router.push("/cart");
      }
    } catch (err) {
      console.error("❌ 장바구니 추가 실패:", err);
      alert(
        err instanceof Error
          ? err.message
          : "장바구니에 추가하는데 실패했습니다."
      );
    } finally {
      setIsAddingToCart(false);
    }
  };

  // 바로 구매 (장바구니 추가 후 주문 페이지로 이동)
  const handleBuyNow = async () => {
    if (!selectedSize) {
      alert("사이즈를 선택해주세요.");
      return;
    }

    // TODO: 장바구니 API 구현 후 연결
    alert("바로 구매 기능은 준비 중입니다.");
  };

  // 카테고리 라벨 변환
  const getCategoryLabel = (category: string): string => {
    const categoryMap: Record<string, string> = {
      electronics: "전자제품",
      clothing: "의류",
      books: "도서",
      food: "식품",
      sports: "스포츠",
      beauty: "뷰티",
      home: "생활/가정",
    };
    return categoryMap[category] || category;
  };

  // 로딩 상태
  if (isLoading) {
    return (
      <main className="min-h-[calc(100vh-80px)] bg-gray-50 py-8 dark:bg-gray-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        </div>
      </main>
    );
  }

  // 에러 상태
  if (error || !product) {
    return (
      <main className="min-h-[calc(100vh-80px)] bg-gray-50 py-8 dark:bg-gray-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Link href="/products">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              상품 목록으로
            </Button>
          </Link>
          <div className="flex flex-col items-center justify-center py-20">
            <p className="text-lg text-red-600 dark:text-red-400">
              {error || "상품을 찾을 수 없습니다."}
            </p>
            <Link href="/products" className="mt-4">
              <Button>상품 목록으로 돌아가기</Button>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const formattedPrice = new Intl.NumberFormat("ko-KR").format(product.price);

  return (
    <main className="min-h-[calc(100vh-80px)] bg-gray-50 py-8 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* 뒤로 가기 버튼 */}
        <Link href="/products">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            상품 목록으로
          </Button>
        </Link>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* 상품 이미지 */}
          <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
            {product.image_url ? (
              <Image
                src={product.image_url}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
            ) : (
              <div className="flex h-full items-center justify-center text-gray-400">
                <svg
                  className="h-24 w-24"
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
          <div className="flex flex-col gap-6">
            {/* 카테고리 및 이름 */}
            <div>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {getCategoryLabel(product.category)}
              </span>
              <h1 className="mt-2 text-3xl font-bold text-gray-900 dark:text-gray-100">
                {product.name}
              </h1>
            </div>

            {/* 가격 */}
            <div>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                {formattedPrice}원
              </p>
            </div>

            {/* 설명 */}
            {product.description && (
              <div>
                <p className="text-gray-600 dark:text-gray-400">
                  {product.description}
                </p>
              </div>
            )}

            {/* 재고 정보 */}
            {product.stock_quantity > 0 && (
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  재고: {product.stock_quantity}개
                </p>
              </div>
            )}

            {/* 수량 선택 */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-gray-100">
                수량
              </label>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 rounded-lg border border-gray-300 dark:border-gray-600">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleDecreaseQuantity}
                    disabled={quantity <= 1}
                    className="h-10 w-10"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-12 text-center font-medium text-gray-900 dark:text-gray-100">
                    {quantity}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleIncreaseQuantity}
                    disabled={
                      quantity >= 99 ||
                      (product.stock_quantity > 0 &&
                        quantity >= product.stock_quantity)
                    }
                    className="h-10 w-10"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {product.stock_quantity > 0 && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    최대 {Math.min(99, product.stock_quantity)}개
                  </p>
                )}
              </div>
            </div>

            {/* 장바구니 추가 및 바로 구매 버튼 */}
            <div className="flex flex-col gap-3">
              <Button
                onClick={handleAddToCart}
                disabled={isAddingToCart}
                className="w-full"
                size="lg"
              >
                {isAddingToCart ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    추가 중...
                  </>
                ) : (
                  <>
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    장바구니에 추가
                  </>
                )}
              </Button>
              <Button
                onClick={handleBuyNow}
                variant="outline"
                className="w-full"
                size="lg"
              >
                바로 구매
              </Button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

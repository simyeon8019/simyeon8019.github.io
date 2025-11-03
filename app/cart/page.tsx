"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  ArrowLeft,
} from "lucide-react";

interface Product {
  id: string;
  name: string;
  price: number;
  image_url: string | null;
  category: string;
}

interface CartItem {
  id: string;
  product_id: string;
  quantity: number;
  created_at: string;
  updated_at: string;
  products: Product;
}

interface CartResponse {
  success: boolean;
  cartItems: CartItem[];
}

/**
 * 장바구니 페이지
 * 장바구니 아이템 목록, 수량 변경, 삭제, 총 금액 계산 기능을 제공합니다.
 */
export default function CartPage() {
  const router = useRouter();

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  // 장바구니 조회
  const fetchCart = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/cart");

      if (!response.ok) {
        if (response.status === 401) {
          router.push("/sign-in");
          return;
        }
        throw new Error("장바구니를 불러오는데 실패했습니다.");
      }

      const data: CartResponse = await response.json();

      if (data.success) {
        setCartItems(data.cartItems);
        // 모든 아이템을 기본으로 선택
        setSelectedItems(new Set(data.cartItems.map((item) => item.id)));
        console.log("✅ 장바구니 조회 성공:", {
          itemCount: data.cartItems.length,
          timestamp: new Date().toISOString(),
        });
      } else {
        throw new Error("장바구니 조회에 실패했습니다.");
      }
    } catch (err) {
      console.error("❌ 장바구니 조회 실패:", err);
      setError(
        err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다."
      );
      setCartItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  // 수량 변경
  const handleQuantityChange = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1 || newQuantity > 99) {
      return;
    }

    setIsUpdating(itemId);

    try {
      const response = await fetch(`/api/cart/${itemId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ quantity: newQuantity }),
      });

      if (!response.ok) {
        throw new Error("수량 변경에 실패했습니다.");
      }

      // 장바구니 다시 조회
      await fetchCart();
      console.log("✅ 수량 변경 성공:", {
        itemId,
        newQuantity,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      console.error("❌ 수량 변경 실패:", err);
      alert(err instanceof Error ? err.message : "수량 변경에 실패했습니다.");
    } finally {
      setIsUpdating(null);
    }
  };

  // 아이템 삭제
  const handleDeleteItem = async (itemId: string) => {
    if (!confirm("장바구니에서 이 상품을 삭제하시겠습니까?")) {
      return;
    }

    setIsUpdating(itemId);

    try {
      const response = await fetch(`/api/cart/${itemId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("상품 삭제에 실패했습니다.");
      }

      // 장바구니 다시 조회
      await fetchCart();
      // 선택된 아이템에서 제거
      setSelectedItems((prev) => {
        const next = new Set(prev);
        next.delete(itemId);
        return next;
      });
      console.log("✅ 상품 삭제 성공:", {
        itemId,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      console.error("❌ 상품 삭제 실패:", err);
      alert(err instanceof Error ? err.message : "상품 삭제에 실패했습니다.");
    } finally {
      setIsUpdating(null);
    }
  };

  // 전체 선택/해제
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(new Set(cartItems.map((item) => item.id)));
    } else {
      setSelectedItems(new Set());
    }
  };

  // 개별 아이템 선택/해제
  const handleToggleItem = (itemId: string) => {
    setSelectedItems((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
  };

  // 선택된 아이템 총 금액 계산
  const calculateTotal = () => {
    return cartItems
      .filter((item) => selectedItems.has(item.id))
      .reduce((total, item) => {
        return total + item.products.price * item.quantity;
      }, 0);
  };

  // 선택된 아이템 개수
  const selectedCount = selectedItems.size;

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
  if (error) {
    return (
      <main className="min-h-[calc(100vh-80px)] bg-gray-50 py-8 dark:bg-gray-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Link href="/products">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              쇼핑 계속하기
            </Button>
          </Link>
          <div className="flex flex-col items-center justify-center py-20">
            <p className="text-lg text-red-600 dark:text-red-400">{error}</p>
            <Button onClick={fetchCart} className="mt-4">
              다시 시도
            </Button>
          </div>
        </div>
      </main>
    );
  }

  // 빈 장바구니
  if (cartItems.length === 0) {
    return (
      <main className="min-h-[calc(100vh-80px)] bg-gray-50 py-8 dark:bg-gray-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="mb-8 text-3xl font-bold text-gray-900 dark:text-gray-100">
            장바구니
          </h1>
          <div className="flex flex-col items-center justify-center py-20">
            <ShoppingCart className="mb-4 h-24 w-24 text-gray-400" />
            <p className="mb-4 text-lg text-gray-600 dark:text-gray-400">
              장바구니가 비어있습니다.
            </p>
            <Link href="/products">
              <Button>쇼핑하러 가기</Button>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const total = calculateTotal();
  const formattedTotal = new Intl.NumberFormat("ko-KR").format(total);
  const isAllSelected =
    selectedItems.size === cartItems.length && cartItems.length > 0;

  return (
    <main className="min-h-[calc(100vh-80px)] bg-gray-50 py-8 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h1 className="mb-8 text-3xl font-bold text-gray-900 dark:text-gray-100">
          장바구니
        </h1>

        {/* 전체 선택 */}
        <div className="mb-4 flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={isAllSelected}
              onChange={(e) => handleSelectAll(e.target.checked)}
              className="h-4 w-4 cursor-pointer rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
              전체 선택 ({selectedCount}/{cartItems.length})
            </span>
          </label>
        </div>

        {/* 장바구니 아이템 목록 */}
        <div className="mb-8 space-y-4">
          {cartItems.map((item) => {
            const isSelected = selectedItems.has(item.id);
            const itemTotal = item.products.price * item.quantity;
            const formattedItemTotal = new Intl.NumberFormat("ko-KR").format(
              itemTotal
            );
            const formattedPrice = new Intl.NumberFormat("ko-KR").format(
              item.products.price
            );
            const isItemUpdating = isUpdating === item.id;

            return (
              <div
                key={item.id}
                className={`rounded-lg border bg-white p-4 dark:border-gray-700 dark:bg-gray-800 ${
                  isSelected
                    ? "border-blue-500 dark:border-blue-400"
                    : "border-gray-200 dark:border-gray-700"
                }`}
              >
                <div className="flex gap-4">
                  {/* 체크박스 */}
                  <div className="flex items-start pt-2">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleToggleItem(item.id)}
                      className="h-4 w-4 cursor-pointer rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </div>

                  {/* 상품 이미지 */}
                  <Link
                    href={`/products/${item.product_id}`}
                    className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-700"
                  >
                    {item.products.image_url ? (
                      <Image
                        src={item.products.image_url}
                        alt={item.products.name}
                        fill
                        className="object-cover"
                        sizes="96px"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-gray-400">
                        <svg
                          className="h-8 w-8"
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
                  </Link>

                  {/* 상품 정보 */}
                  <div className="flex flex-1 flex-col gap-2">
                    <div>
                      <Link
                        href={`/products/${item.product_id}`}
                        className="text-lg font-medium text-gray-900 hover:text-blue-600 dark:text-gray-100 dark:hover:text-blue-400"
                      >
                        {item.products.name}
                      </Link>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {getCategoryLabel(item.products.category)}
                      </p>
                    </div>

                    <div className="flex items-center justify-between">
                      {/* 수량 조절 */}
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() =>
                            handleQuantityChange(item.id, item.quantity - 1)
                          }
                          disabled={isItemUpdating || item.quantity <= 1}
                          className="h-8 w-8"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-12 text-center font-medium text-gray-900 dark:text-gray-100">
                          {isItemUpdating ? (
                            <Loader2 className="mx-auto h-4 w-4 animate-spin" />
                          ) : (
                            item.quantity
                          )}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() =>
                            handleQuantityChange(item.id, item.quantity + 1)
                          }
                          disabled={isItemUpdating || item.quantity >= 99}
                          className="h-8 w-8"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* 가격 및 삭제 */}
                      <div className="flex items-center gap-4">
                        <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                          {formattedItemTotal}원
                        </p>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteItem(item.id)}
                          disabled={isItemUpdating}
                          className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* 결제 섹션 */}
        <div className="sticky bottom-0 rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-lg font-medium text-gray-900 dark:text-gray-100">
              선택된 상품 ({selectedCount}개)
            </span>
            <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {formattedTotal}원
            </span>
          </div>
          <Button
            onClick={() => {
              if (selectedCount === 0) {
                alert("주문할 상품을 선택해주세요.");
                return;
              }
              // TODO: 주문 페이지로 이동
              alert("주문 페이지는 준비 중입니다.");
            }}
            disabled={selectedCount === 0}
            className="w-full"
            size="lg"
          >
            주문하기
          </Button>
        </div>
      </div>
    </main>
  );
}

import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { getServiceRoleClient } from "@/lib/supabase/service-role";

/**
 * 장바구니 조회 API
 * GET /api/cart
 * Clerk 사용자 ID로 장바구니 아이템 조회 (상품 정보 JOIN)
 */
export async function GET() {
  try {
    // Clerk 인증 확인
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "인증이 필요합니다." },
        { status: 401 }
      );
    }

    const supabase = getServiceRoleClient();

    // 장바구니 아이템 조회 (상품 정보 JOIN)
    const { data: cartItems, error } = await supabase
      .from("cart_items")
      .select(
        `
        id,
        product_id,
        size,
        quantity,
        created_at,
        updated_at,
        products (
          id,
          name,
          price,
          image_url,
          category
        )
      `
      )
      .eq("clerk_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("❌ 장바구니 조회 실패:", error);
      return NextResponse.json(
        { error: "장바구니 조회에 실패했습니다.", details: error.message },
        { status: 500 }
      );
    }

    console.log("✅ 장바구니 조회 성공:", {
      userId,
      itemCount: cartItems?.length || 0,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      cartItems: cartItems || [],
    });
  } catch (error) {
    console.error("❌ 장바구니 조회 에러:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

/**
 * 장바구니에 상품 추가 API
 * POST /api/cart
 * 중복 상품 (같은 상품, 같은 사이즈)은 수량 업데이트
 */
export async function POST(request: NextRequest) {
  try {
    // Clerk 인증 확인
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "인증이 필요합니다." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { product_id, size, quantity } = body;

    // 입력 검증
    if (!product_id || !size || !quantity) {
      return NextResponse.json(
        { error: "상품 ID, 사이즈, 수량이 필요합니다." },
        { status: 400 }
      );
    }

    // 수량 검증 (1-99)
    if (quantity < 1 || quantity > 99) {
      return NextResponse.json(
        { error: "수량은 1개 이상 99개 이하여야 합니다." },
        { status: 400 }
      );
    }

    const supabase = getServiceRoleClient();

    // 상품 존재 확인
    const { data: product, error: productError } = await supabase
      .from("products")
      .select("id, name, is_active")
      .eq("id", product_id)
      .single();

    if (productError || !product || !product.is_active) {
      console.error("❌ 상품 조회 실패:", {
        productId: product_id,
        error: productError?.message,
      });
      return NextResponse.json(
        { error: "상품을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // 기존 장바구니 아이템 확인
    const { data: existingItems, error: checkError } = await supabase
      .from("cart_items")
      .select("*")
      .eq("clerk_id", userId)
      .eq("product_id", product_id)
      .eq("size", size);

    if (checkError) {
      console.error("❌ 장바구니 아이템 확인 실패:", checkError);
      return NextResponse.json(
        {
          error: "장바구니 확인에 실패했습니다.",
          details: checkError.message,
        },
        { status: 500 }
      );
    }

    const existingItem =
      existingItems && existingItems.length > 0 ? existingItems[0] : null;

    let result;
    if (existingItem) {
      // 기존 아이템이 있으면 수량 업데이트
      const newQuantity = Math.min(99, existingItem.quantity + quantity);

      const { data, error: updateError } = await supabase
        .from("cart_items")
        .update({
          quantity: newQuantity,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingItem.id)
        .select()
        .single();

      if (updateError) {
        console.error("❌ 장바구니 수량 업데이트 실패:", updateError);
        return NextResponse.json(
          { error: "장바구니 수량 업데이트에 실패했습니다." },
          { status: 500 }
        );
      }

      result = data;
      console.log("✅ 장바구니 수량 업데이트 성공:", {
        userId,
        cartItemId: data.id,
        newQuantity,
        timestamp: new Date().toISOString(),
      });
    } else {
      // 새 아이템 추가
      const { data, error: insertError } = await supabase
        .from("cart_items")
        .insert({
          clerk_id: userId,
          product_id,
          size,
          quantity,
        })
        .select()
        .single();

      if (insertError) {
        console.error("❌ 장바구니 추가 실패:", {
          error: insertError,
          userId,
          productId: product_id,
          size,
          quantity,
          timestamp: new Date().toISOString(),
        });
        return NextResponse.json(
          {
            error: "장바구니에 추가하는데 실패했습니다.",
            details: insertError.message,
            code: insertError.code,
          },
          { status: 500 }
        );
      }

      result = data;
      console.log("✅ 장바구니 추가 성공:", {
        userId,
        cartItemId: data.id,
        productId: product_id,
        size,
        quantity,
        timestamp: new Date().toISOString(),
      });
    }

    return NextResponse.json({
      success: true,
      cartItem: result,
    });
  } catch (error) {
    console.error("❌ 장바구니 추가 에러:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

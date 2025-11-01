import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { getServiceRoleClient } from "@/lib/supabase/service-role";

/**
 * 장바구니 아이템 수량 변경 API
 * PUT /api/cart/[id]
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Clerk 인증 확인
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "인증이 필요합니다." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { quantity } = body;

    // 입력 검증
    if (!quantity || quantity < 1 || quantity > 99) {
      return NextResponse.json(
        { error: "수량은 1개 이상 99개 이하여야 합니다." },
        { status: 400 }
      );
    }

    const supabase = getServiceRoleClient();

    // 장바구니 아이템 존재 및 권한 확인
    const { data: cartItem, error: fetchError } = await supabase
      .from("cart_items")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !cartItem) {
      return NextResponse.json(
        { error: "장바구니 아이템을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // 권한 확인 (본인의 장바구니인지 확인)
    if (cartItem.clerk_id !== userId) {
      return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
    }

    // 수량 업데이트
    const { data, error: updateError } = await supabase
      .from("cart_items")
      .update({
        quantity,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      console.error("❌ 장바구니 수량 변경 실패:", updateError);
      return NextResponse.json(
        { error: "장바구니 수량 변경에 실패했습니다." },
        { status: 500 }
      );
    }

    console.log("✅ 장바구니 수량 변경 성공:", {
      userId,
      cartItemId: id,
      newQuantity: quantity,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      cartItem: data,
    });
  } catch (error) {
    console.error("❌ 장바구니 수량 변경 에러:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

/**
 * 장바구니 아이템 삭제 API
 * DELETE /api/cart/[id]
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Clerk 인증 확인
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "인증이 필요합니다." },
        { status: 401 }
      );
    }

    const supabase = getServiceRoleClient();

    // 장바구니 아이템 존재 및 권한 확인
    const { data: cartItem, error: fetchError } = await supabase
      .from("cart_items")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !cartItem) {
      return NextResponse.json(
        { error: "장바구니 아이템을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // 권한 확인 (본인의 장바구니인지 확인)
    if (cartItem.clerk_id !== userId) {
      return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
    }

    // 삭제
    const { error: deleteError } = await supabase
      .from("cart_items")
      .delete()
      .eq("id", id);

    if (deleteError) {
      console.error("❌ 장바구니 삭제 실패:", deleteError);
      return NextResponse.json(
        { error: "장바구니 아이템 삭제에 실패했습니다." },
        { status: 500 }
      );
    }

    console.log("✅ 장바구니 삭제 성공:", {
      userId,
      cartItemId: id,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("❌ 장바구니 삭제 에러:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

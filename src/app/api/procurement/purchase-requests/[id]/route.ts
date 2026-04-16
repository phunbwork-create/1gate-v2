import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  getPurchaseRequestById,
  submitPurchaseRequest,
  receivePurchaseRequest,
  completePurchaseRequest,
} from "@/lib/procurement";
import type { SessionUser } from "@/types";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const request = await getPurchaseRequestById(id);
  if (!request) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(request);
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = session.user as SessionUser;

  const { id } = await params;
  const { action } = await req.json();

  try {
    if (action === "submit") {
      const updated = await submitPurchaseRequest(id);
      return NextResponse.json(updated);
    }

    if (action === "receive") {
      if (user.roleName !== "PURCHASER" && user.roleName !== "ADMIN" && user.roleName !== "SUPER_ADMIN") {
        return NextResponse.json({ error: "Chỉ bộ phận Mua hàng được tiếp nhận" }, { status: 403 });
      }
      const updated = await receivePurchaseRequest(id, user.id);
      return NextResponse.json(updated);
    }

    if (action === "complete") {
      const updated = await completePurchaseRequest(id);
      return NextResponse.json(updated);
    }

    return NextResponse.json({ error: "Action không hợp lệ" }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}

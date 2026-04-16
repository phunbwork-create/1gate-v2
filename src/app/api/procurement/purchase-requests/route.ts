import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createPurchaseRequest, getPurchaseRequests } from "@/lib/procurement";
import { createPurchaseRequestSchema } from "@/schemas/procurement.schema";
import type { SessionUser } from "@/types";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = session.user as SessionUser;

  const requests = await getPurchaseRequests(user.companyId, user.id, user.roleName);
  return NextResponse.json(requests);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = session.user as SessionUser;

  if (user.roleName !== "WAREHOUSE" && user.roleName !== "ADMIN" && user.roleName !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Chỉ Thủ kho được tạo đề nghị mua hàng" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = createPurchaseRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const request = await createPurchaseRequest({
    ...parsed.data,
    requestedById: user.id,
    companyId: user.companyId,
    departmentId: user.departmentId ?? undefined,
  });

  return NextResponse.json(request, { status: 201 });
}

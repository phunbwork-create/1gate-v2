import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  getMaterialRequestById,
  submitMaterialRequest,
  approveMaterialRequest,
  rejectMaterialRequest,
} from "@/lib/procurement";
import { rejectSchema } from "@/schemas/procurement.schema";
import type { SessionUser } from "@/types";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const request = await getMaterialRequestById(id);
  if (!request) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(request);
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = session.user as SessionUser;

  const { id } = await params;
  const { action, reason } = await req.json();

  const request = await getMaterialRequestById(id);
  if (!request) return NextResponse.json({ error: "Not found" }, { status: 404 });

  try {
    if (action === "submit") {
      const updated = await submitMaterialRequest(id);
      return NextResponse.json(updated);
    }

    if (action === "approve") {
      if (user.roleName !== "DEPT_HEAD" && user.roleName !== "ADMIN" && user.roleName !== "SUPER_ADMIN") {
        return NextResponse.json({ error: "Không có quyền phê duyệt" }, { status: 403 });
      }
      const updated = await approveMaterialRequest(id, user.id);
      return NextResponse.json(updated);
    }

    if (action === "reject") {
      const parsed = rejectSchema.safeParse({ reason });
      if (!parsed.success) return NextResponse.json({ error: "Cần nhập lý do từ chối" }, { status: 400 });
      if (user.roleName !== "DEPT_HEAD" && user.roleName !== "ADMIN" && user.roleName !== "SUPER_ADMIN") {
        return NextResponse.json({ error: "Không có quyền từ chối" }, { status: 403 });
      }
      const updated = await rejectMaterialRequest(id, user.id, parsed.data.reason);
      return NextResponse.json(updated);
    }

    return NextResponse.json({ error: "Action không hợp lệ" }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}

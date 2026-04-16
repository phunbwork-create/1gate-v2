import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  getProcurementPlanById,
  submitProcurementPlan,
  approveProcurementPlan,
  rejectProcurementPlan,
} from "@/lib/procurement";
import { rejectSchema } from "@/schemas/procurement.schema";
import type { SessionUser } from "@/types";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const plan = await getProcurementPlanById(id);
  if (!plan) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(plan);
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = session.user as SessionUser;

  const { id } = await params;
  const { action, reason } = await req.json();

  const plan = await getProcurementPlanById(id);
  if (!plan) return NextResponse.json({ error: "Not found" }, { status: 404 });

  try {
    if (action === "submit") {
      const updated = await submitProcurementPlan(id);
      return NextResponse.json(updated);
    }

    if (action === "approve") {
      const canApprove =
        (plan.status === "SUBMITTED" && user.roleName === "DEPT_HEAD") ||
        (plan.status === "DEPT_HEAD_APPROVED" && user.roleName === "DIRECTOR");
      if (!canApprove) {
        return NextResponse.json({ error: "Không có quyền phê duyệt" }, { status: 403 });
      }
      const updated = await approveProcurementPlan(id, user.id, plan.status);
      return NextResponse.json(updated);
    }

    if (action === "reject") {
      const parsed = rejectSchema.safeParse({ reason });
      if (!parsed.success) return NextResponse.json({ error: "Cần nhập lý do từ chối" }, { status: 400 });
      const canReject =
        (plan.status === "SUBMITTED" && user.roleName === "DEPT_HEAD") ||
        (plan.status === "DEPT_HEAD_APPROVED" && user.roleName === "DIRECTOR");
      if (!canReject) {
        return NextResponse.json({ error: "Không có quyền từ chối" }, { status: 403 });
      }
      const updated = await rejectProcurementPlan(id, parsed.data.reason);
      return NextResponse.json(updated);
    }

    return NextResponse.json({ error: "Action không hợp lệ" }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}

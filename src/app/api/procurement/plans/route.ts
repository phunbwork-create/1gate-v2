import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createProcurementPlan, getProcurementPlans } from "@/lib/procurement";
import { createProcurementPlanSchema } from "@/schemas/procurement.schema";
import type { SessionUser } from "@/types";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = session.user as SessionUser;

  const plans = await getProcurementPlans(user.companyId, user.id, user.roleName);
  return NextResponse.json(plans);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = session.user as SessionUser;

  const body = await req.json();
  const parsed = createProcurementPlanSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const plan = await createProcurementPlan({
    ...parsed.data,
    requestedById: user.id,
    companyId: user.companyId,
    departmentId: user.departmentId ?? undefined,
  });

  return NextResponse.json(plan, { status: 201 });
}

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createMaterialRequest, getMaterialRequests } from "@/lib/procurement";
import { createMaterialRequestSchema } from "@/schemas/procurement.schema";
import type { SessionUser } from "@/types";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = session.user as SessionUser;

  const requests = await getMaterialRequests(user.companyId, user.id, user.roleName);
  return NextResponse.json(requests);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = session.user as SessionUser;

  const body = await req.json();
  const parsed = createMaterialRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const request = await createMaterialRequest({
    ...parsed.data,
    requestedById: user.id,
    companyId: user.companyId,
    departmentId: user.departmentId ?? undefined,
  });

  return NextResponse.json(request, { status: 201 });
}

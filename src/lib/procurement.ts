import { prisma } from "@/lib/prisma";
import type { ProcurementPlanStatus } from "@/generated/prisma";

// ── Code generator ────────────────────────────────────────────────────────────

async function generatePlanCode() {
  const year = new Date().getFullYear();
  const count = await prisma.procurementPlan.count();
  return `PP-${year}-${String(count + 1).padStart(4, "0")}`;
}
async function generateMRCode() {
  const year = new Date().getFullYear();
  const count = await prisma.materialRequest.count();
  return `MR-${year}-${String(count + 1).padStart(4, "0")}`;
}
async function generatePRCode() {
  const year = new Date().getFullYear();
  const count = await prisma.purchaseRequest.count();
  return `PR-${year}-${String(count + 1).padStart(4, "0")}`;
}

// ── Procurement Plan (F-02) ───────────────────────────────────────────────────

export interface PlanItemInput {
  itemName: string;
  quantity: number;
  unit: string;
  estimatedPrice?: number;
  note?: string;
}

export interface CreateProcurementPlanInput {
  title: string;
  description?: string;
  items: PlanItemInput[];
  requestedById: string;
  companyId: string;
  departmentId?: string;
}

export async function createProcurementPlan(input: CreateProcurementPlanInput) {
  const code = await generatePlanCode();
  const totalAmount = input.items.reduce(
    (sum, i) => sum + (i.estimatedPrice ?? 0) * i.quantity,
    0
  );

  return prisma.procurementPlan.create({
    data: {
      code,
      title: input.title,
      description: input.description,
      totalAmount,
      requestedById: input.requestedById,
      companyId: input.companyId,
      departmentId: input.departmentId,
      items: {
        create: input.items.map((item) => ({
          itemName: item.itemName,
          quantity: item.quantity,
          unit: item.unit,
          estimatedPrice: item.estimatedPrice,
          note: item.note,
        })),
      },
    },
    include: { items: true, requestedBy: { include: { role: true } } },
  });
}

export async function getProcurementPlans(companyId: string, userId: string, roleName: string) {
  const where =
    roleName === "EMPLOYEE"
      ? { companyId, requestedById: userId }
      : { companyId };

  return prisma.procurementPlan.findMany({
    where,
    include: {
      requestedBy: { select: { id: true, name: true } },
      department: { select: { id: true, name: true } },
      _count: { select: { items: true, materialRequests: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getProcurementPlanById(id: string) {
  return prisma.procurementPlan.findUnique({
    where: { id },
    include: {
      items: true,
      requestedBy: { select: { id: true, name: true, email: true } },
      department: { select: { id: true, name: true } },
      approvedByDeptHead: { select: { id: true, name: true } },
      approvedByDirector: { select: { id: true, name: true } },
      materialRequests: {
        select: { id: true, code: true, title: true, status: true },
      },
    },
  });
}

export async function submitProcurementPlan(id: string) {
  return prisma.procurementPlan.update({
    where: { id, status: "DRAFT" },
    data: { status: "SUBMITTED" },
  });
}

export async function approveProcurementPlan(
  id: string,
  approverId: string,
  currentStatus: ProcurementPlanStatus
) {
  if (currentStatus === "SUBMITTED") {
    return prisma.procurementPlan.update({
      where: { id },
      data: {
        status: "DEPT_HEAD_APPROVED",
        approvedByDeptHeadId: approverId,
        approvedByDeptHeadAt: new Date(),
      },
    });
  }
  if (currentStatus === "DEPT_HEAD_APPROVED") {
    return prisma.procurementPlan.update({
      where: { id },
      data: {
        status: "DIRECTOR_APPROVED",
        approvedByDirectorId: approverId,
        approvedByDirectorAt: new Date(),
      },
    });
  }
  throw new Error("Không thể phê duyệt ở trạng thái này");
}

export async function rejectProcurementPlan(id: string, reason: string) {
  return prisma.procurementPlan.update({
    where: { id },
    data: { status: "REJECTED", rejectedReason: reason },
  });
}

// ── Material Request (F-03) ───────────────────────────────────────────────────

export interface CreateMaterialRequestInput {
  title: string;
  description?: string;
  planId?: string;
  items: Omit<PlanItemInput, "estimatedPrice">[];
  requestedById: string;
  companyId: string;
  departmentId?: string;
}

export async function createMaterialRequest(input: CreateMaterialRequestInput) {
  const code = await generateMRCode();

  return prisma.materialRequest.create({
    data: {
      code,
      title: input.title,
      description: input.description,
      planId: input.planId,
      requestedById: input.requestedById,
      companyId: input.companyId,
      departmentId: input.departmentId,
      items: {
        create: input.items.map((item) => ({
          itemName: item.itemName,
          quantity: item.quantity,
          unit: item.unit,
          note: item.note,
        })),
      },
    },
    include: { items: true, requestedBy: { include: { role: true } } },
  });
}

export async function getMaterialRequests(companyId: string, userId: string, roleName: string) {
  const where =
    roleName === "EMPLOYEE"
      ? { companyId, requestedById: userId }
      : { companyId };

  return prisma.materialRequest.findMany({
    where,
    include: {
      requestedBy: { select: { id: true, name: true } },
      plan: { select: { id: true, code: true, title: true } },
      _count: { select: { items: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getMaterialRequestById(id: string) {
  return prisma.materialRequest.findUnique({
    where: { id },
    include: {
      items: true,
      plan: { select: { id: true, code: true, title: true } },
      requestedBy: { select: { id: true, name: true, email: true } },
      approvedBy: { select: { id: true, name: true } },
      purchaseRequests: {
        select: { id: true, code: true, status: true },
      },
    },
  });
}

export async function submitMaterialRequest(id: string) {
  return prisma.materialRequest.update({
    where: { id, status: "DRAFT" },
    data: { status: "SUBMITTED" },
  });
}

export async function approveMaterialRequest(id: string, approverId: string) {
  return prisma.materialRequest.update({
    where: { id, status: "SUBMITTED" },
    data: {
      status: "APPROVED",
      approvedById: approverId,
      approvedAt: new Date(),
    },
  });
}

export async function rejectMaterialRequest(id: string, approverId: string, reason: string) {
  return prisma.materialRequest.update({
    where: { id, status: "SUBMITTED" },
    data: {
      status: "REJECTED",
      approvedById: approverId,
      approvedAt: new Date(),
      rejectedReason: reason,
    },
  });
}

// ── Purchase Request (F-04) ───────────────────────────────────────────────────

export interface CreatePurchaseRequestInput {
  materialRequestId?: string;
  stockCheckNote?: string;
  items: PlanItemInput[];
  requestedById: string;
  companyId: string;
  departmentId?: string;
}

export async function createPurchaseRequest(input: CreatePurchaseRequestInput) {
  const code = await generatePRCode();

  return prisma.purchaseRequest.create({
    data: {
      code,
      materialRequestId: input.materialRequestId,
      stockCheckNote: input.stockCheckNote,
      requestedById: input.requestedById,
      companyId: input.companyId,
      departmentId: input.departmentId,
      items: {
        create: input.items.map((item) => ({
          itemName: item.itemName,
          quantity: item.quantity,
          unit: item.unit,
          estimatedPrice: item.estimatedPrice,
          note: item.note,
        })),
      },
    },
    include: { items: true, requestedBy: { include: { role: true } } },
  });
}

export async function getPurchaseRequests(companyId: string, userId: string, roleName: string) {
  const where =
    roleName === "WAREHOUSE"
      ? { companyId, requestedById: userId }
      : { companyId };

  return prisma.purchaseRequest.findMany({
    where,
    include: {
      requestedBy: { select: { id: true, name: true } },
      materialRequest: { select: { id: true, code: true, title: true } },
      _count: { select: { items: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getPurchaseRequestById(id: string) {
  return prisma.purchaseRequest.findUnique({
    where: { id },
    include: {
      items: true,
      materialRequest: { select: { id: true, code: true, title: true } },
      requestedBy: { select: { id: true, name: true, email: true } },
      receivedBy: { select: { id: true, name: true } },
    },
  });
}

export async function submitPurchaseRequest(id: string) {
  return prisma.purchaseRequest.update({
    where: { id, status: "DRAFT" },
    data: { status: "SUBMITTED" },
  });
}

export async function receivePurchaseRequest(id: string, receiverId: string) {
  return prisma.purchaseRequest.update({
    where: { id, status: "SUBMITTED" },
    data: {
      status: "RECEIVED",
      receivedById: receiverId,
      receivedAt: new Date(),
    },
  });
}

export async function completePurchaseRequest(id: string) {
  return prisma.purchaseRequest.update({
    where: { id, status: "RECEIVED" },
    data: { status: "COMPLETED" },
  });
}

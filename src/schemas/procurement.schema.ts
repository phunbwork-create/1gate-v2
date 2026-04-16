import { z } from "zod";

export const planItemSchema = z.object({
  itemName: z.string().min(1, "Tên hàng hóa không được để trống"),
  quantity: z.number().positive("Số lượng phải lớn hơn 0"),
  unit: z.string().min(1, "Đơn vị không được để trống"),
  estimatedPrice: z.number().nonnegative().optional(),
  note: z.string().optional(),
});

export const createProcurementPlanSchema = z.object({
  title: z.string().min(1, "Tiêu đề không được để trống"),
  description: z.string().optional(),
  items: z.array(planItemSchema).min(1, "Phải có ít nhất 1 hạng mục"),
});

export type CreateProcurementPlanInput = z.infer<typeof createProcurementPlanSchema>;

export const rejectSchema = z.object({
  reason: z.string().min(1, "Lý do từ chối không được để trống"),
});

// ── Material Request ──────────────────────────────────────────────────────────

export const materialItemSchema = z.object({
  itemName: z.string().min(1, "Tên vật tư không được để trống"),
  quantity: z.number().positive("Số lượng phải lớn hơn 0"),
  unit: z.string().min(1, "Đơn vị không được để trống"),
  note: z.string().optional(),
});

export const createMaterialRequestSchema = z.object({
  title: z.string().min(1, "Tiêu đề không được để trống"),
  description: z.string().optional(),
  planId: z.string().optional(),
  items: z.array(materialItemSchema).min(1, "Phải có ít nhất 1 vật tư"),
});

export type CreateMaterialRequestInput = z.infer<typeof createMaterialRequestSchema>;

// ── Purchase Request ──────────────────────────────────────────────────────────

export const createPurchaseRequestSchema = z.object({
  materialRequestId: z.string().optional(),
  stockCheckNote: z.string().optional(),
  items: z.array(planItemSchema).min(1, "Phải có ít nhất 1 hạng mục"),
});

export type CreatePurchaseRequestInput = z.infer<typeof createPurchaseRequestSchema>;

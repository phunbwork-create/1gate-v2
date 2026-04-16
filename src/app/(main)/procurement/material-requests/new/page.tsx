"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { createMaterialRequestSchema, type CreateMaterialRequestInput } from "@/schemas/procurement.schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ItemsTable } from "@/components/procurement/ItemsTable";
import type { Control, FieldValues } from "react-hook-form";
import { useState } from "react";

export default function NewMaterialRequestPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<CreateMaterialRequestInput>({
    resolver: zodResolver(createMaterialRequestSchema),
    defaultValues: {
      title: "",
      description: "",
      planId: "",
      items: [{ itemName: "", quantity: 1, unit: "cái", note: "" }],
    },
  });

  const onSubmit = async (data: CreateMaterialRequestInput) => {
    setIsLoading(true);
    try {
      const payload = { ...data, planId: data.planId || undefined };
      const res = await fetch("/api/procurement/material-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        toast.error("Tạo thất bại", { description: JSON.stringify(err.error) });
        return;
      }

      const req = await res.json();
      toast.success("Tạo đề nghị thành công", { description: req.code });
      router.push(`/procurement/material-requests/${req.id}`);
    } catch {
      toast.error("Đã xảy ra lỗi");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Tạo Đề nghị Cấp vật tư</h1>
        <p className="text-muted-foreground text-sm">F-03 — Đề nghị cấp vật tư nội bộ</p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Thông tin chung</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label>Tiêu đề <span className="text-destructive">*</span></Label>
              <Input {...form.register("title")} placeholder="VD: Đề nghị cấp vật tư tháng 5/2026" />
              {form.formState.errors.title && (
                <p className="text-xs text-destructive">{form.formState.errors.title.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label>Mã kế hoạch liên kết (nếu có)</Label>
              <Input {...form.register("planId")} placeholder="PP-2026-0001" />
            </div>

            <div className="space-y-1.5">
              <Label>Mô tả / Ghi chú</Label>
              <Textarea {...form.register("description")} placeholder="Mục đích sử dụng..." rows={3} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Danh sách vật tư cần cấp</CardTitle></CardHeader>
          <CardContent>
            <ItemsTable control={form.control as unknown as Control<FieldValues>} name="items" showPrice={false} />
            {form.formState.errors.items && (
              <p className="text-xs text-destructive mt-2">{form.formState.errors.items.message}</p>
            )}
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Lưu nháp
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>Hủy</Button>
        </div>
      </form>
    </div>
  );
}

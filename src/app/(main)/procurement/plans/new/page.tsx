"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { createProcurementPlanSchema, type CreateProcurementPlanInput } from "@/schemas/procurement.schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ItemsTable } from "@/components/procurement/ItemsTable";
import type { Control, FieldValues } from "react-hook-form";
import { useState } from "react";

export default function NewProcurementPlanPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<CreateProcurementPlanInput>({
    resolver: zodResolver(createProcurementPlanSchema),
    defaultValues: {
      title: "",
      description: "",
      items: [{ itemName: "", quantity: 1, unit: "cái", estimatedPrice: 0, note: "" }],
    },
  });

  const onSubmit = async (data: CreateProcurementPlanInput) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/procurement/plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const err = await res.json();
        toast.error("Tạo thất bại", { description: JSON.stringify(err.error) });
        return;
      }

      const plan = await res.json();
      toast.success("Tạo kế hoạch thành công", { description: plan.code });
      router.push(`/procurement/plans/${plan.id}`);
    } catch {
      toast.error("Đã xảy ra lỗi");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Tạo Kế hoạch Mua sắm</h1>
        <p className="text-muted-foreground text-sm">F-02 — Lập kế hoạch đầu tư/mua sắm mới</p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Thông tin chung</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="title">Tiêu đề <span className="text-destructive">*</span></Label>
              <Input id="title" {...form.register("title")} placeholder="VD: Kế hoạch mua sắm thiết bị Q2/2026" />
              {form.formState.errors.title && (
                <p className="text-xs text-destructive">{form.formState.errors.title.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description">Mô tả / Căn cứ</Label>
              <Textarea
                id="description"
                {...form.register("description")}
                placeholder="Căn cứ hợp đồng, kế hoạch sản xuất..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Danh sách hạng mục</CardTitle></CardHeader>
          <CardContent>
            <ItemsTable control={form.control as unknown as Control<FieldValues>} name="items" showPrice={true} />
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
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Hủy
          </Button>
        </div>
      </form>
    </div>
  );
}

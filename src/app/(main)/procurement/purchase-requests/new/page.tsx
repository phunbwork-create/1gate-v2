"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { createPurchaseRequestSchema, type CreatePurchaseRequestInput } from "@/schemas/procurement.schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ItemsTable } from "@/components/procurement/ItemsTable";
import type { Control, FieldValues } from "react-hook-form";
import { useState } from "react";

export default function NewPurchaseRequestPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<CreatePurchaseRequestInput>({
    resolver: zodResolver(createPurchaseRequestSchema),
    defaultValues: {
      materialRequestId: "",
      stockCheckNote: "",
      items: [{ itemName: "", quantity: 1, unit: "cái", estimatedPrice: 0, note: "" }],
    },
  });

  const onSubmit = async (data: CreatePurchaseRequestInput) => {
    setIsLoading(true);
    try {
      const payload = { ...data, materialRequestId: data.materialRequestId || undefined };
      const res = await fetch("/api/procurement/purchase-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        toast.error("Tạo thất bại", { description: err.error });
        return;
      }

      const req = await res.json();
      toast.success("Tạo đề nghị mua hàng thành công", { description: req.code });
      router.push(`/procurement/purchase-requests/${req.id}`);
    } catch {
      toast.error("Đã xảy ra lỗi");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Tạo Đề nghị Mua hàng</h1>
        <p className="text-muted-foreground text-sm">F-04 — Kho lập đề nghị mua hàng sau kiểm tra tồn kho</p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Thông tin tồn kho</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label>Mã đề nghị cấp vật tư liên kết (nếu có)</Label>
              <Input {...form.register("materialRequestId")} placeholder="MR-2026-0001" />
            </div>
            <div className="space-y-1.5">
              <Label>Ghi chú tồn kho <span className="text-destructive">*</span></Label>
              <Textarea
                {...form.register("stockCheckNote")}
                placeholder="Kết quả kiểm tra tồn kho: Hàng hóa A còn 5/20 cái, thiếu 15 cái cần mua thêm..."
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Danh sách hàng hóa cần mua</CardTitle></CardHeader>
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
          <Button type="button" variant="outline" onClick={() => router.back()}>Hủy</Button>
        </div>
      </form>
    </div>
  );
}

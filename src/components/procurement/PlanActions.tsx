"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, CheckCircle, XCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface PlanActionsProps {
  planId: string;
  canSubmit: boolean;
  canApprove: boolean;
  canReject: boolean;
}

export function PlanActions({ planId, canSubmit, canApprove, canReject }: PlanActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [reason, setReason] = useState("");

  const action = async (act: string, payload?: object) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/procurement/plans/${planId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: act, ...payload }),
      });
      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error ?? "Thao tác thất bại");
        return;
      }
      toast.success(
        act === "submit" ? "Đã gửi phê duyệt" :
        act === "approve" ? "Đã phê duyệt" : "Đã từ chối"
      );
      router.refresh();
    } catch {
      toast.error("Đã xảy ra lỗi");
    } finally {
      setLoading(false);
      setRejectOpen(false);
    }
  };

  if (!canSubmit && !canApprove && !canReject) return null;

  return (
    <>
      <div className="flex gap-2 shrink-0">
        {canSubmit && (
          <Button size="sm" onClick={() => action("submit")} disabled={loading}>
            {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
            <span className="ml-1.5">Gửi duyệt</span>
          </Button>
        )}
        {canApprove && (
          <Button size="sm" onClick={() => action("approve")} disabled={loading}
            className="bg-green-600 hover:bg-green-700 text-white">
            {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle className="h-3.5 w-3.5" />}
            <span className="ml-1.5">Phê duyệt</span>
          </Button>
        )}
        {canReject && (
          <Button size="sm" variant="destructive" onClick={() => setRejectOpen(true)} disabled={loading}>
            <XCircle className="h-3.5 w-3.5" />
            <span className="ml-1.5">Từ chối</span>
          </Button>
        )}
      </div>

      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Từ chối kế hoạch</DialogTitle>
          </DialogHeader>
          <div className="space-y-1.5">
            <Label>Lý do từ chối <span className="text-destructive">*</span></Label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Nhập lý do từ chối..."
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectOpen(false)}>Hủy</Button>
            <Button
              variant="destructive"
              disabled={!reason.trim() || loading}
              onClick={() => action("reject", { reason })}
            >
              {loading && <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />}
              Xác nhận từ chối
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

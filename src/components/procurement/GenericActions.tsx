"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, CheckCircle, XCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface GenericActionsProps {
  entityId: string;
  apiPath: string; // e.g. "material-requests"
  canSubmit: boolean;
  canApprove: boolean;
  canReject: boolean;
  approveLabel?: string;
  submitLabel?: string;
  extraAction?: { label: string; action: string; variant?: "default" | "outline" };
}

export function GenericActions({
  entityId,
  apiPath,
  canSubmit,
  canApprove,
  canReject,
  approveLabel = "Phê duyệt",
  submitLabel = "Gửi duyệt",
  extraAction,
}: GenericActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [reason, setReason] = useState("");

  const doAction = async (act: string, payload?: object) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/procurement/${apiPath}/${entityId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: act, ...payload }),
      });
      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error ?? "Thao tác thất bại");
        return;
      }
      const labels: Record<string, string> = {
        submit: "Đã gửi phê duyệt",
        approve: "Đã phê duyệt",
        reject: "Đã từ chối",
        receive: "Đã tiếp nhận",
        complete: "Đã hoàn thành",
      };
      toast.success(labels[act] ?? "Thành công");
      router.refresh();
    } catch {
      toast.error("Đã xảy ra lỗi");
    } finally {
      setLoading(false);
      setRejectOpen(false);
    }
  };

  if (!canSubmit && !canApprove && !canReject && !extraAction) return null;

  return (
    <>
      <div className="flex gap-2 shrink-0">
        {canSubmit && (
          <Button size="sm" onClick={() => doAction("submit")} disabled={loading}>
            {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
            <span className="ml-1.5">{submitLabel}</span>
          </Button>
        )}
        {canApprove && (
          <Button size="sm" onClick={() => doAction("approve")} disabled={loading}
            className="bg-green-600 hover:bg-green-700 text-white">
            {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle className="h-3.5 w-3.5" />}
            <span className="ml-1.5">{approveLabel}</span>
          </Button>
        )}
        {canReject && (
          <Button size="sm" variant="destructive" onClick={() => setRejectOpen(true)} disabled={loading}>
            <XCircle className="h-3.5 w-3.5" />
            <span className="ml-1.5">Từ chối</span>
          </Button>
        )}
        {extraAction && (
          <Button
            size="sm"
            variant={extraAction.variant ?? "outline"}
            onClick={() => doAction(extraAction.action)}
            disabled={loading}
          >
            {loading && <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />}
            {extraAction.label}
          </Button>
        )}
      </div>

      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Xác nhận từ chối</DialogTitle></DialogHeader>
          <div className="space-y-1.5">
            <Label>Lý do từ chối <span className="text-destructive">*</span></Label>
            <Textarea value={reason} onChange={(e) => setReason(e.target.value)}
              placeholder="Nhập lý do..." rows={4} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectOpen(false)}>Hủy</Button>
            <Button variant="destructive" disabled={!reason.trim() || loading}
              onClick={() => doAction("reject", { reason })}>
              {loading && <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />}
              Xác nhận từ chối
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

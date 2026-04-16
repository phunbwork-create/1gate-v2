import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { getMaterialRequestById } from "@/lib/procurement";
import { StatusBadge } from "@/components/procurement/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GenericActions } from "@/components/procurement/GenericActions";
import type { SessionUser } from "@/types";

export default async function MaterialRequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const user = session.user as SessionUser;

  const { id } = await params;
  const req = await getMaterialRequestById(id);
  if (!req) notFound();

  const canSubmit = req.status === "DRAFT" && req.requestedById === user.id;
  const canApprove =
    req.status === "SUBMITTED" &&
    (user.roleName === "DEPT_HEAD" || user.roleName === "ADMIN" || user.roleName === "SUPER_ADMIN");
  const canReject = canApprove;

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <span className="font-mono text-sm text-muted-foreground">{req.code}</span>
            <StatusBadge status={req.status} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">{req.title}</h1>
          {req.description && <p className="text-muted-foreground text-sm mt-1">{req.description}</p>}
        </div>
        <GenericActions
          entityId={req.id}
          apiPath="material-requests"
          canSubmit={canSubmit}
          canApprove={canApprove}
          canReject={canReject}
        />
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {[
          { label: "Người lập", value: req.requestedBy.name },
          { label: "Kế hoạch liên kết", value: req.plan?.code ?? "—" },
          { label: "Ngày tạo", value: new Date(req.createdAt).toLocaleDateString("vi-VN") },
        ].map((item) => (
          <Card key={item.label}>
            <CardContent className="pt-4 pb-3">
              <p className="text-xs text-muted-foreground">{item.label}</p>
              <p className="font-medium text-sm mt-0.5">{item.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Danh sách vật tư</CardTitle></CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left px-4 py-2.5 font-medium w-8">#</th>
                  <th className="text-left px-4 py-2.5 font-medium">Tên vật tư</th>
                  <th className="text-left px-4 py-2.5 font-medium w-24">Số lượng</th>
                  <th className="text-left px-4 py-2.5 font-medium w-20">Đơn vị</th>
                  <th className="text-left px-4 py-2.5 font-medium">Ghi chú</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {req.items.map((item: { id: string; itemName: string; quantity: unknown; unit: string; note?: string | null }, i: number) => (
                  <tr key={item.id} className="bg-card">
                    <td className="px-4 py-2.5 text-muted-foreground">{i + 1}</td>
                    <td className="px-4 py-2.5 font-medium">{item.itemName}</td>
                    <td className="px-4 py-2.5">{Number(item.quantity).toLocaleString("vi-VN")}</td>
                    <td className="px-4 py-2.5 text-muted-foreground">{item.unit}</td>
                    <td className="px-4 py-2.5 text-muted-foreground text-xs">{item.note ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {req.status === "REJECTED" && req.rejectedReason && (
        <div className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <span className="font-medium">Lý do từ chối: </span>{req.rejectedReason}
        </div>
      )}
    </div>
  );
}

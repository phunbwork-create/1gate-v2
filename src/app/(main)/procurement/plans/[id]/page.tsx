import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { getProcurementPlanById } from "@/lib/procurement";
import { StatusBadge } from "@/components/procurement/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { PlanActions } from "@/components/procurement/PlanActions";
import type { SessionUser } from "@/types";

export default async function ProcurementPlanDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const user = session.user as SessionUser;

  const { id } = await params;
  const plan = await getProcurementPlanById(id);
  if (!plan) notFound();

  const totalAmount = plan.items.reduce(
    (sum, i) => sum + Number(i.estimatedPrice ?? 0) * Number(i.quantity),
    0
  );

  const canApprove =
    (plan.status === "SUBMITTED" && user.roleName === "DEPT_HEAD") ||
    (plan.status === "DEPT_HEAD_APPROVED" && user.roleName === "DIRECTOR");
  const canReject = canApprove;
  const canSubmit = plan.status === "DRAFT" && plan.requestedById === user.id;

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <span className="font-mono text-sm text-muted-foreground">{plan.code}</span>
            <StatusBadge status={plan.status} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">{plan.title}</h1>
          {plan.description && (
            <p className="text-muted-foreground text-sm mt-1">{plan.description}</p>
          )}
        </div>
        <PlanActions
          planId={plan.id}
          canSubmit={canSubmit}
          canApprove={canApprove}
          canReject={canReject}
        />
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Người lập", value: plan.requestedBy.name },
          { label: "Ngày tạo", value: new Date(plan.createdAt).toLocaleDateString("vi-VN") },
          { label: "Tổng giá trị", value: totalAmount > 0 ? `${totalAmount.toLocaleString("vi-VN")} ₫` : "—" },
          { label: "Số hạng mục", value: String(plan.items.length) },
        ].map((item) => (
          <Card key={item.label}>
            <CardContent className="pt-4 pb-3">
              <p className="text-xs text-muted-foreground">{item.label}</p>
              <p className="font-medium text-sm mt-0.5">{item.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Items table */}
      <Card>
        <CardHeader><CardTitle className="text-base">Danh sách hạng mục</CardTitle></CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left px-4 py-2.5 font-medium w-8">#</th>
                  <th className="text-left px-4 py-2.5 font-medium">Tên hàng hóa</th>
                  <th className="text-left px-4 py-2.5 font-medium w-24">Số lượng</th>
                  <th className="text-left px-4 py-2.5 font-medium w-20">Đơn vị</th>
                  <th className="text-right px-4 py-2.5 font-medium w-36">Đơn giá</th>
                  <th className="text-right px-4 py-2.5 font-medium w-36">Thành tiền</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {plan.items.map((item, i) => (
                  <tr key={item.id} className="bg-card">
                    <td className="px-4 py-2.5 text-muted-foreground">{i + 1}</td>
                    <td className="px-4 py-2.5 font-medium">{item.itemName}</td>
                    <td className="px-4 py-2.5">{Number(item.quantity).toLocaleString("vi-VN")}</td>
                    <td className="px-4 py-2.5 text-muted-foreground">{item.unit}</td>
                    <td className="px-4 py-2.5 text-right">
                      {item.estimatedPrice ? Number(item.estimatedPrice).toLocaleString("vi-VN") + " ₫" : "—"}
                    </td>
                    <td className="px-4 py-2.5 text-right font-medium">
                      {item.estimatedPrice
                        ? (Number(item.estimatedPrice) * Number(item.quantity)).toLocaleString("vi-VN") + " ₫"
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
              {totalAmount > 0 && (
                <tfoot className="bg-muted/30">
                  <tr>
                    <td colSpan={5} className="px-4 py-2.5 text-right font-medium text-sm">Tổng cộng:</td>
                    <td className="px-4 py-2.5 text-right font-bold text-primary">
                      {totalAmount.toLocaleString("vi-VN")} ₫
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Approval history */}
      {(plan.approvedByDeptHead || plan.approvedByDirector || plan.status === "REJECTED") && (
        <Card>
          <CardHeader><CardTitle className="text-base">Lịch sử phê duyệt</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {plan.approvedByDeptHead && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Trưởng bộ phận duyệt</span>
                <span className="font-medium">{plan.approvedByDeptHead.name}</span>
                <span className="text-muted-foreground text-xs">
                  {plan.approvedByDeptHeadAt
                    ? new Date(plan.approvedByDeptHeadAt).toLocaleString("vi-VN")
                    : ""}
                </span>
              </div>
            )}
            {plan.approvedByDeptHead && plan.approvedByDirector && <Separator />}
            {plan.approvedByDirector && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Giám đốc duyệt</span>
                <span className="font-medium">{plan.approvedByDirector.name}</span>
                <span className="text-muted-foreground text-xs">
                  {plan.approvedByDirectorAt
                    ? new Date(plan.approvedByDirectorAt).toLocaleString("vi-VN")
                    : ""}
                </span>
              </div>
            )}
            {plan.status === "REJECTED" && plan.rejectedReason && (
              <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                <span className="font-medium">Lý do từ chối: </span>{plan.rejectedReason}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

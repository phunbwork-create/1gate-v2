import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { getPurchaseRequestById } from "@/lib/procurement";
import { StatusBadge } from "@/components/procurement/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GenericActions } from "@/components/procurement/GenericActions";
import type { SessionUser } from "@/types";

export default async function PurchaseRequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const user = session.user as SessionUser;

  const { id } = await params;
  const req = await getPurchaseRequestById(id);
  if (!req) notFound();

  const canSubmit = req.status === "DRAFT" && req.requestedById === user.id;
  const canReceive =
    req.status === "SUBMITTED" &&
    (user.roleName === "PURCHASER" || user.roleName === "ADMIN" || user.roleName === "SUPER_ADMIN");
  const canComplete =
    req.status === "RECEIVED" &&
    (user.roleName === "PURCHASER" || user.roleName === "ADMIN" || user.roleName === "SUPER_ADMIN");

  const totalAmount = req.items.reduce(
    (sum, i) => sum + Number(i.estimatedPrice ?? 0) * Number(i.quantity),
    0
  );

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <span className="font-mono text-sm text-muted-foreground">{req.code}</span>
            <StatusBadge status={req.status} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Đề nghị Mua hàng</h1>
        </div>
        <GenericActions
          entityId={req.id}
          apiPath="purchase-requests"
          canSubmit={canSubmit}
          canApprove={canReceive}
          canReject={false}
          approveLabel="Tiếp nhận"
          submitLabel="Gửi Mua hàng"
          extraAction={canComplete ? { label: "Hoàn thành", action: "complete" } : undefined}
        />
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Người lập", value: req.requestedBy.name },
          { label: "Đề nghị vật tư", value: req.materialRequest?.code ?? "—" },
          { label: "Tổng giá trị", value: totalAmount > 0 ? `${totalAmount.toLocaleString("vi-VN")} ₫` : "—" },
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

      {req.stockCheckNote && (
        <Card>
          <CardHeader><CardTitle className="text-base">Ghi chú tồn kho</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap text-muted-foreground">{req.stockCheckNote}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle className="text-base">Danh sách hàng hóa cần mua</CardTitle></CardHeader>
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
                {req.items.map((item, i) => (
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

      {req.receivedBy && (
        <div className="rounded-md bg-green-50 border border-green-200 px-4 py-3 text-sm">
          <span className="font-medium text-green-800">Đã tiếp nhận bởi: </span>
          <span className="text-green-700">{req.receivedBy.name}</span>
          {req.receivedAt && (
            <span className="text-green-600 ml-2 text-xs">
              — {new Date(req.receivedAt).toLocaleString("vi-VN")}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getPurchaseRequests } from "@/lib/procurement";
import { StatusBadge } from "@/components/procurement/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, FileText } from "lucide-react";
import type { SessionUser } from "@/types";

export default async function PurchaseRequestsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const user = session.user as SessionUser;

  const requests = await getPurchaseRequests(user.companyId, user.id, user.roleName);
  const canCreate = ["WAREHOUSE", "ADMIN", "SUPER_ADMIN"].includes(user.roleName);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Đề nghị Mua hàng</h1>
          <p className="text-muted-foreground text-sm">F-04 — Kiểm tra tồn kho & Đề nghị mua hàng</p>
        </div>
        {canCreate && (
          <Button asChild>
            <Link href="/procurement/purchase-requests/new">
              <Plus className="h-4 w-4 mr-2" />
              Tạo đề nghị
            </Link>
          </Button>
        )}
      </div>

      {requests.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <FileText className="h-10 w-10 mb-3 opacity-30" />
            <p className="text-sm">Chưa có đề nghị mua hàng nào</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="pb-0">
            <CardTitle className="text-base">Danh sách ({requests.length})</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="rounded-md border overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left px-4 py-2.5 font-medium">Mã</th>
                    <th className="text-left px-4 py-2.5 font-medium">Đề nghị vật tư</th>
                    <th className="text-left px-4 py-2.5 font-medium">Người lập</th>
                    <th className="text-left px-4 py-2.5 font-medium">Trạng thái</th>
                    <th className="text-left px-4 py-2.5 font-medium">Ngày tạo</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {requests.map((req) => (
                    <tr key={req.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground">{req.code}</td>
                      <td className="px-4 py-2.5 text-xs text-muted-foreground">{req.materialRequest?.code ?? "—"}</td>
                      <td className="px-4 py-2.5 text-muted-foreground">{req.requestedBy.name}</td>
                      <td className="px-4 py-2.5"><StatusBadge status={req.status} /></td>
                      <td className="px-4 py-2.5 text-muted-foreground text-xs">
                        {new Date(req.createdAt).toLocaleDateString("vi-VN")}
                      </td>
                      <td className="px-4 py-2.5">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/procurement/purchase-requests/${req.id}`}>Xem</Link>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

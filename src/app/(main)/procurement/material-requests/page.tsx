import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getMaterialRequests } from "@/lib/procurement";
import { StatusBadge } from "@/components/procurement/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, FileText } from "lucide-react";
import type { SessionUser } from "@/types";

export default async function MaterialRequestsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const user = session.user as SessionUser;

  const requests = await getMaterialRequests(user.companyId, user.id, user.roleName);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Đề nghị Cấp vật tư</h1>
          <p className="text-muted-foreground text-sm">F-03 — Đề nghị cấp vật tư nội bộ</p>
        </div>
        <Button asChild>
          <Link href="/procurement/material-requests/new">
            <Plus className="h-4 w-4 mr-2" />
            Tạo đề nghị
          </Link>
        </Button>
      </div>

      {requests.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <FileText className="h-10 w-10 mb-3 opacity-30" />
            <p className="text-sm">Chưa có đề nghị nào</p>
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
                    <th className="text-left px-4 py-2.5 font-medium">Tiêu đề</th>
                    <th className="text-left px-4 py-2.5 font-medium">Kế hoạch</th>
                    <th className="text-left px-4 py-2.5 font-medium">Người lập</th>
                    <th className="text-left px-4 py-2.5 font-medium">Trạng thái</th>
                    <th className="text-left px-4 py-2.5 font-medium">Ngày tạo</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {requests.map((req: typeof requests[number]) => (
                    <tr key={req.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground">{req.code}</td>
                      <td className="px-4 py-2.5 font-medium">{req.title}</td>
                      <td className="px-4 py-2.5 text-xs text-muted-foreground">{req.plan?.code ?? "—"}</td>
                      <td className="px-4 py-2.5 text-muted-foreground">{req.requestedBy.name}</td>
                      <td className="px-4 py-2.5"><StatusBadge status={req.status} /></td>
                      <td className="px-4 py-2.5 text-muted-foreground text-xs">
                        {new Date(req.createdAt).toLocaleDateString("vi-VN")}
                      </td>
                      <td className="px-4 py-2.5">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/procurement/material-requests/${req.id}`}>Xem</Link>
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

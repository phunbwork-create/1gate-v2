import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, CreditCard, FileText, Clock } from "lucide-react";
import type { SessionUser } from "@/types";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = session.user as SessionUser;

  // Fetch unread notifications count
  const unreadCount = await prisma.notification.count({
    where: { userId: user.id, isRead: false },
  });

  const stats = [
    {
      title: "Thông báo chưa đọc",
      value: unreadCount,
      icon: Bell,
      description: "Cần xem xét",
      color: "text-orange-500",
    },
    {
      title: "Đề nghị đang xử lý",
      value: 0,
      icon: Clock,
      description: "Đang chờ duyệt",
      color: "text-blue-500",
    },
    {
      title: "Đề nghị đã duyệt",
      value: 0,
      icon: CreditCard,
      description: "Tháng này",
      color: "text-green-500",
    },
    {
      title: "Kế hoạch chi",
      value: 0,
      icon: FileText,
      description: "Đang chờ phê duyệt",
      color: "text-purple-500",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Xin chào, <span className="font-medium text-foreground">{user.name}</span> —{" "}
          <Badge variant="secondary" className="text-xs">
            {user.roleName.replace("_", " ")}
          </Badge>
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Placeholder for recent activity */}
      <Card>
        <CardHeader>
          <CardTitle>Hoạt động gần đây</CardTitle>
          <CardDescription>
            Các đề nghị và thông báo mới nhất
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <FileText className="h-10 w-10 mb-3 opacity-30" />
            <p className="text-sm">Chưa có hoạt động nào</p>
            <p className="text-xs mt-1">
              Tạo đề nghị đầu tiên để bắt đầu
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

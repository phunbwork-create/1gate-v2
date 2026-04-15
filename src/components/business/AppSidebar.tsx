"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type { RoleName } from "@/types";
import {
  LayoutDashboard,
  ShoppingCart,
  CreditCard,
  FileText,
  CheckSquare,
  Users,
  Building2,
  Bell,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  roles?: RoleName[]; // undefined = all roles
}

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  {
    label: "Đề nghị Mua hàng",
    href: "/procurement",
    icon: ShoppingCart,
    roles: ["PURCHASER", "WAREHOUSE", "DEPT_HEAD", "ACCOUNTANT", "ADMIN", "SUPER_ADMIN"],
  },
  {
    label: "Đề nghị Thanh toán",
    href: "/payment",
    icon: CreditCard,
    roles: ["EMPLOYEE", "PURCHASER", "DEPT_HEAD", "ACCOUNTANT", "ADMIN", "SUPER_ADMIN"],
  },
  {
    label: "Kế hoạch Chi",
    href: "/payment-plan",
    icon: FileText,
    roles: ["ACCOUNTANT", "DIRECTOR", "ADMIN", "SUPER_ADMIN"],
  },
  {
    label: "Quyết toán",
    href: "/settlement",
    icon: CheckSquare,
    roles: ["ACCOUNTANT", "ADMIN", "SUPER_ADMIN"],
  },
  { label: "Thông báo", href: "/notifications", icon: Bell },
  {
    label: "Người dùng",
    href: "/admin/users",
    icon: Users,
    roles: ["ADMIN", "SUPER_ADMIN"],
  },
  {
    label: "Cài đặt",
    href: "/admin/settings",
    icon: Building2,
    roles: ["ADMIN", "SUPER_ADMIN"],
  },
];

interface AppSidebarProps {
  roleName: RoleName;
  companyName: string;
  userName: string;
}

export function AppSidebar({ roleName, companyName, userName }: AppSidebarProps) {
  const pathname = usePathname();

  const visibleItems = NAV_ITEMS.filter(
    (item) => !item.roles || item.roles.includes(roleName)
  );

  return (
    <aside className="flex flex-col w-60 min-h-screen border-r bg-card px-3 py-4 gap-1 shrink-0">
      {/* Brand */}
      <div className="px-3 pb-4 border-b mb-2">
        <span className="text-xl font-bold tracking-tight">1Gate</span>
        <p className="text-xs text-muted-foreground truncate">{companyName}</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-0.5">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User info */}
      <div className="border-t pt-3 px-3">
        <p className="text-sm font-medium truncate">{userName}</p>
        <p className="text-xs text-muted-foreground">{roleName.replace("_", " ")}</p>
      </div>
    </aside>
  );
}

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
    <aside
      className="flex flex-col w-60 min-h-screen shrink-0"
      style={{
        backgroundColor: "var(--sidebar)",
        color: "var(--sidebar-foreground)",
        borderRight: "1px solid var(--sidebar-border)",
      }}
    >
      {/* Brand */}
      <div className="px-5 py-5" style={{ borderBottom: "1px solid var(--sidebar-border)" }}>
        <div className="flex items-center gap-2">
          <div
            className="h-7 w-7 rounded-md flex items-center justify-center text-xs font-bold"
            style={{ backgroundColor: "var(--sidebar-primary)", color: "var(--sidebar-primary-foreground)" }}
          >
            1G
          </div>
          <span className="text-base font-semibold tracking-tight" style={{ color: "var(--sidebar-foreground)" }}>
            1Gate
          </span>
        </div>
        <p className="text-xs mt-1 truncate" style={{ color: "var(--sidebar-foreground)", opacity: 0.45 }}>
          {companyName}
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-3 space-y-0.5">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all duration-150",
                isActive
                  ? "text-white"
                  : "hover:opacity-100"
              )}
              style={
                isActive
                  ? { backgroundColor: "var(--sidebar-primary)" }
                  : {
                      color: "var(--sidebar-foreground)",
                      opacity: 0.7,
                    }
              }
              onMouseEnter={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.backgroundColor = "var(--sidebar-accent)";
                  (e.currentTarget as HTMLElement).style.opacity = "1";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
                  (e.currentTarget as HTMLElement).style.opacity = "0.7";
                }
              }}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User info */}
      <div className="px-4 py-4" style={{ borderTop: "1px solid var(--sidebar-border)" }}>
        <div className="flex items-center gap-2.5">
          <div
            className="h-7 w-7 rounded-full flex items-center justify-center text-xs font-semibold shrink-0"
            style={{ backgroundColor: "var(--sidebar-accent)", color: "var(--sidebar-accent-foreground)" }}
          >
            {userName.split(" ").slice(-1)[0]?.[0]?.toUpperCase() ?? "U"}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate" style={{ color: "var(--sidebar-foreground)" }}>
              {userName}
            </p>
            <p className="text-xs truncate" style={{ color: "var(--sidebar-foreground)", opacity: 0.5 }}>
              {roleName.replace(/_/g, " ")}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}

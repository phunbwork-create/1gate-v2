import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { signOut } from "@/lib/auth";
import { AppSidebar } from "@/components/business/AppSidebar";
import { NotificationBell } from "@/components/business/NotificationBell";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut } from "lucide-react";
import type { SessionUser } from "@/types";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = session.user as SessionUser;
  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .slice(-2)
    .join("")
    .toUpperCase();

  return (
    <div className="flex min-h-screen">
      <AppSidebar
        roleName={user.roleName}
        companyName={user.companyCode}
        userName={user.name}
      />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-14 border-b bg-card flex items-center justify-end px-4 gap-2 shrink-0">
          <NotificationBell />

          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <button className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent transition-colors" />
              }
            >
              <Avatar className="h-7 w-7">
                <AvatarFallback className="text-xs">{initials}</AvatarFallback>
              </Avatar>
              <span className="hidden sm:inline">{user.name}</span>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel className="font-normal">
                <p className="text-sm font-medium">{user.name}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <form
                  action={async () => {
                    "use server";
                    await signOut({ redirectTo: "/login" });
                  }}
                  className="w-full"
                >
                  <button
                    type="submit"
                    className="flex items-center gap-2 w-full text-left"
                  >
                    <LogOut className="h-4 w-4" />
                    Đăng xuất
                  </button>
                </form>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}

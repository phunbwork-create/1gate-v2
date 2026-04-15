import type { RoleName } from "@/generated/prisma";
import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface User {
    id: string;
    roleName: RoleName;
    roleId: string;
    companyId: string;
    companyCode: string;
    departmentId: string | null;
  }

  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      roleName: RoleName;
      roleId: string;
      companyId: string;
      companyCode: string;
      departmentId: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    roleName: RoleName;
    roleId: string;
    companyId: string;
    companyCode: string;
    departmentId: string | null;
  }
}

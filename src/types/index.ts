import type { RoleName, NotificationType } from "@/generated/prisma";

export type { RoleName, NotificationType };

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  roleName: RoleName;
  roleId: string;
  companyId: string;
  companyCode: string;
  departmentId: string | null;
}

// Roles that CANNOT see contract/payment amounts
export const HIDDEN_PRICE_ROLES: RoleName[] = ["PURCHASER", "WAREHOUSE"];

// Roles that CAN approve
export const APPROVER_ROLES: RoleName[] = [
  "DEPT_HEAD",
  "ACCOUNTANT",
  "DIRECTOR",
  "ADMIN",
  "SUPER_ADMIN",
];

// Approval threshold constants (VND)
export const APPROVAL_THRESHOLD = {
  DEPT_HEAD_ONLY: 1_000_000,      // < 1M: chỉ DEPT_HEAD
  ACCOUNTANT_REQUIRED: 5_000_000, // 1M–5M: DEPT_HEAD + ACCOUNTANT
  // > 5M: DEPT_HEAD + ACCOUNTANT + DIRECTOR
} as const;

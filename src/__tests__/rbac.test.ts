/**
 * Tests: RBAC — Role-Based Access Control
 *
 * Strategy:
 * - Pure unit tests, no DB / no mocks needed
 * - Test approval threshold logic
 * - Test hidden price role logic
 * - Test approver role detection
 */

import {
  HIDDEN_PRICE_ROLES,
  APPROVER_ROLES,
  APPROVAL_THRESHOLD,
  type RoleName,
} from "@/types";

// ── Helper functions (mirrors real business logic) ────────────────────────────

function canSeePrice(roleName: RoleName): boolean {
  return !HIDDEN_PRICE_ROLES.includes(roleName);
}

function isApprover(roleName: RoleName): boolean {
  return APPROVER_ROLES.includes(roleName);
}

function getRequiredApprovers(amount: number): RoleName[] {
  if (amount < APPROVAL_THRESHOLD.DEPT_HEAD_ONLY) {
    return ["DEPT_HEAD"];
  }
  if (amount <= APPROVAL_THRESHOLD.ACCOUNTANT_REQUIRED) {
    return ["DEPT_HEAD", "ACCOUNTANT"];
  }
  return ["DEPT_HEAD", "ACCOUNTANT", "DIRECTOR"];
}

// ── Price Visibility Tests ────────────────────────────────────────────────────

describe("Price visibility by role", () => {
  it("PURCHASER cannot see price", () => {
    expect(canSeePrice("PURCHASER")).toBe(false);
  });

  it("WAREHOUSE cannot see price", () => {
    expect(canSeePrice("WAREHOUSE")).toBe(false);
  });

  it("ACCOUNTANT can see price", () => {
    expect(canSeePrice("ACCOUNTANT")).toBe(true);
  });

  it("DIRECTOR can see price", () => {
    expect(canSeePrice("DIRECTOR")).toBe(true);
  });

  it("DEPT_HEAD can see price", () => {
    expect(canSeePrice("DEPT_HEAD")).toBe(true);
  });

  it("ADMIN can see price", () => {
    expect(canSeePrice("ADMIN")).toBe(true);
  });

  it("EMPLOYEE can see price", () => {
    expect(canSeePrice("EMPLOYEE")).toBe(true);
  });
});

// ── Approver Role Tests ───────────────────────────────────────────────────────

describe("Approver role detection", () => {
  it("DEPT_HEAD is an approver", () => {
    expect(isApprover("DEPT_HEAD")).toBe(true);
  });

  it("ACCOUNTANT is an approver", () => {
    expect(isApprover("ACCOUNTANT")).toBe(true);
  });

  it("DIRECTOR is an approver", () => {
    expect(isApprover("DIRECTOR")).toBe(true);
  });

  it("EMPLOYEE is NOT an approver", () => {
    expect(isApprover("EMPLOYEE")).toBe(false);
  });

  it("PURCHASER is NOT an approver", () => {
    expect(isApprover("PURCHASER")).toBe(false);
  });

  it("WAREHOUSE is NOT an approver", () => {
    expect(isApprover("WAREHOUSE")).toBe(false);
  });
});

// ── Approval Threshold Tests ──────────────────────────────────────────────────

describe("Approval threshold logic", () => {
  it("Amount 500,000 VND → DEPT_HEAD only", () => {
    expect(getRequiredApprovers(500_000)).toEqual(["DEPT_HEAD"]);
  });

  it("Amount 999,999 VND → DEPT_HEAD only (boundary)", () => {
    expect(getRequiredApprovers(999_999)).toEqual(["DEPT_HEAD"]);
  });

  it("Amount 1,000,000 VND → DEPT_HEAD + ACCOUNTANT (boundary)", () => {
    expect(getRequiredApprovers(1_000_000)).toEqual([
      "DEPT_HEAD",
      "ACCOUNTANT",
    ]);
  });

  it("Amount 3,000,000 VND → DEPT_HEAD + ACCOUNTANT", () => {
    expect(getRequiredApprovers(3_000_000)).toEqual([
      "DEPT_HEAD",
      "ACCOUNTANT",
    ]);
  });

  it("Amount 5,000,000 VND → DEPT_HEAD + ACCOUNTANT (boundary)", () => {
    expect(getRequiredApprovers(5_000_000)).toEqual([
      "DEPT_HEAD",
      "ACCOUNTANT",
    ]);
  });

  it("Amount 5,000,001 VND → DEPT_HEAD + ACCOUNTANT + DIRECTOR", () => {
    expect(getRequiredApprovers(5_000_001)).toEqual([
      "DEPT_HEAD",
      "ACCOUNTANT",
      "DIRECTOR",
    ]);
  });

  it("Amount 100,000,000 VND → DEPT_HEAD + ACCOUNTANT + DIRECTOR", () => {
    expect(getRequiredApprovers(100_000_000)).toEqual([
      "DEPT_HEAD",
      "ACCOUNTANT",
      "DIRECTOR",
    ]);
  });
});

// ── Anti-Conflict of Interest ─────────────────────────────────────────────────

describe("Anti-conflict of interest rule", () => {
  function isConflictOfInterest(
    creatorId: string,
    approverId: string
  ): boolean {
    return creatorId === approverId;
  }

  it("same user cannot approve their own request", () => {
    expect(isConflictOfInterest("user-1", "user-1")).toBe(true);
  });

  it("different user can approve", () => {
    expect(isConflictOfInterest("user-1", "user-2")).toBe(false);
  });
});

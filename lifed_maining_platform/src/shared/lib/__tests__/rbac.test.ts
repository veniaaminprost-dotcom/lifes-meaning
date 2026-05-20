import { describe, expect, it } from "vitest";
import { hasRoleAccess } from "@/shared/lib/rbac";

describe("hasRoleAccess", () => {
  it("пропускает допустимую роль", () => {
    expect(hasRoleAccess("admin", ["admin", "teacher"])).toBe(true);
  });

  it("пропускает новую роль директора", () => {
    expect(hasRoleAccess("director", ["director"])).toBe(true);
  });

  it("блокирует недопустимую роль", () => {
    expect(hasRoleAccess("student", ["admin"])).toBe(false);
  });
});

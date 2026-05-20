import { describe, expect, it } from "vitest";
import { sessionReducer, setRole, setSession, signOutState } from "@/entities/auth/model/sessionSlice";

describe("sessionSlice", () => {
  it("должен сохранять сессию", () => {
    const state = sessionReducer(undefined, setSession({ user: { id: "u1" } } as any));
    expect(state.session?.user.id).toBe("u1");
    expect(state.initialized).toBe(true);
  });

  it("должен сбрасывать состояние при выходе", () => {
    const withData = sessionReducer(undefined, setRole("teacher"));
    const reset = sessionReducer(withData, signOutState());
    expect(reset.role).toBeNull();
    expect(reset.session).toBeNull();
    expect(reset.initialized).toBe(true);
  });
});

import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AuthForm } from "@/features/auth/ui/AuthForm";

afterEach(() => {
  cleanup();
});

describe("AuthForm", () => {
  it("рендерит форму входа", () => {
    const onSubmit = vi.fn();

    render(<AuthForm mode="login" onSubmit={onSubmit} />);

    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Пароль")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Войти" })).toBeInTheDocument();
  });

  it("отправляет форму входа без displayName", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);

    render(<AuthForm mode="login" onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText("Email"), "test@example.com");
    await user.type(screen.getByLabelText("Пароль"), "SchoolPass2026!");
    await user.click(screen.getByRole("button", { name: "Войти" }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit.mock.calls[0]?.[0]).toEqual({
      email: "test@example.com",
      password: "SchoolPass2026!",
      displayName: undefined,
      phone: undefined,
      gender: undefined,
      messengerType: undefined,
      messengerContact: undefined,
      religionRelation: undefined,
      christianBranch: undefined,
      christianConfession: undefined,
      religionOther: undefined
    });
  });
});

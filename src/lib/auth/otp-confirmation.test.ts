import { describe, expect, it } from "vitest";
import { resolveOtpConfirmation } from "./otp-confirmation";

describe("resolveOtpConfirmation", () => {
  it("aceita um token de magic link e mantém o destino interno", () => {
    const url = new URL(
      "https://lamelle-3d-painel.vercel.app/auth/confirm?token_hash=hash-seguro&type=magiclink&next=/dashboard",
    );
    expect(resolveOtpConfirmation(url)).toEqual({
      tokenHash: "hash-seguro",
      type: "magiclink",
      next: "/dashboard",
    });
  });

  it("impede redirecionamento para um site externo", () => {
    const url = new URL(
      "https://lamelle-3d-painel.vercel.app/auth/confirm?token_hash=hash-seguro&type=magiclink&next=https://malicioso.example",
    );
    expect(resolveOtpConfirmation(url)?.next).toBe("/dashboard");
  });
});

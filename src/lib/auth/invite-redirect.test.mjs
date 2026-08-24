import { describe, expect, it } from "vitest";
import { resolveInviteRedirect } from "../../../scripts/invite-redirect.mjs";

describe("resolveInviteRedirect", () => {
  it("usa o endereço explícito de produção mesmo durante o desenvolvimento local", () => {
    expect(
      resolveInviteRedirect({
        NEXT_PUBLIC_APP_URL: "http://localhost:3000",
        LAMELLE_INVITE_REDIRECT_URL: "https://lamelle-3d-painel.vercel.app",
      }),
    ).toBe("https://lamelle-3d-painel.vercel.app/auth/callback");
  });

  it("recusa criar convites apontando para localhost", () => {
    expect(() => resolveInviteRedirect({ NEXT_PUBLIC_APP_URL: "http://localhost:3000" })).toThrow(
      "LAMELLE_INVITE_REDIRECT_URL",
    );
  });
});

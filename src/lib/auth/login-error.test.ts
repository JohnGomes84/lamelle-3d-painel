import { describe, expect, it } from "vitest";
import { loginErrorMessage } from "./login-error";

describe("loginErrorMessage", () => {
  it("orienta a aguardar quando o provedor limita envios de e-mail", () => {
    expect(loginErrorMessage({ code: "over_email_send_rate_limit", status: 429 })).toBe(
      "Muitos links foram solicitados. Aguarde alguns minutos e use o último e-mail recebido.",
    );
  });

  it("mantém uma mensagem segura para erros desconhecidos", () => {
    expect(loginErrorMessage({ code: "unexpected", status: 500 })).toBe(
      "Não foi possível enviar o acesso. Tente novamente.",
    );
  });
});

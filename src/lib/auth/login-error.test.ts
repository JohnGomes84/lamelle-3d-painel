import { describe, expect, it } from "vitest";
import { loginErrorMessage, passwordErrorMessage } from "./login-error";

describe("loginErrorMessage", () => {
  it("orienta a aguardar quando o provedor limita envios de e-mail", () => {
    expect(loginErrorMessage({ code: "over_email_send_rate_limit", status: 429 })).toBe(
      "Muitos links foram solicitados. Aguarde alguns minutos e use o último e-mail recebido.",
    );
  });

  it("aponta o provedor desativado quando o Supabase recusa OTP", () => {
    expect(loginErrorMessage({ code: "otp_disabled", status: 422 })).toContain("desativado no Supabase");
    expect(loginErrorMessage({ code: "email_provider_disabled", status: 400 })).toContain("desativado no Supabase");
  });

  it("orienta o bootstrap quando o usuário ainda não existe", () => {
    expect(loginErrorMessage({ code: "signup_disabled", status: 422 })).toContain("bootstrap-users");
  });

  it("mantém uma mensagem segura para erros desconhecidos", () => {
    expect(loginErrorMessage({ code: "unexpected", status: 500 })).toBe(
      "Não foi possível enviar o acesso. Tente novamente.",
    );
  });
});

describe("passwordErrorMessage", () => {
  it("lembra do link por e-mail quando as credenciais são inválidas", () => {
    expect(passwordErrorMessage({ code: "invalid_credentials", status: 400 })).toContain("use o link por e-mail");
  });

  it("pede confirmação do convite quando o e-mail não foi confirmado", () => {
    expect(passwordErrorMessage({ code: "email_not_confirmed", status: 400 })).toContain("link de convite");
  });

  it("mantém uma mensagem segura para erros desconhecidos", () => {
    expect(passwordErrorMessage({ code: "unexpected", status: 500 })).toBe("E-mail ou senha incorretos.");
  });
});

import { describe, expect, it } from "vitest";
import { parseLoginCredentials, parseNewPassword } from "./credentials";

describe("credenciais", () => {
  it("normaliza o e-mail e preserva a senha no login", () => {
    expect(parseLoginCredentials(" John.Eug@Gmail.com ", "senha-segura")).toEqual({
      email: "john.eug@gmail.com",
      password: "senha-segura",
    });
  });

  it("rejeita senha de acesso vazia", () => {
    expect(parseLoginCredentials("john.eug@gmail.com", "")).toEqual({
      error: "Informe sua senha.",
    });
  });

  it("aceita uma nova senha confirmada com pelo menos oito caracteres", () => {
    expect(parseNewPassword("nova-senha", "nova-senha")).toEqual({ password: "nova-senha" });
  });

  it("rejeita confirmação diferente", () => {
    expect(parseNewPassword("nova-senha", "outra-senha")).toEqual({
      error: "As senhas não coincidem.",
    });
  });
});

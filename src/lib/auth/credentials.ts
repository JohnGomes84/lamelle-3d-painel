import { z } from "zod";

const Email = z.string().trim().toLowerCase().email("Informe um e-mail válido.");

export function parseLoginCredentials(emailInput: unknown, passwordInput: unknown) {
  const email = Email.safeParse(emailInput);
  if (!email.success) return { error: email.error.issues[0].message };
  const password = typeof passwordInput === "string" ? passwordInput : "";
  if (!password) return { error: "Informe sua senha." };
  return { email: email.data, password };
}

export function parseNewPassword(passwordInput: unknown, confirmationInput: unknown) {
  const password = typeof passwordInput === "string" ? passwordInput : "";
  const confirmation = typeof confirmationInput === "string" ? confirmationInput : "";
  if (password.length < 8) return { error: "Use uma senha com pelo menos 8 caracteres." };
  if (password !== confirmation) return { error: "As senhas não coincidem." };
  return { password };
}

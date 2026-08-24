export function resolveInviteRedirect(env) {
  const baseUrl = env.LAMELLE_INVITE_REDIRECT_URL;
  if (!baseUrl) {
    throw new Error("Defina LAMELLE_INVITE_REDIRECT_URL com o endereço publicado antes de enviar convites.");
  }
  const url = new URL(baseUrl);
  if (url.hostname === "localhost" || url.hostname === "127.0.0.1") {
    throw new Error("LAMELLE_INVITE_REDIRECT_URL não pode apontar para localhost.");
  }
  return new URL("/auth/callback", url).toString();
}

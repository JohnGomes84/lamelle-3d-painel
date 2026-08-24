type AuthErrorLike = { code?: string; status?: number };

export function loginErrorMessage(_error: AuthErrorLike): string {
  if (_error.code === "over_email_send_rate_limit" || _error.status === 429) {
    return "Muitos links foram solicitados. Aguarde alguns minutos e use o último e-mail recebido.";
  }
  return "Não foi possível enviar o acesso. Tente novamente.";
}

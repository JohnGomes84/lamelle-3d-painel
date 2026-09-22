type AuthErrorLike = { code?: string; status?: number; message?: string };

const SEND_FALLBACK = "Não foi possível enviar o acesso. Tente novamente.";
const PASSWORD_FALLBACK = "E-mail ou senha incorretos.";

export function loginErrorMessage(_error: AuthErrorLike): string {
  if (_error.code === "over_email_send_rate_limit" || _error.status === 429) {
    return "Muitos links foram solicitados. Aguarde alguns minutos e use o último e-mail recebido.";
  }
  if (_error.code === "otp_disabled" || _error.code === "email_provider_disabled") {
    return "O login por link está desativado no Supabase. Ative o provedor de e-mail e o envio de OTP em Authentication → Providers.";
  }
  if (_error.code === "signup_disabled") {
    return "Este e-mail ainda não tem conta criada. Execute pnpm db:bootstrap-users e depois peça o link.";
  }
  return SEND_FALLBACK;
}

export function passwordErrorMessage(_error: AuthErrorLike): string {
  if (_error.code === "email_not_confirmed") {
    return "Confirme seu e-mail pelo link de convite antes de entrar com senha.";
  }
  if (_error.code === "invalid_credentials" || _error.status === 400) {
    return "E-mail ou senha incorretos. Se ainda não criou uma senha, use o link por e-mail abaixo.";
  }
  return PASSWORD_FALLBACK;
}

export function describeAuthError(_error: AuthErrorLike) {
  return { code: _error.code, status: _error.status, message: _error.message };
}

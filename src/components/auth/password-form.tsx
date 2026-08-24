"use client";

import { useActionState } from "react";
import { updatePassword, type PasswordState } from "@/app/(protected)/settings/actions";

const initialState: PasswordState = {};

export function PasswordForm() {
  const [state, action, pending] = useActionState(updatePassword, initialState);
  return <form action={action} className="backup-form">
    <label htmlFor="new-password">Nova senha</label>
    <input id="new-password" name="password" type="password" minLength={8} autoComplete="new-password" required />
    <label htmlFor="confirm-password">Confirmar nova senha</label>
    <input id="confirm-password" name="confirmation" type="password" minLength={8} autoComplete="new-password" required />
    <button disabled={pending}>{pending ? "Salvando…" : "Criar ou alterar senha"}</button>
    {state.error && <p className="form-error">{state.error}</p>}
    {state.success && <p className="form-success">{state.success}</p>}
  </form>;
}

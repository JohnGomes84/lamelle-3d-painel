import Link from "next/link";
import { PasswordForm } from "@/components/auth/password-form";
import { importLegacyBackup } from "./actions";

export default function Page() {
  const areas = ["products", "inventory", "clients", "orders", "production", "content", "partners", "finance"];
  return <>
    <section className="page-heading">
      <span className="eyebrow">Administração</span>
      <h1>Ajustes & backup</h1>
      <p>Equipe, parâmetros, importação e segurança dos dados.</p>
    </section>
    <div className="settings-grid">
      <article className="panel">
        <h2>Senha de acesso</h2>
        <p className="muted">Crie ou altere sua senha para entrar normalmente em qualquer computador. A senha não é exibida nem armazenada pelo painel.</p>
        <PasswordForm />
      </article>
      <article className="panel">
        <h2>Importar painel offline</h2>
        <p className="muted">Use o JSON exportado pelo arquivo HTML. A importação exige a conta do proprietário e registra auditoria.</p>
        <form action={importLegacyBackup} className="backup-form">
          <input type="file" name="backup" accept="application/json,.json" required />
          <button>Importar backup</button>
        </form>
      </article>
      <article className="panel">
        <h2>Exportações</h2>
        <p className="muted">O backup completo não inclui senhas ou segredos de autenticação.</p>
        <div className="export-links">
          <Link href="/api/export/backup">Baixar backup JSON</Link>
          {areas.map((area) => <Link href={`/api/export/${area}`} key={area}>CSV · {area}</Link>)}
        </div>
      </article>
      <article className="panel">
        <h2>Acesso inicial</h2>
        <p><b>Proprietário:</b> {process.env.LAMELLE_OWNER_EMAIL || "Definir no ambiente"}</p>
        <p><b>Sócia:</b> {process.env.LAMELLE_PARTNER_EMAIL || "Definir no ambiente"}</p>
        <p className="muted">Outros e-mails permanecem bloqueados nesta fase.</p>
      </article>
    </div>
  </>;
}

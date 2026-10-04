import { PROJECT_STATUSES, formatMinutes } from "@/lib/domain/projects";

export type ProjectRow = {
  id: string; slug: string; name: string; line: string | null; status: string; version: string | null;
  summary: string | null; next_step: string | null; client: string | null;
  plates: { name: string; minutes: number; grams: number; file?: string }[] | null;
  print_minutes: number | string; grams: number | string; unit_cost: number | string | null; price: number | string | null;
  files: Record<string, number> | null; folder: string | null; source_updated_at: string | null; synced_at: string;
};

const brl = (v: unknown) => (v === null || v === undefined || v === "" ? "—" : Number(v).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }));
const date = (v: string | null) => (v ? new Date(v).toLocaleDateString("pt-BR") : "—");
const g = (v: unknown) => `${Number(v || 0).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} g`;

export function ProjectsView({ rows, missingTable = false }: { rows: ProjectRow[]; missingTable?: boolean }) {
  const lastSync = rows.reduce<string | null>((a, r) => (!a || r.synced_at > a ? r.synced_at : a), null);
  const groups = PROJECT_STATUSES.map((s) => ({ status: s, items: rows.filter((r) => r.status === s) })).filter((x) => x.items.length);
  return <>
    <section className="page-heading">
      <span className="eyebrow">Pasta Projetos3D</span>
      <h1>Projetos de impressão</h1>
      <p>O que está em desenvolvimento, em teste ou pronto para vender — com placas, tempo, filamento, custo e preço. Atualizado pelo computador do ateliê.</p>
      <p className="muted project-sync">{lastSync ? `Última sincronização: ${new Date(lastSync).toLocaleString("pt-BR")}` : "Ainda não sincronizado."}</p>
    </section>
    {missingTable ? <div className="empty-panel"><b>Módulo de projetos ainda não ativado.</b><span>A tabela de projetos será criada na próxima publicação do painel.</span></div>
      : !rows.length ? <div className="empty-panel"><b>Nenhum projeto sincronizado.</b><span>No computador, rode “Sincronizar painel” na pasta Projetos3D.</span></div>
      : <section className="project-summary" aria-label="Projetos por status">{groups.map((x) => <a href={`#st-${x.status}`} key={x.status} className="kpi-card"><strong>{x.items.length}</strong><span>{x.status}</span></a>)}</section>}
    {groups.map((grp) => <section key={grp.status} id={`st-${grp.status}`} className="project-group">
      <h2>{grp.status}</h2>
      <div className="project-grid">{grp.items.map((p) => <article className="panel project-card" key={p.id}>
        <header>
          <span className="eyebrow">{[p.line, p.client].filter(Boolean).join(" · ") || "Lamelle 3D"}</span>
          <h3>{p.name}{p.version ? <small> {p.version}</small> : null}</h3>
        </header>
        {p.summary ? <p className="muted">{p.summary}</p> : null}
        {p.next_step ? <p className="project-next"><span className="eyebrow">Próximo passo</span>{p.next_step}</p> : null}
        {p.plates?.length ? <table className="mini-table"><tbody>{p.plates.map((pl, i) => <tr key={i}><td>{pl.name}</td><td>{formatMinutes(pl.minutes)}</td><td>{g(pl.grams)}</td></tr>)}
          {p.plates.length > 1 ? <tr className="total"><td>Total</td><td>{formatMinutes(Number(p.print_minutes))}</td><td>{g(p.grams)}</td></tr> : null}</tbody></table> : null}
        <dl className="project-facts">
          <div><dt>Custo</dt><dd>{brl(p.unit_cost)}</dd></div>
          <div><dt>Preço</dt><dd>{brl(p.price)}</dd></div>
          <div><dt>Arquivos</dt><dd>{Object.entries(p.files || {}).filter(([, n]) => n).map(([k, n]) => `${n} ${k}`).join(" · ") || "—"}</dd></div>
          <div><dt>Alterado</dt><dd>{date(p.source_updated_at)}</dd></div>
        </dl>
        {p.folder ? <p className="project-folder" title={p.folder}>{p.folder}</p> : null}
      </article>)}</div>
    </section>)}
  </>;
}

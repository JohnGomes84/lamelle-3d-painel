import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AppShell } from "@/components/app-shell";

describe("AppShell", () => {
  it("exibe a identidade Lamelle, navegação e conteúdo principal", () => {
    render(<AppShell userName="Joana"><p>Resumo mensal</p></AppShell>);
    expect(screen.getByRole("banner")).toHaveTextContent("Lamelle 3D");
    expect(screen.getByRole("navigation", { name: /principal/i })).toBeInTheDocument();
    expect(screen.getByRole("main")).toHaveTextContent("Resumo mensal");
    expect(screen.getByText(/Joana/)).toBeInTheDocument();
  });
});

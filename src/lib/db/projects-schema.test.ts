import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { PROJECTS_MIGRATION_SQL } from "./projects-schema";

describe("migração de projetos embutida", () => {
  it("é idêntica ao arquivo da migração 0003", () => {
    expect(PROJECTS_MIGRATION_SQL).toBe(readFileSync("supabase/migrations/0003_projects.sql", "utf8"));
  });
});

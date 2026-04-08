import * as rl from "readline-sync";
import { v4 as uuidv4 } from "uuid";
import { eq } from "drizzle-orm";
import { db } from "../db/connection";
import { regiao, cidade, uf } from "../db/schema";

function listarRegioes() {
  const regioes = db
    .select({
      id: regiao.id,
      nome: regiao.nome,
      cidade_nome: cidade.nome,
      uf_sigla: uf.sigla,
    })
    .from(regiao)
    .leftJoin(cidade, eq(regiao.cidade_id, cidade.id))
    .leftJoin(uf, eq(cidade.uf_id, uf.id))
    .all();

  if (regioes.length === 0) {
    console.log("\n  Nenhuma região cadastrada.\n");
    return;
  }

  console.log("\n  Listagem: UF - Cidade - Região");
  console.log("  ─────────────────────────────────────────");
  for (const r of regioes) {
    console.log(
      `  ${r.uf_sigla ?? "??"} - ${r.cidade_nome ?? "??"} - ${r.nome}`
    );
  }
  console.log("  ─────────────────────────────────────────\n");
}

function listarRegioesDetalhado() {
  const regioes = db
    .select({
      id: regiao.id,
      nome: regiao.nome,
      cidade_nome: cidade.nome,
      uf_sigla: uf.sigla,
    })
    .from(regiao)
    .leftJoin(cidade, eq(regiao.cidade_id, cidade.id))
    .leftJoin(uf, eq(cidade.uf_id, uf.id))
    .all();

  if (regioes.length === 0) {
    console.log("\n  Nenhuma região cadastrada.\n");
    return;
  }

  console.log(
    "\n  ┌──────────────────────────────────────────────────────────────────────────┐"
  );
  console.log(
    "  │ ID                                   │ Região               │ Cidade / UF  │"
  );
  console.log(
    "  ├──────────────────────────────────────────────────────────────────────────┤"
  );
  for (const r of regioes) {
    const local = `${r.cidade_nome ?? "?"} / ${r.uf_sigla ?? "?"}`;
    console.log(`  │ ${r.id} │ ${r.nome.padEnd(20)} │ ${local.padEnd(12)} │`);
  }
  console.log(
    "  └──────────────────────────────────────────────────────────────────────────┘\n"
  );
}

function selecionarCidade(): string | null {
  const cidades = db
    .select({ id: cidade.id, nome: cidade.nome, uf_sigla: uf.sigla })
    .from(cidade)
    .leftJoin(uf, eq(cidade.uf_id, uf.id))
    .all();

  if (cidades.length === 0) {
    console.log(
      "  ✗ Nenhuma cidade cadastrada. Cadastre uma cidade primeiro.\n"
    );
    return null;
  }

  console.log("\n  Cidades disponíveis:");
  cidades.forEach((c, i) =>
    console.log(`  ${i + 1}. ${c.uf_sigla} - ${c.nome}`)
  );

  const idx = rl.questionInt("  Escolha o número da cidade: ") - 1;
  if (idx < 0 || idx >= cidades.length) {
    console.log("  ✗ Opção inválida.\n");
    return null;
  }
  return cidades[idx].id;
}

function criarRegiao() {
  console.log("\n  ── Cadastrar Região ──");
  const nome = rl.question("  Nome: ").trim();
  if (!nome) {
    console.log("  ✗ Nome é obrigatório.\n");
    return;
  }

  const cidade_id = selecionarCidade();
  if (!cidade_id) return;

  try {
    db.insert(regiao).values({ id: uuidv4(), nome, cidade_id }).run();
    console.log(`  ✓ Região "${nome}" criada com sucesso!\n`);
  } catch (err: any) {
    console.log(`  ✗ Erro: ${err.message}\n`);
  }
}

function editarRegiao() {
  console.log("\n  ── Editar Região ──");
  listarRegioesDetalhado();
  const id = rl.question("  ID da região a editar: ").trim();
  const existente = db.select().from(regiao).where(eq(regiao.id, id)).get();

  if (!existente) {
    console.log("  ✗ Região não encontrada.\n");
    return;
  }

  const nome =
    rl.question(`  Novo nome [${existente.nome}]: `).trim() || existente.nome;
  const mudarCidade = rl
    .question("  Deseja alterar a cidade? (s/N): ")
    .trim()
    .toLowerCase();

  let cidade_id = existente.cidade_id;
  if (mudarCidade === "s") {
    const novaCidade = selecionarCidade();
    if (novaCidade) cidade_id = novaCidade;
  }

  try {
    db.update(regiao).set({ nome, cidade_id }).where(eq(regiao.id, id)).run();
    console.log(`  ✓ Região "${nome}" atualizada!\n`);
  } catch (err: any) {
    console.log(`  ✗ Erro: ${err.message}\n`);
  }
}

function excluirRegiao() {
  console.log("\n  ── Excluir Região ──");
  listarRegioesDetalhado();
  const id = rl.question("  ID da região a excluir: ").trim();
  const existente = db.select().from(regiao).where(eq(regiao.id, id)).get();

  if (!existente) {
    console.log("  ✗ Região não encontrada.\n");
    return;
  }

  const confirma = rl
    .question(`  Confirmar exclusão de "${existente.nome}"? (s/N): `)
    .trim()
    .toLowerCase();
  if (confirma !== "s") {
    console.log("  Operação cancelada.\n");
    return;
  }

  try {
    db.delete(regiao).where(eq(regiao.id, id)).run();
    console.log(`  ✓ Região "${existente.nome}" excluída.\n`);
  } catch (err: any) {
    console.log(`  ✗ Erro: ${err.message}\n`);
  }
}

export function menuRegiao() {
  while (true) {
    console.log("  ╔════════════════════════════╗");
    console.log("  ║      MENU - REGIÃO         ║");
    console.log("  ╠════════════════════════════╣");
    console.log("  ║  1. Listar Regiões         ║");
    console.log("  ║  2. Cadastrar Região       ║");
    console.log("  ║  3. Editar Região          ║");
    console.log("  ║  4. Excluir Região         ║");
    console.log("  ║  0. Voltar                 ║");
    console.log("  ╚════════════════════════════╝");

    const opcao = rl.question("  Opção: ").trim();

    switch (opcao) {
      case "1":
        listarRegioes();
        break;
      case "2":
        criarRegiao();
        break;
      case "3":
        editarRegiao();
        break;
      case "4":
        excluirRegiao();
        break;
      case "0":
        return;
      default:
        console.log("  ✗ Opção inválida.\n");
    }
  }
}

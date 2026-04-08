import * as rl from "readline-sync";
import { v4 as uuidv4 } from "uuid";
import { eq } from "drizzle-orm";
import { db } from "../db/connection";
import { cidade, uf } from "../db/schema";

function listarCidades() {
  const cidades = db
    .select({
      id: cidade.id,
      nome: cidade.nome,
      uf_nome: uf.nome,
      uf_sigla: uf.sigla,
    })
    .from(cidade)
    .leftJoin(uf, eq(cidade.uf_id, uf.id))
    .all();

  if (cidades.length === 0) {
    console.log("\n  Nenhuma cidade cadastrada.\n");
    return;
  }

  console.log(
    "\n  ┌────────────────────────────────────────────────────────────────────────────┐"
  );
  console.log(
    "  │ ID                                   │ Nome                 │ UF           │"
  );
  console.log(
    "  ├────────────────────────────────────────────────────────────────────────────┤"
  );
  for (const c of cidades) {
    const ufLabel = c.uf_sigla ? `${c.uf_sigla} - ${c.uf_nome}` : "N/A";
    console.log(`  │ ${c.id} │ ${c.nome.padEnd(20)} │ ${ufLabel.padEnd(12)} │`);
  }
  console.log(
    "  └────────────────────────────────────────────────────────────────────────────┘\n"
  );
}

function selecionarUf(): string | null {
  const ufs = db.select().from(uf).all();
  if (ufs.length === 0) {
    console.log("  ✗ Nenhuma UF cadastrada. Cadastre uma UF primeiro.\n");
    return null;
  }

  console.log("\n  UFs disponíveis:");
  ufs.forEach((u, i) => console.log(`  ${i + 1}. ${u.sigla} - ${u.nome}`));

  const idx = rl.questionInt("  Escolha o número da UF: ") - 1;
  if (idx < 0 || idx >= ufs.length) {
    console.log("  ✗ Opção inválida.\n");
    return null;
  }
  return ufs[idx].id;
}

function criarCidade() {
  console.log("\n  ── Cadastrar Cidade ──");
  const nome = rl.question("  Nome: ").trim();
  if (!nome) {
    console.log("  ✗ Nome é obrigatório.\n");
    return;
  }

  const uf_id = selecionarUf();
  if (!uf_id) return;

  try {
    db.insert(cidade).values({ id: uuidv4(), nome, uf_id }).run();
    console.log(`  ✓ Cidade "${nome}" criada com sucesso!\n`);
  } catch (err: any) {
    console.log(`  ✗ Erro: ${err.message}\n`);
  }
}

function editarCidade() {
  console.log("\n  ── Editar Cidade ──");
  listarCidades();
  const id = rl.question("  ID da cidade a editar: ").trim();
  const existente = db.select().from(cidade).where(eq(cidade.id, id)).get();

  if (!existente) {
    console.log("  ✗ Cidade não encontrada.\n");
    return;
  }

  const nome =
    rl.question(`  Novo nome [${existente.nome}]: `).trim() || existente.nome;
  console.log("  Selecionar nova UF (Enter para manter):");
  const mudarUf = rl
    .question("  Deseja alterar a UF? (s/N): ")
    .trim()
    .toLowerCase();

  let uf_id = existente.uf_id;
  if (mudarUf === "s") {
    const novaUf = selecionarUf();
    if (novaUf) uf_id = novaUf;
  }

  try {
    db.update(cidade).set({ nome, uf_id }).where(eq(cidade.id, id)).run();
    console.log(`  ✓ Cidade "${nome}" atualizada!\n`);
  } catch (err: any) {
    console.log(`  ✗ Erro: ${err.message}\n`);
  }
}

function excluirCidade() {
  console.log("\n  ── Excluir Cidade ──");
  listarCidades();
  const id = rl.question("  ID da cidade a excluir: ").trim();
  const existente = db.select().from(cidade).where(eq(cidade.id, id)).get();

  if (!existente) {
    console.log("  ✗ Cidade não encontrada.\n");
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
    db.delete(cidade).where(eq(cidade.id, id)).run();
    console.log(`  ✓ Cidade "${existente.nome}" excluída.\n`);
  } catch (err: any) {
    if (err.message?.includes("FOREIGN KEY")) {
      console.log(
        "  ✗ Não é possível excluir: existem regiões vinculadas a esta cidade.\n"
      );
    } else {
      console.log(`  ✗ Erro: ${err.message}\n`);
    }
  }
}

export function menuCidade() {
  while (true) {
    console.log("  ╔════════════════════════════╗");
    console.log("  ║      MENU - CIDADE         ║");
    console.log("  ╠════════════════════════════╣");
    console.log("  ║  1. Listar Cidades         ║");
    console.log("  ║  2. Cadastrar Cidade       ║");
    console.log("  ║  3. Editar Cidade          ║");
    console.log("  ║  4. Excluir Cidade         ║");
    console.log("  ║  0. Voltar                 ║");
    console.log("  ╚════════════════════════════╝");

    const opcao = rl.question("  Opção: ").trim();

    switch (opcao) {
      case "1":
        listarCidades();
        break;
      case "2":
        criarCidade();
        break;
      case "3":
        editarCidade();
        break;
      case "4":
        excluirCidade();
        break;
      case "0":
        return;
      default:
        console.log("  ✗ Opção inválida.\n");
    }
  }
}

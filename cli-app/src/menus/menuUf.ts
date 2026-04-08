import * as rl from "readline-sync";
import { v4 as uuidv4 } from "uuid";
import { eq } from "drizzle-orm";
import { db } from "../db/connection";
import { uf } from "../db/schema";

function listarUfs() {
  const ufs = db.select().from(uf).all();
  if (ufs.length === 0) {
    console.log("\n  Nenhuma UF cadastrada.\n");
    return;
  }
  console.log(
    "\n  ┌─────────────────────────────────────────────────────────────────┐"
  );
  console.log(
    "  │  ID                                   │ Nome                 │ Sigla │"
  );
  console.log(
    "  ├─────────────────────────────────────────────────────────────────┤"
  );
  for (const u of ufs) {
    console.log(`  │ ${u.id} │ ${u.nome.padEnd(20)} │ ${u.sigla.padEnd(5)} │`);
  }
  console.log(
    "  └─────────────────────────────────────────────────────────────────┘\n"
  );
}

function criarUf() {
  console.log("\n  ── Cadastrar UF ──");
  const nome = rl.question("  Nome: ").trim();
  const sigla = rl.question("  Sigla: ").trim().toUpperCase();

  if (!nome || !sigla) {
    console.log("  ✗ Nome e sigla são obrigatórios.\n");
    return;
  }

  try {
    db.insert(uf).values({ id: uuidv4(), nome, sigla }).run();
    console.log(`  ✓ UF "${nome} (${sigla})" criada com sucesso!\n`);
  } catch (err: any) {
    if (err.message?.includes("UNIQUE")) {
      console.log(`  ✗ Sigla "${sigla}" já cadastrada.\n`);
    } else {
      console.log(`  ✗ Erro: ${err.message}\n`);
    }
  }
}

function editarUf() {
  console.log("\n  ── Editar UF ──");
  listarUfs();
  const id = rl.question("  ID da UF a editar: ").trim();
  const existente = db.select().from(uf).where(eq(uf.id, id)).get();

  if (!existente) {
    console.log("  ✗ UF não encontrada.\n");
    return;
  }

  const nome =
    rl.question(`  Novo nome [${existente.nome}]: `).trim() || existente.nome;
  const sigla = (
    rl.question(`  Nova sigla [${existente.sigla}]: `).trim() || existente.sigla
  ).toUpperCase();

  try {
    db.update(uf).set({ nome, sigla }).where(eq(uf.id, id)).run();
    console.log(`  ✓ UF atualizada para "${nome} (${sigla})"!\n`);
  } catch (err: any) {
    console.log(`  ✗ Erro: ${err.message}\n`);
  }
}

function excluirUf() {
  console.log("\n  ── Excluir UF ──");
  listarUfs();
  const id = rl.question("  ID da UF a excluir: ").trim();
  const existente = db.select().from(uf).where(eq(uf.id, id)).get();

  if (!existente) {
    console.log("  ✗ UF não encontrada.\n");
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
    db.delete(uf).where(eq(uf.id, id)).run();
    console.log(`  ✓ UF "${existente.nome}" excluída.\n`);
  } catch (err: any) {
    if (err.message?.includes("FOREIGN KEY")) {
      console.log(
        "  ✗ Não é possível excluir: existem cidades vinculadas a esta UF.\n"
      );
    } else {
      console.log(`  ✗ Erro: ${err.message}\n`);
    }
  }
}

export function menuUf() {
  while (true) {
    console.log("  ╔════════════════════════════╗");
    console.log("  ║        MENU - UF           ║");
    console.log("  ╠════════════════════════════╣");
    console.log("  ║  1. Listar UFs             ║");
    console.log("  ║  2. Cadastrar UF           ║");
    console.log("  ║  3. Editar UF              ║");
    console.log("  ║  4. Excluir UF             ║");
    console.log("  ║  0. Voltar                 ║");
    console.log("  ╚════════════════════════════╝");

    const opcao = rl.question("  Opção: ").trim();

    switch (opcao) {
      case "1":
        listarUfs();
        break;
      case "2":
        criarUf();
        break;
      case "3":
        editarUf();
        break;
      case "4":
        excluirUf();
        break;
      case "0":
        return;
      default:
        console.log("  ✗ Opção inválida.\n");
    }
  }
}

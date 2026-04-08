import * as rl from "readline-sync";
import { initializeDatabase } from "./db/connection";
import { menuUf } from "./menus/menuUf";
import { menuCidade } from "./menus/menuCidade";
import { menuRegiao } from "./menus/menuRegiao";
import fs from "fs";
import path from "path";

// Ensure data directory exists
const dataDir = path.join(__dirname, "../data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize DB tables
initializeDatabase();

function printHeader() {
  console.clear();
  console.log("");
  console.log("  ╔══════════════════════════════════════╗");
  console.log("  ║     🌎  SISTEMA GEO - CLI CRUD        ║");
  console.log("  ║         UF | Cidade | Região          ║");
  console.log("  ╚══════════════════════════════════════╝");
  console.log("");
}

function main() {
  printHeader();

  while (true) {
    console.log("  ╔════════════════════════════╗");
    console.log("  ║       MENU PRINCIPAL       ║");
    console.log("  ╠════════════════════════════╣");
    console.log("  ║  1. Gerenciar UFs          ║");
    console.log("  ║  2. Gerenciar Cidades      ║");
    console.log("  ║  3. Gerenciar Regiões      ║");
    console.log("  ║  0. Sair                   ║");
    console.log("  ╚════════════════════════════╝");

    const opcao = rl.question("  Opção: ").trim();

    switch (opcao) {
      case "1":
        console.clear();
        printHeader();
        menuUf();
        console.clear();
        printHeader();
        break;
      case "2":
        console.clear();
        printHeader();
        menuCidade();
        console.clear();
        printHeader();
        break;
      case "3":
        console.clear();
        printHeader();
        menuRegiao();
        console.clear();
        printHeader();
        break;
      case "0":
        console.log("\n  Até logo! 👋\n");
        process.exit(0);
      default:
        console.log("  ✗ Opção inválida.\n");
    }
  }
}

main();

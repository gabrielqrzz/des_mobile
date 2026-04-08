# 🌎 Sistema GEO - CLI CRUD com TypeScript + Drizzle ORM

Aplicação CLI minimalista em TypeScript com persistência via SQLite e ORM Drizzle.

## Entidades

- **uf** — id (uuid), nome, sigla
- **cidade** — id (uuid), nome, uf_id
- **regiao** — id (uuid), nome, cidade_id

## Exemplo de listagem

```
SP - São Paulo - Praça da Sé
DF - Brasília - Asa Norte
DF - Brasília - Esplanada
```

## Pré-requisitos

- Node.js >= 18
- npm

## Instalação

```bash
npm install
```

## Executar

```bash
npm start
```

O banco de dados SQLite será criado automaticamente em `data/geo.db`.

## Funcionalidades

### Menu Principal
- **1** → Gerenciar UFs
- **2** → Gerenciar Cidades
- **3** → Gerenciar Regiões
- **0** → Sair

### Cada submenu possui CRUD completo:
- Listar (com JOIN para exibir relacionamentos)
- Cadastrar (com validação de campos obrigatórios)
- Editar (mantém valor atual se Enter pressionado)
- Excluir (com confirmação e checagem de FK)

## Tecnologias

| Ferramenta | Uso |
|---|---|
| TypeScript | Linguagem principal |
| Drizzle ORM | Schema e queries |
| better-sqlite3 | Driver SQLite |
| readline-sync | Interação CLI |
| uuid | Geração de IDs |

## Estrutura

```
src/
├── index.ts           # Ponto de entrada + menu principal
├── db/
│   ├── schema.ts      # Definição das tabelas (Drizzle)
│   └── connection.ts  # Conexão SQLite + initializeDatabase()
└── menus/
    ├── menuUf.ts      # CRUD completo de UF
    ├── menuCidade.ts  # CRUD completo de Cidade
    └── menuRegiao.ts  # CRUD completo de Região
data/
└── geo.db             # Banco SQLite (criado automaticamente)
```

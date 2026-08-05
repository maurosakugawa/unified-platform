# Plataforma Unificada

Aplicação full stack para planejamento pessoal, reunindo autenticação, dashboard, eventos, calendário, contatos e clima em uma única interface.

## Funcionalidades

- autenticação por sessão;
- dashboard com próximos eventos e clima;
- CRUD de eventos;
- calendário mensal;
- associação de participantes aos eventos;
- CRUD de contatos;
- clima atual e previsão de cinco dias;
- previsão meteorológica associada ao horário do evento;
- temas claro e escuro;
- layout responsivo.

## Arquitetura

```text
React + TypeScript + Vite
          │
          │ desenvolvimento
          ▼
Express :3101
├── /auth
├── /api/contacts
├── /api/events
├── /api/weather
└── PGlite
```

Em produção, o Express também serve o build React:

```text
Express
├── API
├── arquivos de dist/assets
└── fallback da SPA para /, /calendar, /events e /weather
```

A chave da OpenWeather permanece exclusivamente no backend. Clima atual e previsão possuem cache compartilhado de 30 minutos por cidade.

## Requisitos

- Node.js 20 ou superior;
- npm;
- chave da OpenWeather para consultas reais.

## Instalação

```bash
git clone git@github.com:maurosakugawa/unified-platform.git
cd unified-platform

npm ci
npm --prefix back ci
```

Crie os arquivos locais de ambiente:

```bash
cp .env.example .env
cp back/.env.example back/.env
```

Edite `back/.env` e informe pelo menos:

```env
SESSION_SECRET=uma-chave-longa-e-aleatoria
OPENWEATHER_API_KEY=sua-chave-real
```

Os arquivos `.env` e `back/.env` são ignorados pelo Git.

## Desenvolvimento

Subir frontend e backend juntos:

```bash
npm run dev:all
```

Ou em terminais separados:

```bash
npm run dev:front
npm run dev:back
```

Endereços locais:

```text
Frontend: http://localhost:3000
Backend:  http://localhost:3101
Health:   http://localhost:3101/health
```

## Build

```bash
npm run build
```

O comando:

1. valida o TypeScript;
2. gera `dist`;
3. confirma a existência dos assets;
4. rejeita `localhost:3101` no bundle de produção;
5. rejeita chamadas diretas à OpenWeather;
6. rejeita referências à antiga `VITE_OPENWEATHER_API_KEY`.

`VITE_API_BASE_URL` fica vazio em `.env.production`, fazendo o frontend usar a mesma origem do backend.

## Produção

Gere o build:

```bash
npm run build
```

Inicie o Express servindo API e SPA:

```bash
npm start
```

Em produção com HTTPS, configure:

```env
NODE_ENV=production
COOKIE_SECURE=true
SESSION_SECRET=uma-chave-forte
OPENWEATHER_API_KEY=sua-chave
PGDATA_PATH=/caminho/persistente/pgdata
```

Para testar localmente a execução de produção por HTTP:

```bash
COOKIE_SECURE=false npm start
```

Abra:

```text
http://localhost:3101
```

## Variáveis do frontend

### `.env`

Usado durante o desenvolvimento separado:

```env
VITE_API_BASE_URL=http://localhost:3101
```

### `.env.production`

Mantém a API na mesma origem:

```env
VITE_API_BASE_URL=
```

## Variáveis do backend

```env
NODE_ENV=development
PORT=3101
SESSION_SECRET=troque-esta-chave
FRONTEND_ORIGIN=http://localhost:3000
COOKIE_SECURE=false
TRUST_PROXY=1
PGDATA_PATH=./pgdata
OPENWEATHER_API_KEY=sua-chave
```

`FRONTEND_ORIGIN` aceita valores separados por vírgula. Em produção na mesma origem, pode ficar vazio.

`OPENWEATHER_BASE_URL` existe apenas para testes e integrações. Sem configuração, a API oficial é utilizada.

## Banco PGlite

O banco padrão fica em:

```text
back/pgdata
```

Também pode ser direcionado por:

```env
PGDATA_PATH=/diretorio/persistente/pgdata
```

Recomendações:

- usar apenas uma instância escrevendo no mesmo diretório;
- manter o diretório fora de áreas apagadas durante deploy;
- criar backup periódico;
- não versionar o banco no Git.

## Testes

Testes unitários e de API do backend, com banco temporário:

```bash
npm run test:back
```

Teste E2E completo:

```bash
npm run test:e2e
```

O E2E:

- gera e valida o build;
- inicia o servidor em modo produção;
- cria um banco PGlite temporário;
- inicia uma OpenWeather simulada localmente;
- registra e autentica um usuário;
- cria contato;
- cria evento;
- associa participante;
- consulta clima;
- confirma compartilhamento do cache;
- valida rotas diretas da SPA;
- valida logout e proteção das APIs;
- remove todos os dados temporários ao terminar.

Todos os testes:

```bash
npm run test:all
```

Nenhum teste E2E utiliza o banco local nem consome a cota real da OpenWeather.

## Comandos

| Comando | Finalidade |
|---|---|
| `npm run dev` | Frontend em desenvolvimento |
| `npm run dev:front` | Apenas Vite |
| `npm run dev:back` | Apenas Express |
| `npm run dev:all` | Frontend e backend juntos |
| `npm run build` | Build e validação |
| `npm run test:back` | Testes do backend com banco isolado |
| `npm run test:e2e` | Build e fluxo E2E completo |
| `npm run test:all` | Backend + E2E |
| `npm start` | Produção: Express + SPA |

## Estrutura principal

```text
.
├── back/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── db/
│   │   ├── middleware/
│   │   ├── routes/
│   │   └── services/
│   └── test/
├── scripts/
├── src/
│   ├── components/
│   ├── config/
│   ├── layouts/
│   ├── modules/
│   │   ├── calendar/
│   │   ├── contacts/
│   │   ├── events/
│   │   └── weather/
│   ├── pages/
│   ├── routes/
│   └── store/
└── dist/
```

## Fases concluídas

- Fase 0: estrutura base;
- Fase 1: backend unificado;
- Fase 2: módulo de clima;
- Fase 3: contatos e autenticação;
- Fase 4: eventos, participantes, clima e dashboard;
- Fase 5: execução unificada, produção, E2E e documentação.

## Observações para deploy

A aplicação pode ser implantada em qualquer ambiente que mantenha um processo Node.js ativo e um diretório persistente para o PGlite.

A decisão entre HostGator compartilhada, VPS, container ou outro serviço deve considerar:

- suporte a Node.js contínuo;
- proxy HTTPS;
- persistência de `PGDATA_PATH`;
- backup;
- configuração das variáveis privadas.

## Autor

Mauro Sakugawa

## Licença

MIT

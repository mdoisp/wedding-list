# Wedding List

Sistema web para gerenciamento de listas de presentes de casamento — **100% gratuito para os noivos**, sem vínculo com lojas parceiras e sem acréscimos nos valores.

## Visão Geral

Os noivos criam e gerenciam sua lista; convidados acessam via link único e reservam presentes sem risco de duplicidade. Contribuições financeiras são feitas diretamente via **Pix** (QR Code estático, sem gateway de pagamento).

## Stack

| Camada | Tecnologia |
|---|---|
| Backend | Python 3.12 + FastAPI |
| Banco de dados | PostgreSQL + SQLAlchemy + Alembic |
| Frontend | Next.js 14 + TypeScript + Tailwind CSS |
| Infraestrutura | Railway (backend + DB) + Vercel (frontend) |
| CI/CD | GitHub Actions |
| E-mail | Resend |

## Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                        GitHub Actions                        │
│   CI: lint + typecheck + tests  │  CD: build + deploy       │
└──────────────────┬──────────────────────────────────────────┘
                   │
       ┌───────────┴───────────┐
       ▼                       ▼
┌─────────────┐         ┌─────────────┐
│   Railway   │         │   Vercel    │
│  FastAPI    │◄────────│  Next.js    │
│  PostgreSQL │         │  Frontend   │
└─────────────┘         └─────────────┘
```

## Setup Local

### Pré-requisitos

- Docker e Docker Compose
- Node.js 20+
- Python 3.12+

### 1. Clone o repositório

```bash
git clone https://github.com/<seu-usuario>/wedding-list.git
cd wedding-list
```

### 2. Configure as variáveis de ambiente

```bash
cp .env.example .env
# Edite .env com seus valores
```

### 3. Suba o backend + banco com Docker Compose

```bash
docker compose up --build
```

A API estará disponível em `http://localhost:8000`.
Documentação Swagger: `http://localhost:8000/docs`.

### 4. Suba o frontend (desenvolvimento)

```bash
cd frontend
npm install
npm run dev
```

O frontend estará disponível em `http://localhost:3000`.

### 5. Rodar os testes do backend

```bash
cd backend
pip install -e ".[dev]"
pytest
```

## Estrutura de Pastas

```
wedding-list/
├── backend/
│   ├── app/
│   │   ├── controllers/   # Lógica de entrada/saída (dependências FastAPI)
│   │   ├── models/        # Models SQLAlchemy
│   │   ├── services/      # Regras de negócio
│   │   ├── utils/         # JWT, hashing, Pix, e-mail
│   │   ├── views/         # Routers FastAPI
│   │   ├── config.py      # Settings (pydantic-settings)
│   │   ├── database.py    # Engine + sessão SQLAlchemy
│   │   └── main.py        # App FastAPI
│   ├── tests/
│   ├── Dockerfile
│   └── pyproject.toml
├── frontend/
│   └── app/               # Next.js App Router
├── .github/
│   └── workflows/
│       ├── ci.yml         # Lint + typecheck + testes
│       └── cd.yml         # Deploy Railway + Vercel
├── docker-compose.yml
├── .env.example
└── README.md
```

## Deploy

### Secrets necessários no GitHub

| Secret | Descrição |
|---|---|
| `VERCEL_TOKEN` | Token de autenticação da Vercel CLI |
| `VERCEL_ORG_ID` | ID da organização na Vercel |
| `VERCEL_PROJECT_ID` | ID do projeto na Vercel |

> O backend no Railway é implantado automaticamente a cada push na branch `main` via integração nativa do GitHub.


### Migrations automáticas

As migrations do Alembic são executadas automaticamente no startup do container (`backend/start.sh` roda `alembic upgrade head` antes de iniciar o Uvicorn). O Railway aguarda o container ficar saudável antes de rotear tráfego, garantindo zero-downtime na troca de versão.

### Variáveis de ambiente em produção (Railway)

Configure no painel da Railway (serviço `backend`):

| Variável | Descrição |
|---|---|
| `DATABASE_URL` | URL do banco PostgreSQL (referência `${{Postgres.DATABASE_URL}}`) |
| `SECRET_KEY` | Chave secreta para JWT — gere com `openssl rand -hex 32` |
| `RESEND_API_KEY` | Chave de API do Resend |
| `EMAIL_FROM` | Endereço de origem dos e-mails (ex: `Wedding List <no-reply@seudominio.com>`) |
| `ENVIRONMENT` | `production` |
| `ALLOWED_ORIGINS` | URL do frontend na Vercel (ex: `https://seu-projeto.vercel.app`) |
| `LOG_LEVEL` | `INFO` (padrão) — use `DEBUG` para diagnóstico |

### Variáveis de ambiente em produção (Vercel)

Configure no painel da Vercel:
- `NEXT_PUBLIC_API_URL` — URL pública da API no Railway (ex: `https://seu-backend.up.railway.app`)

## Fluxo Principal

```
Noivos                    Sistema                  Convidados
  │                          │                          │
  ├─ Cadastro/Login ────────►│                          │
  │◄─ JWT Token ─────────────┤                          │
  │                          │                          │
  ├─ Cria Lista ────────────►│                          │
  │◄─ public_token (UUID) ───┤                          │
  │                          │                          │
  ├─ Adiciona Presentes ────►│                          │
  │                          │                          │
  │  Compartilha link público────────────────────────►  │
  │                          │◄─ Acessa /list/{token} ──┤
  │                          ├─ Lista Presentes ───────►│
  │                          │◄─ Reserva (nome+email) ──┤
  │                          ├─ is_reserved = true      │
  │◄─ E-mail notificação ────┤─ E-mail confirmação ────►│
  │                          │◄─ Acessa QR Code Pix ────┤
  │◄─ Pix recebido ──────────┤◄─ Pagamento via app ─────┤
```

## Segurança e Observabilidade

| Recurso | Implementação |
|---|---|
| **CORS** | Origens restritas via `ALLOWED_ORIGINS` (domínio Vercel em produção) |
| **Rate limiting** | `POST /public/{token}/gifts/{id}/reserve` limitado a 10 req/min por IP (`slowapi`) |
| **Migrations no deploy** | `alembic upgrade head` executado no startup do container antes do Uvicorn |
| **Logs estruturados** | Todos os logs emitidos em JSON — compatível com Railway Logs, Datadog, Grafana Loki |
| **Segredos** | Todas as variáveis sensíveis em variáveis de ambiente; nenhum valor hardcoded no código |

## Licença

MIT

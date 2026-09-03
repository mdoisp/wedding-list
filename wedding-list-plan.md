# Wedding List — Plano de Projeto

## Visão Geral

Sistema web para gerenciamento de listas de presentes de casamento, com foco em ser 100% gratuito para os noivos (sem vínculo com lojas parceiras e sem acréscimos nos valores). Os noivos criam e gerenciam sua lista; convidados acessam via link único e reservam presentes sem risco de duplicidade. O projeto serve como vitrine técnica com ênfase em backend Python, DevOps e Cloud.

**Stack:**
- Backend: Python + FastAPI (MVC, JWT, Clean Code, TDD)
- Frontend: Next.js 14 + TypeScript + Tailwind CSS (App Router)
- Banco de dados: PostgreSQL + SQLAlchemy + Alembic
- Infraestrutura: Railway (backend + banco), Vercel (frontend)
- CI/CD: GitHub Actions — CI (lint + typecheck + testes) e CD (build Docker + deploy Railway/Vercel), ambos ativos desde o primeiro commit (Day 0)
- E-mail: Resend (SDK Python, 3.000 e-mails/mês gratuitos, sem SMTP manual)

**Princípios:**
- MVC no backend, sem overengineering
- TDD: testes escritos antes ou junto com a implementação
- Clean Code: nomenclatura clara, funções pequenas, responsabilidade única
- Cloud Native: tudo containerizado, deploy automatizado
- Sem integração de gateway de pagamento — Pix via QR Code estático (BR Code / EMV)

---

## Sub-Tarefas

---

### Sub-Tarefa 1 — Estrutura Base do Projeto, Docker e Pipeline CI/CD (Day 0)

**Intent**
Criar o esqueleto do repositório com estrutura de pastas, Docker local e a esteira completa de CI/CD desde o primeiro commit. A filosofia Day 0 é mandatória: cada push na `main` já valida qualidade (CI) e faz deploy em produção (CD). Na Sub-Tarefa 1, o que vai a produção é apenas um `GET /health` — mas toda a infraestrutura de deploy já estará funcionando, testada e confiável. Isso elimina a "dívida técnica de infraestrutura" e garante que cada sub-tarefa seguinte entregue incrementalmente para produção, sem surpresas.

**Expected Outcomes**
- Repositório com estrutura de pastas definida para backend e frontend
- `docker-compose.yml` funcional para desenvolvimento local (FastAPI + PostgreSQL)
- `Dockerfile` do backend pronto para produção (multi-stage)
- Pipeline CI no GitHub Actions: lint (ruff), typecheck (mypy), testes (pytest) — roda em todo push/PR
- Pipeline CD no GitHub Actions: build Docker + deploy Railway — roda no merge para `main`, após CI passar
- Endpoint `GET /health` respondendo `{"status": "ok"}` em produção no Railway
- Frontend Next.js inicializado e deployed na Vercel (apenas página inicial placeholder)
- README com instruções de setup local e arquitetura de deploy

**Todo List**
1. Criar estrutura de diretórios: `backend/`, `frontend/`, `.github/workflows/`
2. Criar `backend/Dockerfile` multi-stage (build + runtime)
3. Criar `docker-compose.yml` com serviços `api` e `db`
4. Criar `backend/pyproject.toml` com dependências (FastAPI, Uvicorn, SQLAlchemy, Alembic, Pydantic, Pytest, python-jose, passlib, httpx, resend)
5. Implementar endpoint `GET /health` no backend
6. Criar `.github/workflows/ci.yml` com jobs paralelos: lint (ruff), typecheck (mypy), testes (pytest)
7. Criar `.github/workflows/cd.yml` disparado no merge para `main`, condicionado ao CI passar — deploy Railway (backend) e Vercel (frontend)
8. Provisionar Railway: projeto, serviço backend, banco Postgres, variáveis de ambiente
9. Provisionar Vercel: conectar repositório, configurar `NEXT_PUBLIC_API_URL`
10. Configurar secrets no GitHub: `RAILWAY_TOKEN`, `DATABASE_URL`, `SECRET_KEY`, `RESEND_API_KEY`
11. Inicializar projeto Next.js com TypeScript e Tailwind CSS (placeholder de landing page)
12. Criar `.env.example` com todas as variáveis necessárias
13. Criar `README.md` com instruções de setup local e diagrama de deploy

**Relevant Context**
- Estrutura MVC no backend: `backend/app/models/`, `backend/app/controllers/`, `backend/app/views/` (routers), `backend/app/services/`
- Variáveis de ambiente: `DATABASE_URL`, `SECRET_KEY`, `ALGORITHM`, `ACCESS_TOKEN_EXPIRE_MINUTES`, `RESEND_API_KEY`, `NEXT_PUBLIC_API_URL`
- O CI usa banco Postgres via `services` do GitHub Actions (espelha produção) ou SQLite como fallback
- A Sub-Tarefa 11 não é onde o deploy começa — o deploy começa aqui

**Status:** [ ] pending

---

### Sub-Tarefa 2 — Modelagem do Banco de Dados e Migrations

**Intent**
Definir todas as entidades do sistema em SQLAlchemy e criar as migrations com Alembic. Uma modelagem correta desde o início evita retrabalho e demonstra maturidade em design de dados.

**Expected Outcomes**
- Models SQLAlchemy definidos para todas as entidades
- Migrations Alembic geradas e funcionais
- Banco sobe corretamente via `docker-compose up`

**Todo List**
1. Configurar Alembic no projeto (`alembic init`)
2. Criar model `Couple` (id, name, email, hashed_password, pix_key, pix_key_type, email_notifications_enabled, created_at)
3. Criar model `GiftList` (id, couple_id FK, public_token UUID, title, wedding_date, created_at)
4. Criar model `Gift` (id, gift_list_id FK, name, description, image_url, price, store_link, is_reserved, created_at)
5. Criar model `Reservation` (id, gift_id FK, guest_name, guest_email, reserved_at)
6. Gerar e revisar migration inicial
7. Escrever testes de integração básicos para confirmar criação das tabelas

**Relevant Context**
- `public_token` na `GiftList` é o UUID aleatório usado na URL pública dos convidados
- `pix_key_type` pode ser: CPF, CNPJ, EMAIL, PHONE, RANDOM
- Um casal pode ter apenas uma lista ativa (restrição a definir via lógica de negócio)

**Status:** [ ] pending

---

### Sub-Tarefa 3 — Autenticação dos Noivos (JWT)

**Intent**
Implementar o sistema de autenticação completo para os noivos: cadastro, login, refresh token e proteção de rotas. É o núcleo de segurança da aplicação e demonstra conhecimento técnico sólido.

**Expected Outcomes**
- Endpoint `POST /auth/register` — cria conta do casal
- Endpoint `POST /auth/login` — retorna access token + refresh token
- Endpoint `POST /auth/refresh` — renova o access token
- Senhas armazenadas com hashing (bcrypt via passlib)
- Rotas protegidas funcionando com Bearer token
- Testes unitários e de integração cobrindo todos os cenários (sucesso, credenciais inválidas, token expirado)

**Todo List**
1. Criar serviço `AuthService` com métodos: `register`, `authenticate`, `create_tokens`, `refresh_token`
2. Criar utilitário JWT (`app/utils/jwt.py`): encode, decode, validação de expiração
3. Criar utilitário de hash de senha (`app/utils/security.py`): hash e verify
4. Criar schemas Pydantic: `RegisterRequest`, `LoginRequest`, `TokenResponse`
5. Criar router `auth` com os 3 endpoints
6. Criar dependência FastAPI `get_current_couple` para proteger rotas
7. Escrever testes: registro com email duplicado, login inválido, token expirado, refresh válido

**Relevant Context**
- Usar `python-jose` para JWT e `passlib[bcrypt]` para hashing
- Access token: expiração curta (ex: 30min); Refresh token: expiração longa (ex: 7 dias)
- Refresh token pode ser armazenado em banco ou apenas validado por assinatura (definir durante impl.)

**Status:** [ ] pending

---

### Sub-Tarefa 4 — CRUD da Lista e dos Presentes

**Intent**
Implementar os endpoints para os noivos criarem e gerenciarem sua lista de presentes. É o coração funcional do sistema para o lado dos noivos.

**Expected Outcomes**
- Endpoints CRUD para `GiftList` (criar, buscar, atualizar)
- Endpoints CRUD para `Gift` (criar, listar, atualizar, deletar)
- Geração automática do `public_token` UUID ao criar a lista
- Apenas o casal dono da lista pode gerenciá-la
- Testes cobrindo autorização (casal A não acessa lista do casal B)

**Todo List**
1. Criar `GiftListService` com métodos: `create_list`, `get_list_by_couple`, `update_list`
2. Criar `GiftService` com métodos: `add_gift`, `list_gifts`, `update_gift`, `delete_gift`
3. Criar schemas Pydantic para request/response de lista e presentes
4. Criar routers: `GET/POST /lists/`, `PUT /lists/{id}`, `POST/GET /lists/{id}/gifts`, `PUT/DELETE /lists/{id}/gifts/{gift_id}`
5. Gerar `public_token` UUID4 no momento da criação da lista
6. Imagem do presente como URL externa no cadastro (MVP) — upload pode ser fase 2
7. Escrever testes de autorização e validação

**Relevant Context**
- Rotas protegidas pela dependência `get_current_couple` da Sub-Tarefa 3
- `public_token` é imutável após criação — é a URL que será compartilhada com os convidados
- Para MVP, imagem como URL externa é suficiente e simplifica infraestrutura

**Status:** [ ] pending

---

### Sub-Tarefa 5 — Portal Público dos Convidados e Reserva de Presentes

**Intent**
Implementar os endpoints públicos (sem autenticação) acessados pelos convidados via link único. O convidado vê a lista, escolhe um presente, informa nome e e-mail, e o presente é reservado atomicamente para evitar duplicidade.

**Expected Outcomes**
- Endpoint `GET /public/{public_token}` — retorna dados da lista e presentes disponíveis
- Endpoint `POST /public/{public_token}/gifts/{gift_id}/reserve` — reserva o presente
- Presente reservado fica indisponível para outros convidados imediatamente
- Validação: presente já reservado retorna erro claro
- Testes cobrindo reserva simultânea (race condition) e presente inexistente

**Todo List**
1. Criar `ReservationService` com método `reserve_gift` usando lock otimista ou transação atômica no banco
2. Criar schemas: `GiftListPublicResponse`, `GiftPublicResponse`, `ReserveGiftRequest` (guest_name, guest_email)
3. Criar router `public` sem autenticação: `GET /public/{token}`, `POST /public/{token}/gifts/{gift_id}/reserve`
4. Implementar validação de e-mail no schema de reserva
5. Marcar `Gift.is_reserved = True` e criar registro em `Reservation` na mesma transação
6. Escrever testes: reserva com sucesso, tentativa de reservar presente já reservado, token inválido

**Relevant Context**
- A atomicidade da reserva é crítica — usar `SELECT FOR UPDATE` ou constraint único no banco
- O `public_token` é UUID aleatório, o que torna força bruta impraticável
- Nenhum dado sensível do casal é exposto neste endpoint (apenas nome, lista, presentes)

**Status:** [ ] pending

---

### Sub-Tarefa 6 — Geração do QR Code Pix

**Intent**
Gerar um QR Code no padrão BR Code (EMV, Banco Central do Brasil) com a chave Pix dos noivos, permitindo que o convidado faça uma contribuição em valor livre diretamente pelo app do banco.

**Expected Outcomes**
- Endpoint `GET /public/{public_token}/pix-qrcode` retorna imagem PNG do QR Code
- QR Code segue o padrão EMV/BR Code do Banco Central
- Compatível com qualquer app bancário brasileiro
- Testes validando geração do payload Pix

**Todo List**
1. Adicionar dependências `qrcode` e `Pillow` ao projeto
2. Criar utilitário `app/utils/pix.py` que gera o payload EMV estático a partir da chave Pix e nome do recebedor
3. Criar endpoint que gera o QR Code como imagem PNG em base64 ou stream de bytes
4. Expor o QR Code na rota pública da lista
5. Escrever testes para geração do payload com diferentes tipos de chave (CPF, e-mail, aleatória)

**Relevant Context**
- O padrão EMV Pix estático é documentado pelo Banco Central — campos obrigatórios: merchant account info, merchant name, merchant city, transaction amount (opcional para valor livre), CRC16
- Lib de referência: `python-pix` ou implementação manual do payload (simples, ~50 linhas)
- Valor livre: o QR Code não precisa ter valor fixo — o convidado digita o valor no app

**Status:** [ ] pending

---

### Sub-Tarefa 7 — Serviço de E-mail

**Intent**
Enviar e-mails automáticos após uma reserva: um para o convidado (confirmação da escolha) e um opcional para os noivos (notificação). Demonstra integração com serviços externos e uso de templates.

**Expected Outcomes**
- E-mail enviado ao convidado com: nome do presente escolhido, nome do casal, lembrete de que ele se comprometeu a comprar
- E-mail enviado aos noivos (se habilitado) com: nome do convidado, presente escolhido
- Templates HTML simples e responsivos
- Serviço de e-mail desacoplado (fácil trocar o provider)
- Testes com mock do envio (sem enviar e-mail real nos testes)

**Todo List**
1. Criar `EmailService` com método `send_email(to, subject, html_body)` usando o SDK do Resend
2. Criar templates HTML: `reservation_guest.html` (confirmação para o convidado) e `reservation_couple.html` (notificação para os noivos)
3. Disparar e-mails após confirmação da reserva no `ReservationService` como background task do FastAPI
4. Respeitar flag `email_notifications_enabled` do casal antes de enviar para eles
5. Escrever testes com mock do `resend.Emails.send` (sem enviar e-mail real nos testes)

**Relevant Context**
- Resend: SDK Python instalado via `pip install resend`, uso: `resend.Emails.send({"from": ..., "to": ..., "subject": ..., "html": ...})`
- 3.000 e-mails/mês gratuitos — mais que suficiente para o projeto
- Não requer configuração de servidor SMTP — apenas uma `RESEND_API_KEY` como variável de ambiente
- Background task do FastAPI: o e-mail é disparado após a resposta HTTP ser enviada ao convidado, sem travar a requisição
- Templates devem ser simples mas apresentáveis — é uma vitrine

**Status:** [ ] pending

---

### Sub-Tarefa 8 — Frontend: Landing Page e Autenticação dos Noivos

**Intent**
Criar as primeiras telas do Next.js: a landing page apresentando o Wedding List e as telas de cadastro e login dos noivos.

**Expected Outcomes**
- Landing page com proposta de valor, call-to-action para cadastro/login
- Tela de cadastro: nome do casal, e-mail, senha
- Tela de login: e-mail, senha
- Tokens JWT armazenados de forma segura (httpOnly cookie ou localStorage com refresh)
- Redirecionamento para dashboard após autenticação
- Layout responsivo

**Todo List**
1. Substituir placeholder da Sub-Tarefa 1 pela landing page real
2. Criar componentes base: `Button`, `Input`, `Card`
3. Criar página `/register` — formulário de cadastro
4. Criar página `/login` — formulário de login
5. Criar serviço `api/auth.ts` para comunicação com o backend
6. Implementar store de autenticação com Zustand
7. Proteger rotas do dashboard com middleware Next.js

**Relevant Context**
- App Router do Next.js 14+
- Tailwind CSS para estilização rápida e profissional
- Zustand é mais simples que Redux para este escopo

**Status:** [ ] pending

---

### Sub-Tarefa 9 — Frontend: Dashboard dos Noivos e Gerenciamento da Lista

**Intent**
Criar a interface onde os noivos gerenciam sua lista de presentes: adicionar, editar, remover presentes e visualizar quem reservou o quê.

**Expected Outcomes**
- Dashboard com visão geral da lista (presentes disponíveis, reservados, total)
- Formulário de adição/edição de presente (nome, descrição, preço, link da loja, URL da imagem)
- Botão para copiar o link público da lista
- Visão de reservas: lista de convidados e presentes escolhidos
- Configurações: chave Pix, toggle de notificações por e-mail

**Todo List**
1. Criar página `/dashboard` com layout protegido
2. Criar componente `GiftCard` para exibir cada presente
3. Criar modal/drawer de adição e edição de presente
4. Criar seção de reservas no dashboard
5. Criar página de configurações `/dashboard/settings`
6. Implementar serviços `api/gifts.ts` e `api/list.ts`
7. Botão "Compartilhar Lista" que copia a URL pública para o clipboard

**Relevant Context**
- URL pública segue o padrão: `/list/{public_token}`
- Dados do dashboard virão dos endpoints protegidos por JWT da Sub-Tarefa 4

**Status:** [ ] pending

---

### Sub-Tarefa 10 — Frontend: Portal Público dos Convidados

**Intent**
Criar a página pública acessada pelos convidados via link único. Interface simples, bonita e focada na experiência do convidado, sem necessidade de login.

**Expected Outcomes**
- Página `/list/{public_token}` exibindo a lista de presentes
- Presentes reservados marcados como indisponíveis visualmente
- Modal de reserva: convidado informa nome e e-mail
- Seção do QR Code Pix para contribuição livre
- Totalmente responsiva (maioria acessará pelo celular)

**Todo List**
1. Criar página `/list/[token]` com Server Component (Next.js App Router)
2. Criar componente `PublicGiftCard` com estado disponível/reservado
3. Criar modal `ReserveModal` com formulário nome + e-mail
4. Exibir QR Code Pix recebido do backend
5. Feedback visual após reserva (toast de confirmação)
6. Implementar serviço `api/public.ts`

**Relevant Context**
- Esta página é o produto final visto pelos convidados — deve ser a mais polida
- Server-side rendering melhora SEO e performance no mobile
- QR Code retornado pelo backend como base64 PNG

**Status:** [ ] pending

---

### Sub-Tarefa 11 — Hardening de Produção e Observabilidade

**Intent**
Com todas as features implementadas e em produção (via CD contínuo desde a Sub-Tarefa 1), esta tarefa final fecha o projeto com qualidade de produção: migrations automatizadas no deploy, monitoramento básico, revisão de segurança e documentação final. Não é onde o deploy começa — é onde ele é refinado.

**Expected Outcomes**
- Migrations Alembic executadas automaticamente no deploy (Railway release command)
- Revisão de segurança: CORS configurado, rate limiting no endpoint de reserva, variáveis sensíveis auditadas
- Monitoramento básico: logs estruturados (JSON) no backend
- README final com arquitetura completa, como rodar localmente e como contribuir

**Todo List**
1. Configurar comando de release no Railway para rodar `alembic upgrade head` antes de iniciar o serviço
2. Configurar CORS no FastAPI restringindo origens permitidas ao domínio Vercel
3. Adicionar rate limiting no endpoint `POST /public/{token}/gifts/{gift_id}/reserve` (ex: slowapi)
4. Configurar logging estruturado em JSON no backend (substituir prints por `logging`)
5. Auditar `.env.example` e garantir que nenhuma variável sensível está hardcoded no código
6. Atualizar README com arquitetura final, diagrama de deploy e instruções completas

**Relevant Context**
- O CD já está funcionando desde a Sub-Tarefa 1 — esta tarefa apenas refina a operação em produção
- Railway executa o release command antes de trocar o container, garantindo zero-downtime migrations
- `slowapi` é a lib de rate limiting para FastAPI, baseada em `limits`
- Logs em JSON facilitam integração futura com ferramentas de observabilidade (Datadog, Grafana, etc.)

**Status:** [ ] pending

---

## Diagrama de Fluxo

```
Noivos                          Sistema                         Convidados
  |                               |                                  |
  |-- Cadastro/Login ------------>|                                  |
  |<-- JWT Token -----------------|                                  |
  |                               |                                  |
  |-- Cria Lista ---------------->|                                  |
  |<-- public_token (UUID) -------|                                  |
  |                               |                                  |
  |-- Adiciona Presentes -------->|                                  |
  |                               |                                  |
  |-- Compartilha Link ---------->|-----> Convidados recebem link    |
  |                               |                                  |
  |                               |<-- Acessa /list/{token} --------|
  |                               |--- Lista de Presentes --------->|
  |                               |                                  |
  |                               |<-- Reserva Presente (nome+email)|
  |                               |--- Marca is_reserved = true      |
  |                               |--- E-mail para convidado ------->|
  |<-- E-mail de notificação -----|                                  |
  |                               |                                  |
  |                               |<-- Acessa QR Code Pix -----------|
  |                               |--- QR Code PNG ---------------->|
  |<-- Pix recebido no banco -----|<-- Pagamento via app bancário ---|
```

## Ordem de Implementação Recomendada

1. Sub-Tarefa 1 — Base, Docker e CI/CD completo (Day 0 — produção ativa desde o primeiro commit)
2. Sub-Tarefa 2 — Banco de dados (necessário antes de qualquer lógica)
3. Sub-Tarefa 3 — Autenticação JWT (necessário para proteger as rotas)
4. Sub-Tarefa 4 — CRUD da lista e presentes (core do produto)
5. Sub-Tarefa 5 — Portal público e reservas (core do produto)
6. Sub-Tarefa 6 — QR Code Pix (feature independente)
7. Sub-Tarefa 7 — E-mails com Resend (feature independente)
8. Sub-Tarefa 8 — Frontend: landing e auth
9. Sub-Tarefa 9 — Frontend: dashboard dos noivos
10. Sub-Tarefa 10 — Frontend: portal dos convidados
11. Sub-Tarefa 11 — Hardening de produção e observabilidade (refinamento final)

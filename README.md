Pokédex – Backend API (Django/DRF) + Frontend (Angular)

Este repositório contém:

Backend em Django REST Framework com autenticação JWT (access/refresh), CORS e endpoints para:

Listar Pokémon (com filtros e paginação)

Favoritar / desfavoritar

Adicionar / remover da equipe (party)

Listar favoritos e equipe do usuário

Descobrir o usuário logado (/me)

Healthcheck (/api/ping)

Frontend em Angular consumindo a API.

⚠️ Status do projeto

Backend: funcional e completo.

Frontend: implementado o esqueleto (listagem com filtros, layout base, JWT + interceptor).
Não está 100% porque a API pública usada para enriquecer os dados está respondendo lentamente em alguns momentos, o que degrada a UX e inviabilizou finalizar todas as telas (favoritos/equipe no front e alguns refinamentos visuais). Os endpoints do nosso backend, porém, estão estáveis.

Sumário

Arquitetura

Como executar (backend)

Como executar (frontend)

Autenticação

Modelos de dados (resumo)

Endpoints

Healthcheck

Auth

Perfil

Pokémon – listagem e filtros

Favoritos

Equipe (party)

Erros e códigos de status

Variáveis de ambiente

Limitações conhecidas

Próximos passos (frontend)

Licença

Arquitetura

Backend

Django 5 + Django REST Framework

djangorestframework-simplejwt para JWT (Access/Refresh)

CORS liberado para http://localhost:4200

Banco: SQLite (dev)

Frontend

Angular 17+ (standalone APIs)

Interceptor de JWT com refresh automático

Páginas: Home/Pokémon List, Login (básico)

SCSS e layout responsivo

Como executar (backend)

Requer Python 3.12+.

# 1) criar e ativar o venv
python -m venv .venv
# Windows PowerShell
.\.venv\Scripts\Activate.ps1
# Linux/macOS
source .venv/bin/activate

# 2) instalar deps
pip install -r requirements.txt

# 3) migrar
python manage.py migrate

# 4) criar superusuário (opcional, para testes)
python manage.py createsuperuser

# 5) rodar
python manage.py runserver
# API em http://127.0.0.1:8000

Como executar (frontend)

Requer Node 18+ e Angular CLI.

Como executar (frontend)

Requer Node 18+ e Angular CLI.

Se aparecer erro de execução de scripts no PowerShell, rode como Admin:
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned

Autenticação

JWT Bearer com Access Token (curta duração) e Refresh Token.

Envie Authorization: Bearer <access> em requisições protegidas.

Quando o access expira, use /auth/refresh para obter um novo access.

O frontend já possui interceptor que:

Anexa Authorization automaticamente.

Em caso de 401, tenta refresh; se falhar, faz logout.

Endpoints

Base URL (dev): http://127.0.0.1:8000

Healthcheck
GET /api/ping (público)

Retorna status do serviço.

Response 200
{ "status": "ok", "message": "pokedex api up" }

Auth
POST /auth/login (público)

Autentica e retorna tokens.

Request

{ "username": "user", "password": "pass" }
Response 200
{
  "access": "<jwt-access>",
  "refresh": "<jwt-refresh>"
}

POST /auth/refresh (público)

Troca refresh por um novo access.

Request
{ "refresh": "<jwt-refresh>" }

Response 200
{ "access": "<novo-access>" }


Favoritos
POST /api/pokemon/<pid>/favorite (protegido)

Alterna favorito (toggle) para o usuário logado.

Response 200

{ "favorite": true }   // ou false

GET /api/favorites (protegido)

Lista os Pokémon favoritados pelo usuário.

Response 200

[
  { "id": 1, "name": "bulbasaur", "...": "..." },
  { "id": 25, "name": "pikachu",   "...": "..." }
]

Equipe (party)
POST /api/pokemon/<pid>/team/add (protegido)

Adiciona o Pokémon à equipe do usuário (máx. 6).

Response 200

{ "in_team": true }

POST /api/pokemon/<pid>/team/remove (protegido)

Remove da equipe.

Response 200

{ "in_team": false }

GET /api/team (protegido)

Lista a equipe atual do usuário.

Response 200

[
  { "id": 4, "name": "charmander", "...": "..." },
  { "id": 7, "name": "squirtle",    "...": "..." }
]

Erros e códigos de status

400 Bad Request – parâmetros inválidos.

401 Unauthorized – ausente/expirado; use /auth/login ou /auth/refresh.

403 Forbidden – sem permissão para o recurso.

404 Not Found – recurso inexistente.

409 Conflict – regra de negócio (ex.: time com mais de 6 membros).

429 Too Many Requests – (se rate limit estiver habilitado).

500/502/504 – erros inesperados/upstream lento (ver seção de limitações).

Exemplo de erro (JWT expirado)

{
  "detail": "Given token not valid for any token type",
  "code": "token_not_valid",
  "messages": [
    { "token_class": "AccessToken", "token_type": "access", "message": "Token is expired" }
  ]
}

Limitações conhecidas

Lentidão intermitente da API externa de Pokémon utilizada para enriquecer dados (stats/sprites).

Em horários de pico, chamadas sobem muito o tempo de resposta, ocasionando timeouts e broken pipe no dev-server.

O backend do projeto está completo e estável, mas o frontend não foi finalizado 100% por conta dessas latências (telas de favoritos/equipe e alguns refinamentos visuais ficaram pendentes).

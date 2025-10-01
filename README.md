# Pokédex API – Backend (Django/DRF) + Frontend (Angular)

Este repositório contém uma aplicação full-stack composta por:

🐍 Backend: API REST desenvolvida com Django REST Framework, com autenticação JWT, CORS habilitado e endpoints completos para manipulação de Pokémon, favoritos e equipe personalizada.

⚡ Frontend: Aplicação em Angular que consome a API.

📌 Status do Projeto

Backend: ✅ 100% funcional e estável.

Frontend: ⚠️ Parcialmente implementado. A listagem principal e a autenticação estão funcionais, porém algumas telas (favoritos, equipe, refinamentos visuais) não foram finalizadas devido a uma limitação de performance da PokéAPI, que em certos momentos levou mais de 4 minutos por requisição, inviabilizando a conclusão dentro do prazo.
🚀 Como executar o Backend

Requisitos: Python 3.12+
# 1. Criar e ativar ambiente virtual
python -m venv .venv
.\.venv\Scripts\activate      # Windows
source .venv/bin/activate     # Linux/macOS

# 2. Instalar dependências
pip install -r requirements.txt

# 3. Aplicar migrações
python manage.py migrate

# 4. Criar superusuário (opcional)
python manage.py createsuperuser

API disponível em: http://127.0.0.1:8000

🔐 Autenticação

O sistema utiliza JWT (Access/Refresh Tokens):

Envie Authorization: Bearer <access_token> em requisições autenticadas.

Quando o access token expirar, use o endpoint /auth/refresh para obter um novo.

📡 Endpoints Principais
🔍 Healthcheck

GET /api/ping
Verifica o status da API.
Response:

{ "status": "ok", "message": "pokedex api up" }

🔑 Autenticação

POST /auth/login
Autentica o usuário e retorna os tokens.

{ "username": "user", "password": "pass" }


POST /auth/refresh
Atualiza o access token.

{ "refresh": "<token>" }

👤 Perfil

GET /api/me (protegido)
Retorna dados do usuário autenticado.

🐾 Pokémon

GET /api/pokemon (protegido)
Lista Pokémon com filtros e paginação.

POST /api/pokemon/<id>/favorite (protegido)
Alterna um Pokémon como favorito.

GET /api/favorites (protegido)
Lista os favoritos do usuário.

🛡️ Equipe (Party)

POST /api/pokemon/<id>/team/add (protegido)
Adiciona um Pokémon à equipe (máximo: 6).

POST /api/pokemon/<id>/team/remove (protegido)
Remove um Pokémon da equipe.

GET /api/team (protegido)
Lista a equipe atual do usuário.

⚠️ Limitações Conhecidas

A PokéAPI utilizada para enriquecer os dados apresenta lentidão em horários de pico, com tempo de resposta superior a 4 minutos em alguns casos.

Isso afetou a experiência no frontend e impediu a conclusão de algumas funcionalidades dentro do prazo proposto.

Apesar disso, todos os endpoints do backend estão completos e estáveis.

📜 Licença

Este projeto é livre para fins educacionais e acadêmicos.
# 5. Rodar o servidor
python manage.py runserver

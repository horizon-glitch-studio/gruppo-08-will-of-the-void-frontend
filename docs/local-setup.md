# Local setup with the backend

The game platform (`/play`) and the back office (`/admin`) need the backend running. It starts with Docker: one container for PostgreSQL, one for the API.

## Start the backend

1. Clone the backend next to this repository and start it:

```
git clone https://github.com/horizon-glitch-studio/gruppo-08-will-of-the-void-backend.git
cd gruppo-08-will-of-the-void-backend
cp .env.example .env
docker compose --profile app up -d --build
docker compose logs -f backend
```

The first build takes a few minutes. When the log shows `Started WillofthevoidApplication`, press Ctrl+C: it only stops the log, the containers keep running.

2. Check that the API answers:

```
curl http://localhost:8080/api/v1/game-data
```

It returns a JSON with factions, rarities and deck rules. All the endpoints are listed and can be tried at http://localhost:8080/swagger-ui.html.

To stop the backend: `docker compose --profile app down` in the backend folder. Add `-v` to delete the database too.

## Start the frontend

1. Set the API address in `.env` of this repository:

```
VITE_API_BASE_URL=http://localhost:8080/api/v1
```

2. Start the development server:

```
npm run dev
```

Vite reads `.env` only at startup: restart `npm run dev` after every change.

3. Open http://localhost:5173/play/login. Use `localhost`, not `127.0.0.1`: the backend accepts requests only from `http://localhost:5173` (CORS), and the browser treats the two addresses as different origins.

## Codespaces

Open the codespace in VS Code desktop, not in the browser. VS Code forwards the ports to your computer, so the addresses above work as they are.

In the Ports panel, check that 5173 and 8080 are forwarded to `localhost:5173` and `localhost:8080`. If 5173 is busy on your computer, VS Code picks another port and the backend refuses the requests.

The backend can be cloned and started inside the same codespace, in `/workspaces`.

## Test accounts

There is no registration page yet. Create an account with the API:

```
curl -X POST http://localhost:8080/api/v1/auth/register -H 'Content-Type: application/json' -d '{"username":"tester","email":"tester@example.com","password":"Password123","timezone":"Europe/Rome"}'
```

No email is sent in local development. To mark the email as verified (needed for trades):

```
docker exec -it wotv_postgres psql -U wotv_user -d wotv -c "UPDATE player SET email_verified_at = now() WHERE username = 'tester';"
```

The backend does not create an admin account. To use `/admin`, promote a test account, then log out and in again (the role is in the token):

```
docker exec -it wotv_postgres psql -U wotv_user -d wotv -c "UPDATE player SET role = 'ADMIN' WHERE username = 'tester';"
```

The `docker exec` commands use the container, user and database names of the backend `.env.example` (`wotv_postgres`, `wotv_user`, `wotv`): adapt them if your `.env` is different.

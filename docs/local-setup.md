# Run the game locally

To try `/play` and `/admin` you need the backend running on your machine. The backend runs in Docker: you don't install Java or PostgreSQL, Docker does it for you.

All the commands below are for GitHub Codespaces, where the repositories live in `/workspaces`. On your own computer, use the folder where you cloned them.

## Every time: one command

Start (or restart) the backend:

```
cd /workspaces/gruppo-08-will-of-the-void-backend
docker compose --profile app up -d --build
```

Then start the frontend, in another terminal:

```
cd /workspaces/gruppo-08-will-of-the-void-frontend
npm run dev
```

Open http://localhost:5173/play/login.

The backend command is safe to run every time:

- If the backend is already running, nothing happens.
- If it's off, it turns it on.
- If someone changed the backend code (after a `git pull`), it rebuilds it.

The first time it takes a few minutes, then a few seconds.

## First time only

Do this once, before the steps above.

1. Download the backend next to the frontend and create its settings file:

```
cd /workspaces
git clone https://github.com/horizon-glitch-studio/gruppo-08-will-of-the-void-backend.git
cd gruppo-08-will-of-the-void-backend
cp .env.example .env
```

2. In the frontend folder, create a file called `.env` with this line:

```
VITE_API_BASE_URL=http://localhost:8080/api/v1
```

3. Open the codespace in VS Code desktop, not in the browser. This way the addresses with `localhost` work on your computer.

## Is it working?

The backend needs about 15 seconds to start after the command. To see what it's doing:

```
cd /workspaces/gruppo-08-will-of-the-void-backend
docker compose logs -f backend
```

When you see `Started WillofthevoidApplication`, it's ready. Press Ctrl+C to close the log (the backend keeps running).

To check that it answers:

```
curl http://localhost:8080/api/v1/game-data
```

You should get a long JSON text. All the backend endpoints are listed, and can be tried, at http://localhost:8080/swagger-ui.html.

## Test accounts

There is no sign-up page yet. Create an account with this command (change the name, email and password if you want):

```
curl -X POST http://localhost:8080/api/v1/auth/register -H 'Content-Type: application/json' -d '{"username":"tester","email":"tester@example.com","password":"Password123","timezone":"Europe/Rome"}'
```

Then log in at http://localhost:5173/play/login.

Two extra commands, if you need them. Replace `tester` with your username.

- Mark the email as verified (no email is sent locally, and trades need a verified email):

```
docker exec -it wotv_postgres psql -U wotv_user -d wotv -c "UPDATE player SET email_verified_at = now() WHERE username = 'tester';"
```

- Make the account an admin, to use `/admin`. Then log out and log in again:

```
docker exec -it wotv_postgres psql -U wotv_user -d wotv -c "UPDATE player SET role = 'ADMIN' WHERE username = 'tester';"
```

## When something goes wrong

**The login page says "Could not complete the request."** The frontend can't reach the backend. Check, in this order:

1. The address bar says `localhost:5173`, not `127.0.0.1:5173`. They look the same, but the backend only accepts `localhost`.
2. The `.env` file of the frontend has the line above. If you just created or changed it, stop `npm run dev` (Ctrl+C) and start it again: it reads `.env` only when it starts.
3. In VS Code, open the Ports panel: 5173 and 8080 must be forwarded to `localhost:5173` and `localhost:8080`. If 8080 is missing, click Forward a Port and type 8080: VS Code doesn't always notice the backend, because it runs inside Docker. If a port is busy on your computer, VS Code shows an error: close whatever uses that port and try again.

**I ran the first-time steps twice.** Usually nothing bad happens:

- `git clone` says the folder already exists and stops. Fine.
- `cp .env.example .env` overwrites the backend `.env` with the default one. Fine, unless you had changed it.
- `docker compose up` reuses the containers it already has. It never creates a second copy.

You get a real duplicate only if you cloned the backend into a second folder, for example inside the frontend folder. Then Docker says `container name "/wotv_postgres" is already in use`. To remove the extra copy, go into the extra folder and run:

```
docker compose --profile app down -v
cd ..
rm -rf gruppo-08-will-of-the-void-backend
```

Check the path before `rm -rf`: delete only the extra copy, not the one in `/workspaces`.

**Docker is using too much disk space.** Every rebuild leaves the old image behind. To delete the ones nobody uses:

```
docker image prune -f
```

**I want to start from zero.** This deletes the database too, so test accounts are gone:

```
cd /workspaces/gruppo-08-will-of-the-void-backend
docker compose --profile app down -v
docker compose --profile app up -d --build
```

Do this also if the backend team tells you they changed an existing database migration.

## Turn it off

You don't have to: a codespace that you don't use stops by itself. If you want to:

```
cd /workspaces/gruppo-08-will-of-the-void-backend
docker compose --profile app down
```

Your test accounts stay. Add `-v` only if you want to delete them too.

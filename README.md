# Will of the Void – Frontend

Frontend of **Will of the Void**, a digital collectible card game developed for the Laboratorio Integrato (group 08).

Hybrid architecture: static public pages (HTML, CSS, TypeScript) for SEO and performance, and two React single-page apps, the game (`/play`) and the back office (`/admin`). Vite builds all of them as one multi-page project. Cards are rendered as HTML/CSS components from data served by the API.

Stack: Node.js 22, Vite 8, React 19, React Router 8, TypeScript 7. Details in [DEPENDENCIES.md](DEPENDENCIES.md).

## Getting started

Requirements: Node.js 22 (see `.nvmrc`), npm.

```
npm install
cp .env.example .env
npm run dev            # development server on http://localhost:5173
```

| Script                 | What it does                               |
| ---------------------- | ------------------------------------------ |
| `npm run dev`          | Development server with hot reload         |
| `npm run build`        | Type-check and production build in `dist/` |
| `npm run preview`      | Serves `dist/` locally                     |
| `npm run lint`         | oxlint                                     |
| `npm run typecheck`    | TypeScript check, no output                |
| `npm run format`       | Prettier, writes the changes               |
| `npm run format:check` | Prettier, only checks                      |

Environment variables (`.env.example`):

| Variable            | Description                                                                         |
| ------------------- | ----------------------------------------------------------------------------------- |
| `VITE_API_BASE_URL` | Backend API base URL, `/api/v1` included, no trailing slash                         |
| `VITE_GTM_ID`       | Google Tag Manager container (`GTM-XXXXXXX`). Empty: GTM is not loaded              |
| `VITE_SITE_URL`     | Published site address, no trailing slash (canonical links, link previews, sitemap) |

The backend builds the links in verification and password-reset emails from its `APP_FRONTEND_URL`, which must end with `/play` (for example `http://localhost:5173/play`).

## Project structure

```
.github/
.vscode/
about/
admin/
card-prototype/
cookies/
docs/
lore/
play/
privacy/
public/
rulebook/
src/
  admin/
  assets/
  partials/
  play/
  shared/
  static/
  styles/
support/
terms/
404.html
index.html
wrangler.jsonc
```

## Deployment

The site runs on Cloudflare Workers with static assets, at [willofthevoid.horizonglitchstudio.workers.dev](https://willofthevoid.horizonglitchstudio.workers.dev). Every push to `main` triggers a Cloudflare build (`npm run build`) and deploy (`npx wrangler deploy`).

- `wrangler.jsonc`: serves `dist/` and answers unknown paths with the custom `404.html`.
- `public/_redirects`: rewrites `/play/*` and `/admin/*` to their `index.html`, so direct links and reloads open the app.
- `VITE_API_BASE_URL` is set as a build variable in the Cloudflare dashboard, because Vite reads it at build time.

## Conventions

- **Branches**: `type/short-description` from `main`, for example `feat/deck-editor`, `fix/login-error`.
- **Commits**: [Conventional Commits](https://www.conventionalcommits.org/), for example `feat(play): add deck editor`.
- **Pull requests**: one approval from another team member, CI green, conversations resolved. Merge commits only (no squash), so the history keeps who wrote what. The PR template lists the checks.
- **CI** (GitHub Actions, on every PR and push to `main`): format, lint, typecheck, build.
- **Code style**: Prettier and oxlint, configured in the repository. With the recommended VS Code extensions, files are formatted on save. Every exported function and component has a JSDoc comment.

## Documentation

- [Dependencies](DEPENDENCIES.md): libraries used, with the reasons behind each choice.
- [Routes and API](docs/frontend-routes-and-api.md): site map, routes, data and endpoints of each screen, open API questions.
- [Reports](docs/reports/): Lighthouse, accessibility and usability test results.
- [Credits](docs/credits.md): origin and licenses of illustrations, fonts and other third-party assets.

## Links

- [Backend repository](https://github.com/horizon-glitch-studio/gruppo-08-will-of-the-void-backend)
- [Documentation repository](https://github.com/horizon-glitch-studio/gruppo-08-will-of-the-void-docs)

## Team

- Design & Web Development: Francesca Oliverio @francescaoliverio, Robert Alexandru @RobertAlexandru67, Simone Caratelli @simonecaratelli
- Software Development: Mondir Badaoui @mondirbada, Simone Albanese @simonealbanese, Gianluca Salzarulo @giangysalza
- Digital Strategy: Marco Barbero @MerkBerb, Samuele Restivo @samuelerestivo06, Steaven Apilado @steweapilads

---

Academic project: we are students at ITS Academy ICT Piemonte, Turin, Italy.

© 2026 Horizon Glitch Studio. All rights reserved, except for third-party assets, which keep their own licenses.

# Will of the Void – Frontend

Frontend of **Will of the Void**, a digital collectible card game developed for the Laboratorio Integrato (group 08).

Hybrid architecture: static public pages (HTML, CSS, JavaScript) for SEO and performance, and React single-page apps for the game (`/play`) and the back office (`/admin`). Cards are rendered as HTML/CSS components from data served by the API.

Stack: Node.js [version], Vite, React.js [version].

## Getting started

Requirements: Node.js [version], npm.

```
npm install
npm run dev       # development server
npm run build     # production build
```

Environment variables are listed in `.env.example`: [API base URL].

## Documentation

- [Dependencies](DEPENDENCIES.md): libraries used, with the reasons behind each choice.
- [Architecture](docs/architecture.md): site map, routes and the choice of building cards in HTML/CSS.
- [Reports](docs/reports/): Lighthouse, accessibility and usability test results.
- [Credits](docs/credits.md): origin and licenses of illustrations, fonts and other third-party assets.

## Links

- API (Swagger): [url]
- Live site: [url]
- Backend repository: https://github.com/horizon-glitch-studio/gruppo-08-will-of-the-void-backend

## Team

- Design & Web Development: @francescaoliverio, @RobertAlexandru67, @simonecaratelli
- Software Development: @mondirbada, @simonealbanese, @giangysalza
- Digital Strategy: @MerkBerb, @samuelerestivo06, @steweapilads

---

Academic project: we are students at ITS Academy ICT Piemonte, Turin, Italy.

© 2026 Horizon Glitch Studio. All rights reserved, except for third-party assets, which keep their own licenses.

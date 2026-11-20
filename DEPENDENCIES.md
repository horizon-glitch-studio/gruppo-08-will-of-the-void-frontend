# Dependencies

Exact versions are in `package.json` and `package-lock.json`.

## Runtime

| Library | Purpose | Why |
| --- | --- | --- |
| react | UI of `/play` and `/admin` | Component model fits a game interface with a lot of shared state. |
| react-dom | Renders React in the browser | Required by React. |
| @fontsource-variable/exo | Exo font, body text and UI | Self-hosted: the font is served with the site, no request to Google servers. Variable font: one file for all weights. |
| @fontsource-variable/cinzel | Cinzel font, h1 and h2 | Same as Exo. Same designer as Exo, close to the logo lettering. |
| @phosphor-icons/react | UI icons and faction symbols | One consistent icon set, MIT license. Import the names with the Icon suffix (FireIcon): the ones without it are deprecated. |
| react-router | Routing of `/play` and `/admin` | Every screen has its own URL, so it can be linked, reloaded and reached with the browser's back button. |

## Development

| Library | Purpose | Why |
| --- | --- | --- |
| vite | Dev server and build | Builds static pages and React apps in one multi-page project; fast dev server with hot reload. |
| @vitejs/plugin-react | React support in Vite | JSX transform and hot reload of components. |
| typescript | Type checking | Catches errors before runtime and documents the shape of the API data. Vite strips the types without checking them: `tsc` does the check. |
| @types/react, @types/react-dom, @types/node | Type definitions | Types for React and for Node APIs used in `vite.config.ts`. |
| oxlint | Linter | Rules for React hooks, TypeScript, imports, accessibility (jsx-a11y) and JSDoc. Supports TypeScript 7. |
| prettier | Formatter | One code style for the whole team, checked in CI. |
| sharp | Image processing | Generates the lore images (WebP crops and widths) and the favicons from the brand files: scripts/images.mjs, scripts/favicons.mjs. |


# M’AKOMA Beads

A responsive product-story and showcase site for M’AKOMA’s six-bead bracelet. Visitors can rotate and select a 3D bracelet model, explore meanings for eight Adinkra symbols, and follow links to the brand’s official product and preorder pages. The interactive model and symbol descriptions are front-end presentation features; this repository does not implement the bracelet’s messaging service or a companion app.

## Capabilities

- Interactive Three.js bracelet viewer with pointer drag-to-rotate and bead selection.
- Six bead controls and eight selectable symbol descriptions, with the selected meaning shown alongside the model.
- Responsive story, product imagery, and links to official M’AKOMA pages.
- Reduced-motion handling and a static-image fallback when WebGL rendering is unavailable.

## Technology

Vanilla JavaScript with ES modules, CSS, Vite, and Three.js. The package manifest requires Node.js 22.12 or newer and declares pnpm 11.25.0 as the package manager.

## Setup and commands

Install dependencies:

```sh
pnpm install
```

Start the local development server (port 3000):

```sh
pnpm dev
```

Create a production build:

```sh
pnpm build
```

Preview the production build locally after building:

```sh
pnpm preview
```

There is no test script or test suite configured in the package manifest.

## Project structure

- `index.html` — page content, metadata, navigation, and section structure.
- `src/main.js` — page interactions, bead and symbol selection, and motion/accessibility behavior.
- `src/bead-scene.js` — Three.js bracelet scene, rendering, pointer interaction, and resize handling.
- `src/data.js` — bead lineup and symbol names, meanings, and descriptions.
- `src/styles.css` — responsive page styling.
- `public/images/` — product imagery used by the page and viewer fallback.
- `vite.config.js` — Vite development and preview server settings.

No deployment instructions, license file, or contribution guide are present in the repository.
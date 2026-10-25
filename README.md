# Theo LM — Code & Other Spirits

A small interactive voxel graveyard for a professional portfolio. Built with Three.js, TypeScript, and Vite. Every 3D object, including the skeletal parade conductor, is generated from boxes in code; no external 3D assets are required.

## Run

```sh
npm install
npm run dev
```

## Check and build

The browser tests use Google Chrome (`channel: 'chrome'`). Install it locally or run `npx playwright install chrome` in your test environment.

```sh
npm test
npm run build
npm run preview
```

Deploy `dist/` to any static host. The default Vite base path assumes a domain root. For a repository subpath deployment, configure Vite's `base` and adapt root-relative image paths.

## Content

- `src/projects.ts`: curated project descriptions, links, technologies, and colors.
- `src/scene.ts`: deterministic voxel models, lighting, camera, interaction, and animation.
- `src/main.ts`: project cards, accessible dialogs, and original project illustrations.
- `src/style.css`: layout, typography, responsive styles, and reduced-motion support.
- `index.html`: profile, contact links, metadata, and no-JavaScript project links.

The ChatLaunch demo is sourced from the project's public README (`theolm/WhatsAppNoContact`, MIT). Other project visuals are original abstract artwork, not app screenshots. Replace these with approved screenshots when available. Project descriptions were checked against their public READMEs; no GitHub API call runs in the browser. Google Fonts is optional: system serif, sans-serif, and monospace fallbacks remain available offline.

## Interaction and accessibility

Click a monument or a project card to open details. Drag the scene to adjust the view; use the reset button to restore the camera. No sound, forced camera travel, or scroll interception. Native dialogs support Escape, focus trapping, and focus restoration. Keyboard users can reach all projects through the HTML cards. Reduced-motion preferences disable scene animation and use a static ChatLaunch image. A manual pause button is also available. If WebGL is unavailable, the complete HTML project list still works.

## Visual direction

Original voxel interpretation inspired by the user-provided Black Parade conductor reference. No album art, logos, or music is distributed. Not affiliated with My Chemical Romance.

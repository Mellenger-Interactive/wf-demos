# wf-demos

West Fraser demos by Mellenger, published together on GitHub Pages.

| Folder | What it is | Live |
| --- | --- | --- |
| `wood-house/` | Interactive Three.js timber house (formerly the `west-fraser-material-house` repo, history kept). Vite project. | `/wood-house/` |
| `framed-house/` | Interactive Three.js framed house modelled from West Fraser's RONA video; the house is a GLB exported from Blender. Vite project. | `/framed-house/` |
| `carbon-story/` | Carbon story Lottie animation and embeddable demo page. Static files. | `/carbon-story/` |

Live site: https://mellenger-interactive.github.io/wf-demos/

## Publishing

Every push to `main` runs `.github/workflows/deploy.yml`, which builds `wood-house` and `framed-house` (`npm ci && npm run build` in each), copies `carbon-story/` as-is, adds the root `index.html`, and deploys the result to GitHub Pages. In the repo settings, **Pages → Source** must be set to **GitHub Actions**.

## Working on a demo

- Wood house: `cd wood-house && npm install && npm run dev`. See `wood-house/README.md`.
- Framed house: `cd framed-house && npm install && npm run dev`. See `framed-house/README.md`.
- Carbon story: replace `carbon-story/carbon-story.json` with a new export. See `carbon-story/README.md`.

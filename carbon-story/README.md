# Carbon story

Interactive carbon story for West Fraser: the full Figma graphic (forest, sawmill, construction site) with click-to-zoom areas. The overview is static; zooming into the construction site cross-fades to the Lottie animation (a truck delivers a mass timber beam, a crane lifts it onto a CLT building, and people walk past) and plays it.

## Files

- `index.html` – the page and component: Overview / Forest / Sawmill / Construction and +/− buttons, click an area to zoom, drag to pan, Esc to go back. When zoomed in, the other areas fade out. `STILL_FRAME` at the top of the script picks which frame of the construction strip the static overview shows.
- `carbon-story.json` – the Lottie animation (600 × 600, 30 fps, 360-frame loop). The page also builds the static, full-length construction strip from this file, so it is only downloaded once.

## Running locally

```
npm install   # first time only
npm run dev   # opens the page and reloads on save
```

The page has to be served (not opened as a file) so it can load `carbon-story.json`.

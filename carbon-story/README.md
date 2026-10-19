# Carbon story

Looping Lottie animation for West Fraser's carbon story: a truck delivers a mass timber beam, a crane lifts it onto a CLT building, and people walk past.

## Files

- `carbon-story.json` – the Lottie animation (600 × 600, 30 fps, 360-frame loop).
- `index.html` – demo page and embeddable component (pause button, reduced-motion still frame, screen-reader label).

## Embedding

```html
<div id="carbon-story" class="carbon-story" role="img" aria-label="Animation: a truck delivers a mass timber beam, a crane lifts it onto a timber building, and people walk past on the street."></div>
<script src="https://cdnjs.cloudflare.com/ajax/libs/lottie-web/5.12.2/lottie.min.js"></script>
<script>
  lottie.loadAnimation({ container: document.getElementById('carbon-story'), renderer: 'svg', loop: true, autoplay: true, path: 'carbon-story.json' });
</script>
<style>.carbon-story { width: 100%; max-width: 600px; aspect-ratio: 1 / 1; }</style>
```

The `path` is relative to the page. The loop runs longer than 5 seconds, so keep a pause control on public pages (see `index.html`).

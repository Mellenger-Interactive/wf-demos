# West Fraser framed house

Interactive Three.js explorer of a two-storey framed house, modelled in Blender from West Fraser's RONA marketing video (`WF_2026-10_Video_RONA_FR-EN-v2.0`). Visitors orbit the house, watch it build, explode it, and pick a part to see the West Fraser product it uses. Same look and copy as `../wood-house/`; only the house differs.

## Use

- `npm install`
- `npm run dev`, then open the printed address.
- `npm run build` writes the static site to `dist/`.
- `npm run snap` (with the dev server running) takes the standard screenshots into `checks/snaps/` and prints a JSON summary. See `checks/snap.mjs`.

## Files

| File | What's there |
| --- | --- |
| `public/framed-house.glb` | The house. ~330 merged parts, one product each, with glTF extras `wf_product`, `wf_layer`, `wf_stage` (build start, 0–1) and `wf_explode` (exploded offset). |
| `src/products.js` | The 11 products: id (matches `wf_product`), name, type, swatch colour, Learn More link, description. Array order is the sidebar order. |
| `src/timeline.js` | Build length, per-part ramp, the five stage bands and timeline stops. |
| `src/main.js` | Renderer, lights, camera and controls, GLB loading (per-product material clones for highlighting), selection and hover, build animation, explode, timeline UI, `window.houseExplorer` hook. |
| `src/style.css`, `index.html` | Copied from `wood-house`, minus the "Our products only" button, plus a loading message. |

## Updating the house

The Blender source is not in this repo. It lives in the shared drive at `Design Exploration/wf-demos/wood-house/blender/`:

- `wf_framed_house.blend`: the model (every part separate, tagged by product).
- `build_house.py` (+ `roof_post.py`, `owt_template.py/.json`): rebuild the model from scratch; `MANUAL_EDITS.md` lists the hand edits it re-applies.
- `export_web_glb.py`: makes this page's GLB. In Blender, open the `.blend` and run it (or `blender -b wf_framed_house.blend --python export_web_glb.py -- framed-house.glb`), then copy the result to `public/framed-house.glb`. It merges parts and bakes the build timing and explode offsets; its `LAYERS` timing must stay in line with `src/timeline.js`.

## Notes

- Units are metres, y up. The page centres the house on the orbit pivot when it loads.
- Scenery (`foundation`, `site` gravel, `stairs`, `hardware` sill gasket) isn't selectable. Foundation and gravel always show; everything else drops in on the timeline.
- Selecting "Webstock for I-joists" highlights the whole I-joist (flanges included). The upper floor deliberately has both I-joists and open web trusses so both products can be shown.
- Concept model for illustration, not an engineered design.

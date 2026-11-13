// Timeline config: build timing, stage labels and footer timeline stops.
// Each part's start (`wf_stage`, 0–1) is baked into the GLB by the Blender export
// (export_web_glb.py LAYERS, STEP, CAP); keep the bands and stops below in line with it. Parts
// land by: ground floor .20, ground walls + stairs .40, upper floor .51, upper walls .65, wall
// sheathing .72, roof trusses .84, roof sheathing .96. Each stop sits where a layer has fully
// landed and the next hasn't started.

/** Seconds for the in-browser build animation, 0 → 100% (`tick()`). */
export const BUILD_SECONDS = 10;

/** Each part drops in over PART_RAMP of the timeline, from its `wf_stage`. */
export const PART_RAMP = 0.07;

/**
 * Stage bands in order. `label` shows while progress < `until` (0–1).
 * `button` / `stop` are the footer timeline button text and its `data-progress` (0–100).
 */
export const STAGES = [
  { until: 0.05, label: 'A solid foundation', button: 'Foundation', stop: 0 },
  { until: 0.205, label: 'The floor takes shape', button: 'Floors', stop: 20 },
  { until: 0.735, label: 'A framework for living', button: 'Walls', stop: 73 },
  { until: 0.855, label: 'Raising the roof', button: 'Roof', stop: 85 },
  { until: 0.999, label: 'Closing in the roof', button: 'Complete', stop: 100 },
];

/** Label once progress reaches the last band's `until`. */
export const COMPLETE_LABEL = 'The finished home';

export const stageLabel = (progress) =>
  STAGES.find((s) => progress < s.until)?.label ?? COMPLETE_LABEL;

// Timeline config: build timing, stage labels and footer timeline stops.
// Each part's start (`wf_stage`, 0–1) and build phase (`wf_phase`) are baked into the GLB by the
// Blender export (export_web_glb.py SEQUENCE, RAMP, CAP, LAYER_GAP, schedule()); keep PART_RAMP
// and the stops below in line with it. Products come in one at a time in the build order, floor
// level by floor level, a new one while the previous two or three are still landing, right across
// the phases. Each phase's last part lands at its stop: floors .281, walls and upper floor .826,
// roof trusses .889; roof sheathing starts at .819 and the last part lands at .973. A stage button
// also hides later phases' parts that are already on their way (main.js `upTo`).

/**
 * Show the "Watch the build" bar (play button, timeline, stage buttons). Off for now: the client
 * doesn't want the build animation, but may change their mind. Set to true to bring it back;
 * everything below still drives it.
 */
export const SHOW_BUILD = false;

/** Seconds for the in-browser build animation, 0 → 100% (`tick()`). */
export const BUILD_SECONDS = 6;

/** Each part drops in over PART_RAMP of the timeline, from its `wf_stage`. */
export const PART_RAMP = 0.1;

/**
 * Stage bands in order. `label` shows while progress < `until` (0–1).
 * `button` / `stop` are the footer timeline button text and its `data-progress` (0–100);
 * `phase` is the last build phase (`wf_phase`) a stage button shows.
 */
export const STAGES = [
  { until: 0.02, label: 'A solid foundation', button: 'Foundation', stop: 0, phase: -1 },
  { until: 0.282, label: 'The floor takes shape', button: 'Floors', stop: 28.1, phase: 0 },
  { until: 0.827, label: 'A framework for living', button: 'Walls', stop: 82.6, phase: 1 },
  { until: 0.89, label: 'Raising the roof', button: 'Roof', stop: 88.9, phase: 2 },
  { until: 0.999, label: 'Closing in the roof', button: 'Complete', stop: 100, phase: 3 },
];

/** Label once progress reaches the last band's `until`. */
export const COMPLETE_LABEL = 'The finished home';

export const stageLabel = (progress) =>
  STAGES.find((s) => progress < s.until)?.label ?? COMPLETE_LABEL;

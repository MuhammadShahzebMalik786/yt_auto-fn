/**
 * Maps a topic's backend pipeline stage to an overall completion percentage.
 *
 * The generation pipeline (see backend/main.py orchestrate_video_generation) runs:
 *   research -> director -> scenes -> assembly -> thumbnail -> publish
 *
 * Scene rendering is only the middle of that sequence, so progress must NOT be
 * computed as completed_scenes / total_scenes -- that reaches 100% while three
 * stages (assembly, thumbnail, publish) are still pending, which makes a running
 * job look finished and a stalled job indistinguishable from a done one.
 *
 * `current_step` strings are set by the backend, e.g.:
 *   "Researching", "Director Blueprinting", "Scene 3/8: Narration",
 *   "Scene 3/8: Video Assembly", "Master Assembly", "Generating Thumbnail",
 *   "Publishing to YouTube", "Published: <url>"
 */

// Scene work occupies this band; earlier stages sit below it, later stages above.
const SCENES_START = 20;
const SCENES_END = 70;

export function getPipelineProgress(
  currentStep: string | null | undefined,
  completedScenes: number,
  totalScenes: number,
  status?: string,
): number {
  if (status === "completed") return 100;

  const step = (currentStep || "").toLowerCase();

  if (step.startsWith("published")) return 100;
  if (step.includes("publishing")) return 95;
  if (step.includes("thumbnail")) return 85;
  if (step.includes("master assembly")) return 75;

  // Scene stage: scale within the scenes band by how many scenes are done.
  if (step.startsWith("scene") || completedScenes > 0) {
    if (totalScenes > 0) {
      const ratio = Math.min(completedScenes / totalScenes, 1);
      return Math.round(SCENES_START + ratio * (SCENES_END - SCENES_START));
    }
    return SCENES_START;
  }

  if (step.includes("director")) return 15;
  if (step.includes("research")) return 5;

  return 2; // queued / initializing
}

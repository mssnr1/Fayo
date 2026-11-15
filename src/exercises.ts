import type { FaceExercise } from '@anima-labs/design/engine'
import type { GuideArrow } from '@anima-labs/design/figure'

/** A face exercise plus the arrows that show which way its muscles pull (drawn while they work). */
export type FayoExercise = FaceExercise & {
  arrows: GuideArrow[]
  arrowsFollow: string
  /** The skin around the working muscle moves a little with it (without lighting up): area -> share of `by`. */
  follow: { by: string; areas: Record<string, number> }
}


// Resting eyes are drawn a little narrowed, so their opening wide while the brows lift reads clearly.
const EYES_REST = { orbicularisOculiLeft: 0.35, orbicularisOculiRight: 0.35 }
const LIFT = { frontalis: 1, 'orbicularisOculiLeft.open': 1, 'orbicularisOculiRight.open': 1 }

/**
 * "Brauen-Lift": the brow raiser (frontalis) works against the gentle resistance of the fingers, which
 * also hold the forehead skin smooth so no lines are pressed into it. The eyes open wide with it.
 */
export const BROW_LIFT: FayoExercise = {
  id: 'brow-lift',
  intro: [
    { label: 'Ankommen', cue: 'Zeigefinger waagerecht direkt unter die Augenbrauen legen. Schultern locker, Blick geradeaus.', durationMs: 5000, muscles: EYES_REST },
  ],
  steps: [
    { label: 'Heben', cue: 'Brauen gegen die Finger nach oben drücken, Augen weit öffnen.', durationMs: 3000, muscles: LIFT },
    { label: 'Halten', cue: 'Halten. Augen weit, Blick wach, Stirn bleibt glatt.', durationMs: 6000, muscles: LIFT, pulse: 0.12 },
    { label: 'Lösen', cue: 'Langsam loslassen.', durationMs: 3000, muscles: EYES_REST },
    { label: 'Pause', cue: 'Durchatmen.', durationMs: 3000, muscles: EYES_REST },
  ],
  repetitions: 8,
  outro: [
    { label: 'Ausstreichen', cue: 'Mit den Fingerspitzen von der Mitte der Stirn zu den Schläfen streichen.', durationMs: 8000, muscles: { frontalis: 0.25, temporalisLeft: 0.25, temporalisRight: 0.25 } },
  ],
  // World metres on the figure's left; each is mirrored to the right.
  arrows: [
    // The brow raiser pulls the forehead up.
    { from: [0.03, 1.64, 0.108], to: [0.03, 1.712, 0.085], bow: 0.012 },
    // The eye opens: upper lid up, lower lid down.
    { from: [0.033, 1.603, 0.1], to: [0.036, 1.642, 0.104], bow: 0.004 },
    { from: [0.033, 1.576, 0.097], to: [0.035, 1.55, 0.098], bow: 0.004 },
  ],
  arrowsFollow: 'frontalis',
  // As the forehead lifts, the skin around it is pulled along a little: the root of the nose and the
  // upper lip rise, the cheeks lift a touch, the temples tighten, the lips part a hair.
  follow: {
    by: 'frontalis',
    areas: {
      nasalis: 0.45,
      levatorLabiiLeft: 0.3,
      levatorLabiiRight: 0.3,
      zygomaticusLeft: 0.18,
      zygomaticusRight: 0.18,
      temporalisLeft: 0.4,
      temporalisRight: 0.4,
      orbicularisOris: 0.1,
      mentalis: 0.08,
    },
  },
}

/** The start screen shows the exercise once, step by step, in a loop. */
export const BROW_LIFT_DEMO: FaceExercise = {
  id: 'brow-lift-demo',
  steps: [
    { label: '1 · Anlegen', cue: 'Zeigefinger waagerecht unter die Augenbrauen legen.', durationMs: 3200, muscles: EYES_REST },
    { label: '2 · Heben', cue: 'Brauen gegen die Finger hochdrücken, Augen weit.', durationMs: 2600, muscles: LIFT },
    { label: '3 · Halten', cue: 'Halten, die Stirn bleibt glatt.', durationMs: 3200, muscles: LIFT, pulse: 0.12 },
    { label: '4 · Lösen', cue: 'Langsam loslassen.', durationMs: 3000, muscles: EYES_REST },
  ],
  repetitions: 1,
}

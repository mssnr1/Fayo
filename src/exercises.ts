import type { FaceExercise } from '@anima-labs/design/engine'
import type { GuideArrow } from '@anima-labs/design/figure'

/** A face exercise plus the arrows that show which way its muscles pull (drawn while they work). */
export type FayoExercise = FaceExercise & { arrows: GuideArrow[]; arrowsFollow: string }

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
    { from: [0.03, 1.64, 0.108], to: [0.03, 1.703, 0.088], bow: 0.012 },
    // The eye opens: upper lid up, lower lid down.
    { from: [0.033, 1.603, 0.1], to: [0.036, 1.63, 0.104], bow: 0.004 },
    { from: [0.033, 1.576, 0.097], to: [0.035, 1.55, 0.098], bow: 0.004 },
  ],
  arrowsFollow: 'frontalis',
}

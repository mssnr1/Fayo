import type { FaceExercise } from '@anima-labs/design/engine'
import type { GuideArrow } from '@anima-labs/design/figure'

/** A face exercise plus the arrows that show which way its muscles pull (drawn while they work). */
export type FayoExercise = FaceExercise & {
  /** Name, how long, what it does and a safety line, as shown on the card and the start sheet. */
  title: string
  /** What it is for, and a sentence for the card. */
  target: string
  blurb: string
  minutes: string
  lead: string
  fine: string
  /** Picture of the 3D exercise on its card: `public/<card>-dark.png` and `-light.png`. */
  card: string
  /** The exercise shown once, step by step, on its start sheet. */
  demo: FaceExercise
  /** Height (world metres) the camera centres on while the exercise runs: brows, eyes or cheeks. */
  focus: number
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
  title: 'Brauen-Lift',
  target: 'Stirn & Brauen',
  blurb: 'Brauen gegen die Finger heben, die Stirn bleibt glatt.',
  minutes: '2½ Minuten',
  lead: 'Trainiert den Stirnmuskel, der die Augenbrauen hebt, für einen wacheren Blick.',
  fine: '8 Wiederholungen. Bei Schmerzen oder Spannungskopfschmerz abbrechen.',
  card: 'cards/brow-lift',
  get demo() {
    return BROW_LIFT_DEMO
  },
  focus: 1.6,
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

// ---------------------------------------------------------------------------------------------------

const SQUINT = { orbicularisOculiLeft: 0.6, orbicularisOculiRight: 0.6 }

/**
 * "Augen-Glätter" (against crow's feet): the ring muscle round the eye draws the lower lids up while two
 * fingers hold the skin at the outer corners smooth, so the muscle works without folding the skin there.
 * Whether exercises lessen crow's feet is barely studied; the aim is a strong, relaxed eye ring.
 */
export const EYE_SMOOTHER: FayoExercise = {
  id: 'eye-smoother',
  title: 'Augen-Glätter',
  target: 'Krähenfüße',
  blurb: 'Unterlider hochziehen, die Finger halten die Augenwinkel glatt.',
  minutes: '2 Minuten',
  lead: 'Kräftigt den Ringmuskel ums Auge, während deine Finger die Haut an den Augenwinkeln glatt halten. Gegen Krähenfüße.',
  fine: '10 Wiederholungen. Nur leicht halten, nicht ziehen. Ob Übungen Fältchen sichtbar mindern, ist kaum erforscht.',
  card: 'cards/eye-smoother',
  get demo() {
    return EYE_SMOOTHER_DEMO
  },
  focus: 1.585,
  intro: [
    { label: 'Ankommen', cue: 'Zeige- und Mittelfinger als V an die äußeren Augenwinkel legen, die Haut dort sanft glatt halten.', durationMs: 5000, muscles: {} },
  ],
  steps: [
    { label: 'Anspannen', cue: 'Unterlider nach oben ziehen, als würdest du kräftig blinzeln. Blick nach oben.', durationMs: 2500, muscles: SQUINT },
    { label: 'Halten', cue: 'Halten. Die Finger halten die Haut glatt, die Stirn bleibt locker.', durationMs: 5000, muscles: SQUINT, pulse: 0.12 },
    { label: 'Lösen', cue: 'Langsam öffnen und loslassen.', durationMs: 2500, muscles: {} },
    { label: 'Pause', cue: 'Durchatmen.', durationMs: 2000, muscles: {} },
  ],
  repetitions: 10,
  outro: [
    { label: 'Ausstreichen', cue: 'Mit den Ringfingern sanft unter den Augen von innen nach außen zu den Schläfen streichen.', durationMs: 8000, muscles: { orbicularisOculiLeft: 0.15, orbicularisOculiRight: 0.15 } },
  ],
  arrows: [
    // The outer part of the ring draws the skin at the corner toward the eye.
    { from: [0.066, 1.592, 0.064], to: [0.054, 1.59, 0.082], bow: 0.006 },
    // The lower lid rises.
    { from: [0.033, 1.552, 0.1], to: [0.033, 1.575, 0.104], bow: 0.004 },
  ],
  arrowsFollow: 'orbicularisOculiLeft',
  // Squeezing the eyes lifts the cheeks a little and draws the temples in.
  follow: {
    by: 'orbicularisOculiLeft',
    areas: { zygomaticusLeft: 0.25, zygomaticusRight: 0.25, temporalisLeft: 0.2, temporalisRight: 0.2, levatorLabiiLeft: 0.15, levatorLabiiRight: 0.15 },
  },
}

export const EYE_SMOOTHER_DEMO: FaceExercise = {
  id: 'eye-smoother-demo',
  steps: [
    { label: '1 · Anlegen', cue: 'Zwei Finger als V an die äußeren Augenwinkel.', durationMs: 3200, muscles: {} },
    { label: '2 · Anspannen', cue: 'Unterlider hochziehen, Blick nach oben.', durationMs: 2400, muscles: SQUINT },
    { label: '3 · Halten', cue: 'Halten, die Haut bleibt glatt.', durationMs: 3200, muscles: SQUINT, pulse: 0.12 },
    { label: '4 · Lösen', cue: 'Langsam loslassen.', durationMs: 2800, muscles: {} },
  ],
  repetitions: 1,
}

const SMILE = { zygomaticusLeft: 1, zygomaticusRight: 1, levatorLabiiLeft: 0.4, levatorLabiiRight: 0.4, orbicularisOculiLeft: 0.3, orbicularisOculiRight: 0.3 }

/**
 * "Wangen-Lift" (cheekbones): the smiling muscles (zygomaticus) draw the corners of the mouth up and back
 * toward the cheekbones with the lips closed, and the cheeks rise under the fingertips. In a small study
 * (Alam et al., JAMA Dermatology 2018) the cheeks looked a little fuller after 20 weeks of face exercises.
 */
export const CHEEK_LIFT: FayoExercise = {
  id: 'cheek-lift',
  title: 'Wangen-Lift',
  target: 'Wangenknochen',
  blurb: 'Mit geschlossenen Lippen lächeln, die Wangen heben sich.',
  minutes: '2 Minuten',
  lead: 'Trainiert die Lachmuskeln, die Mundwinkel und Wangen zu den Wangenknochen heben. Für eine vollere Wangenpartie.',
  fine: '10 Wiederholungen. Kiefer locker lassen. In einer kleinen Studie wurden die Wangen nach 20 Wochen Training etwas voller.',
  card: 'cards/cheek-lift',
  get demo() {
    return CHEEK_LIFT_DEMO
  },
  focus: 1.56,
  intro: [
    { label: 'Ankommen', cue: 'Fingerspitzen locker auf die Wangenknochen legen. Lippen geschlossen, Zähne nicht aufeinander.', durationMs: 5000, muscles: {} },
  ],
  steps: [
    { label: 'Lächeln', cue: 'Mit geschlossenen Lippen breit lächeln, die Mundwinkel schräg zu den Wangenknochen ziehen.', durationMs: 2500, muscles: SMILE },
    { label: 'Halten', cue: 'Halten. Die Wangen heben sich unter den Fingern, die Stirn bleibt glatt.', durationMs: 5000, muscles: SMILE, pulse: 0.12 },
    { label: 'Lösen', cue: 'Langsam loslassen.', durationMs: 2500, muscles: {} },
    { label: 'Pause', cue: 'Durchatmen.', durationMs: 2000, muscles: {} },
  ],
  repetitions: 10,
  outro: [
    { label: 'Ausstreichen', cue: 'Mit den Handflächen sanft von den Mundwinkeln über die Wangen zu den Schläfen streichen.', durationMs: 8000, muscles: { zygomaticusLeft: 0.2, zygomaticusRight: 0.2 } },
  ],
  arrows: [
    // The smiling muscle draws the corner of the mouth up and back to the cheekbone.
    { from: [0.034, 1.51, 0.094], to: [0.062, 1.566, 0.082], bow: 0.01 },
  ],
  arrowsFollow: 'zygomaticusLeft',
  // A smile lifts the nose wings and the chin a touch, and the jaw and temples firm a little.
  follow: {
    by: 'zygomaticusLeft',
    areas: { nasalis: 0.15, masseterLeft: 0.2, masseterRight: 0.2, mentalis: 0.1, temporalisLeft: 0.15, temporalisRight: 0.15 },
  },
}

export const CHEEK_LIFT_DEMO: FaceExercise = {
  id: 'cheek-lift-demo',
  steps: [
    { label: '1 · Anlegen', cue: 'Fingerspitzen auf die Wangenknochen, Lippen zu.', durationMs: 3200, muscles: {} },
    { label: '2 · Lächeln', cue: 'Mundwinkel schräg nach oben zu den Wangenknochen.', durationMs: 2400, muscles: SMILE },
    { label: '3 · Halten', cue: 'Halten, die Wangen heben sich.', durationMs: 3200, muscles: SMILE, pulse: 0.12 },
    { label: '4 · Lösen', cue: 'Langsam loslassen.', durationMs: 2800, muscles: {} },
  ],
  repetitions: 1,
}

const STRETCH = {
  jaw: 1,
  orbicularisOris: 0.7,
  'zygomaticusLeft.down': 1,
  'zygomaticusRight.down': 1,
  'levatorLabiiLeft.down': 1,
  'levatorLabiiRight.down': 1,
  masseterLeft: 0.6,
  masseterRight: 0.6,
}

/**
 * "Gesichts-Stretch" (warm-up): the mouth opens wide with the lips rounded to an O, the cheeks and the
 * upper lip are drawn down and the jaw hangs long, which stretches the lifting muscles of the mid face.
 */
export const FACE_STRETCH: FayoExercise = {
  id: 'face-stretch',
  title: 'Gesichts-Stretch',
  target: 'Aufwärmen',
  blurb: 'Mund weit zum O öffnen, Wangen und Oberlippe nach unten ziehen.',
  minutes: '1 Minute',
  lead: 'Dehnt Wangen, Oberlippe und Kiefer: Mund weit zu einem O öffnen und das Gesicht sanft lang nach unten ziehen. Gut vor den anderen Übungen.',
  fine: '5 Wiederholungen. Nur so weit öffnen, wie es angenehm ist. Bei Kiefergelenksbeschwerden weglassen.',
  card: 'cards/face-stretch',
  get demo() {
    return FACE_STRETCH_DEMO
  },
  focus: 1.535,
  intro: [{ label: 'Ankommen', cue: 'Schultern locker, Kiefer locker, Zunge liegt entspannt.', durationMs: 4000, muscles: {} }],
  steps: [
    { label: 'Öffnen', cue: 'Mund weit öffnen und die Lippen zu einem O formen.', durationMs: 2500, muscles: STRETCH },
    { label: 'Ziehen', cue: 'Wangen und Oberlippe nach unten ziehen, das Gesicht wird lang. Halten.', durationMs: 5000, muscles: STRETCH, pulse: 0.1 },
    { label: 'Lösen', cue: 'Langsam schließen und locker lassen.', durationMs: 2500, muscles: {} },
    { label: 'Pause', cue: 'Durchatmen.', durationMs: 2000, muscles: {} },
  ],
  repetitions: 5,
  arrows: [
    // The cheeks and the upper lip are drawn down, the jaw drops.
    { from: [0.056, 1.578, 0.082], to: [0.054, 1.536, 0.088], bow: 0.006 },
    { from: [0.013, 1.548, 0.1], to: [0.013, 1.526, 0.102], bow: 0.004 },
    { from: [0, 1.488, 0.098], to: [0, 1.452, 0.09], bow: 0.006, single: true },
  ],
  arrowsFollow: 'jaw',
  follow: { by: 'jaw', areas: { mentalis: 0.4, nasalis: 0.2, buccinatorLeft: 0.4, buccinatorRight: 0.4 } },
}

export const FACE_STRETCH_DEMO: FaceExercise = {
  id: 'face-stretch-demo',
  steps: [
    { label: '1 · Locker', cue: 'Kiefer und Schultern locker.', durationMs: 2600, muscles: {} },
    { label: '2 · Öffnen', cue: 'Mund weit zum O öffnen.', durationMs: 2400, muscles: STRETCH },
    { label: '3 · Ziehen', cue: 'Wangen und Oberlippe nach unten, halten.', durationMs: 3200, muscles: STRETCH, pulse: 0.1 },
    { label: '4 · Lösen', cue: 'Langsam schließen.', durationMs: 2600, muscles: {} },
  ],
  repetitions: 1,
}

/** All exercises, in the order of the overview: the warm-up first. */
export const EXERCISES: FayoExercise[] = [FACE_STRETCH, BROW_LIFT, EYE_SMOOTHER, CHEEK_LIFT]

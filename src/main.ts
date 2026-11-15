import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js'
import modelUrl from '@anima-labs/design/models/atmen-anatomy.glb?url'
import { faceExerciseDuration, facePose } from '@anima-labs/design/engine'
import { FACE_MOVES, FACE_PALETTES, faceActivation, faceMuscleMaterial, faceMuscleRig, guideArrows, makeStripeMaterials, muscleHead, STRIPE_PALETTES } from '@anima-labs/design/figure'
import { BROW_LIFT, BROW_LIFT_DEMO } from './exercises'

/**
 * Fayo: one guided exercise (Brauen-Lift) on the shared figure. The face map lights and moves the
 * muscle the step is about; the text guides. Everything runs in the page, nothing is stored but the look.
 */
const $ = (id: string) => document.getElementById(id)!
const root = document.documentElement
const read = (k: string) => {
  try {
    return localStorage.getItem(k)
  } catch {
    return null
  }
}
let dark = read('fayo-theme') !== 'light'

const renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.setPixelRatio(Math.min(devicePixelRatio, 2))
renderer.autoClear = false
$('stage').appendChild(renderer.domElement)
const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(28, 1, 0.01, 10)
const activation = faceActivation()

const loader = new GLTFLoader()
loader.setMeshoptDecoder(MeshoptDecoder)
const gltf = await loader.loadAsync(modelUrl)
const model = gltf.scene
model.updateMatrixWorld(true)
const skins: THREE.Mesh[] = []
const faces: THREE.Mesh[] = []
const depths: THREE.Mesh[] = []
const rigged: THREE.Mesh[] = []
model.traverse((o) => {
  const mesh = o as THREE.Mesh
  if (!mesh.isMesh) return
  if (!['Head', 'Body_Shell', 'Arms'].includes(mesh.name)) {
    mesh.visible = false
    return
  }
  if (mesh.name === 'Head') {
    mesh.geometry = muscleHead(mesh)
    mesh.updateMorphTargets()
    rigged.push(mesh)
  }
  ;(mesh.name === 'Arms' ? skins : faces).push(mesh)
  mesh.renderOrder = 0.2
  const depth = mesh.clone(false)
  depth.renderOrder = 0.1
  depths.push(depth)
  if (mesh.name === 'Head') rigged.push(depth)
})
depths.forEach((d) => model.add(d))
scene.add(model)
// Movements a little larger than life, so it is clear on a phone what to do.
const rig = faceMuscleRig(activation, rigged, 1.3)
let arrows: ReturnType<typeof guideArrows> | null = null

function applyTheme() {
  root.classList.toggle('dark', dark)
  document.querySelector('meta[name=theme-color]')!.setAttribute('content', dark ? '#0d1120' : '#fbfbf9')
  $('theme').textContent = dark ? '☀︎' : '☾'
  renderer.setClearColor(dark ? 0x0d1120 : 0xfbfbf9, 1)
  const face = faceMuscleMaterial({ palette: FACE_PALETTES[dark ? 'dark' : 'light'], dark, activation })
  // By day the figure takes a soft rim, as at night, instead of a drawn ink outline.
  const skin = dark ? STRIPE_PALETTES.dark : { ...STRIPE_PALETTES.light, bodyRim: FACE_PALETTES.light.bodyRim }
  const stripes = makeStripeMaterials(skin, dark, { value: 99 }, undefined, undefined, undefined, undefined, { softRim: true })
  faces.forEach((m) => (m.material = face))
  skins.forEach((m) => (m.material = stripes.skin))
  depths.forEach((m) => (m.material = stripes.skinDepth))
  if (arrows) {
    scene.remove(arrows.group)
    arrows.dispose()
  }
  arrows = guideArrows(BROW_LIFT.arrows, dark ? { color: '#ffd6e4', color2: '#ffd8b0', glow: true } : { color: '#10bf9c', color2: '#3a8fe8' })
  scene.add(arrows.group)
}
applyTheme()
$('theme').onclick = () => {
  dark = !dark
  try {
    localStorage.setItem('fayo-theme', dark ? 'dark' : 'light')
  } catch {
    // Only a convenience.
  }
  applyTheme()
}

// Framing: the head between `top` and `bottom` (fractions of the screen from the top), above the guide.
const HEAD = new THREE.Vector3(0, 1.6, 0.01)
const COACH_AT = new THREE.Vector3(0, 1.735, 0.06)
const band = { top: 0.08, bottom: 0.5 }
function frame(yaw: number, want: { top: number; bottom: number }) {
  band.top += (want.top - band.top) * 0.06
  band.bottom += (want.bottom - band.bottom) * 0.06
  const w = innerWidth
  const h = innerHeight
  renderer.setSize(w, h, false)
  renderer.setViewport(0, 0, w, h)
  camera.aspect = w / h
  const half = THREE.MathUtils.degToRad(camera.fov / 2)
  // Head with a little air: 0.3 m tall, 0.26 m wide.
  const visibleH = Math.max(0.3 / (band.bottom - band.top), 0.26 / camera.aspect)
  const dist = visibleH / 2 / Math.tan(half)
  const lookY = HEAD.y - visibleH * (0.5 - (band.top + band.bottom) / 2)
  camera.position.set(Math.sin(yaw) * dist, lookY + 0.03, HEAD.z + Math.cos(yaw) * dist)
  camera.lookAt(0, lookY, HEAD.z)
  camera.updateProjectionMatrix()
  camera.updateMatrixWorld()
  // The instruction stands just above the head, where the arrows point.
  const p = COACH_AT.clone().project(camera)
  const coach = $('coach')
  coach.style.top = `${Math.max(64, ((1 - p.y) / 2) * h - coach.offsetHeight)}px`
}

// The session.
type State = 'start' | 'run' | 'done'
let state: State = 'start'
let elapsed = 0
let paused = false
let last = performance.now()
let lastStep = ''
const total = faceExerciseDuration(BROW_LIFT)
let wake: { release(): Promise<void> } | null = null

function show(s: State) {
  state = s
  for (const id of ['start', 'run', 'done']) $(id).classList.toggle('hidden', id !== s)
  $('coach').classList.toggle('hidden', s === 'done')
}
async function begin() {
  elapsed = 0
  paused = false
  lastStep = ''
  $('pause').textContent = 'Pause'
  show('run')
  try {
    wake = await (navigator as unknown as { wakeLock: { request(t: string): Promise<{ release(): Promise<void> }> } }).wakeLock.request('screen')
  } catch {
    wake = null
  }
}
function finish() {
  show('done')
  for (const id of FACE_MOVES) rig.set(id, 0)
  wake?.release().catch(() => {})
  wake = null
}
$('go').onclick = begin
$('again').onclick = begin
$('stop').onclick = () => {
  show('start')
  for (const id of FACE_MOVES) rig.set(id, 0)
}
$('pause').onclick = () => {
  paused = !paused
  $('pause').textContent = paused ? 'Weiter' : 'Pause'
}
const go = $('go') as HTMLButtonElement
go.disabled = false
go.textContent = 'Starten'

const demoTotal = faceExerciseDuration(BROW_LIFT_DEMO)
/** The neighbouring skin moves along with the working muscle. */
function follow(muscles: Record<string, number>) {
  const k = muscles[BROW_LIFT.follow.by] ?? 0
  for (const [id, share] of Object.entries(BROW_LIFT.follow.areas)) rig.follow(id, share * k)
}

function tick(now: number) {
  const dt = Math.min(now - last, 1000)
  last = now
  const t = now / 1000
  if (state === 'run') {
    if (!paused) elapsed += dt
    const pose = facePose(BROW_LIFT, elapsed)
    for (const id of FACE_MOVES) rig.set(id, pose.muscles[id] ?? 0)
    follow(pose.muscles)
    const left = Math.ceil(((1 - pose.stepProgress) * pose.step.durationMs) / 1000)
    const grow = pose.muscles[BROW_LIFT.arrowsFollow] ?? 0
    arrows?.update(grow, Math.min(1, grow * 3), t)
    $('step').textContent = pose.step.label
    $('cue').textContent = pose.step.cue ?? ''
    $('count').textContent = paused ? 'Pause' : `${left} s`
    $('rep').textContent = pose.repetition >= 0 ? `${pose.repetition + 1} von ${BROW_LIFT.repetitions}` : ''
    ;($('progress') as HTMLElement).style.width = `${(elapsed / total) * 100}%`
    const key = `${pose.repetition}-${pose.step.label}`
    if (key !== lastStep) {
      if (lastStep) navigator.vibrate?.(30)
      lastStep = key
    }
    if (pose.done) finish()
  } else if (state === 'start') {
    // Waiting: the figure shows the exercise step by step, in a loop.
    const pose = facePose(BROW_LIFT_DEMO, now % demoTotal)
    for (const id of FACE_MOVES) rig.set(id, pose.muscles[id] ?? 0)
    follow(pose.muscles)
    const grow = pose.muscles[BROW_LIFT.arrowsFollow] ?? 0
    arrows?.update(grow, Math.min(1, grow * 3), t)
    $('step').textContent = pose.step.label
    $('cue').textContent = pose.step.cue ?? ''
  } else {
    arrows?.update(0, 0, t)
    follow({})
  }
  frame(Math.sin(t * 0.35) * (state === 'run' ? 0.12 : 0.22), state === 'run' ? { top: 0.27, bottom: 0.77 } : { top: 0.22, bottom: 0.56 })
  renderer.clear()
  renderer.render(scene, camera)
  requestAnimationFrame(tick)
}
requestAnimationFrame(tick)
;(window as unknown as { ready: boolean }).ready = true

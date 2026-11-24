import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js'
import modelUrl from '@anima-labs/design/models/atmen-anatomy.glb?url'
import { faceExerciseDuration, facePose } from '@anima-labs/design/engine'
import { FACE_MOVES, FACE_PALETTES, faceActivation, faceMuscleMaterial, faceMuscleRig, guideArrows, guideHands, makeStripeMaterials, muscleHead, STRIPE_PALETTES } from '@anima-labs/design/figure'
import { EXERCISES, type FayoExercise } from './exercises'

/**
 * Fayo: guided face exercises on the shared figure, chosen from an overview of cards. The face map lights and moves the
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
let hands: ReturnType<typeof guideHands> | null = null
const base = import.meta.env.BASE_URL
const params = new URLSearchParams(location.search)
let ex: FayoExercise = EXERCISES.find((e) => e.id === params.get('ex')) ?? EXERCISES[0]

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
  arrows = guideArrows(ex.arrows, dark ? { color: '#ffd6e4', color2: '#ffd8b0', glow: true } : { color: '#10bf9c', color2: '#3a8fe8' })
  scene.add(arrows.group)
  if (hands) {
    scene.remove(hands.group)
    hands.dispose()
  }
  // The hands, where an exercise uses them, in the figure's own look (by day quiet grey, at night a glow).
  hands = ex.hands ? guideHands(ex.hands, dark ? { line: '#b3a6ff', fill: '#3d3aa6', glow: true } : { line: '#9ea3b5', fill: '#ffffff', fillAlpha: 0.8 }) : null
  if (hands) scene.add(hands.group)
  document.querySelectorAll<HTMLImageElement>('img[data-card]').forEach((img) => (img.src = `${img.dataset.card}-${dark ? 'dark' : 'light'}.png`))
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
const HEAD = new THREE.Vector3(0, ex.focus, 0.01)
const COACH_AT = new THREE.Vector3(0, 1.735, 0.06)
const band = { top: 0.08, bottom: 0.5 }
/** The person's own view: drag to turn, pinch or wheel to zoom, two fingers to pan, double tap to reset. */
const view = { yaw: 0, pitch: 0, zoom: 1, panX: 0, panY: 0, held: false, touched: 0 }
{
  const el = renderer.domElement
  const pts = new Map<number, { x: number; y: number }>()
  let last = 0
  const clamp = (v: number, a: number, b: number) => Math.min(Math.max(v, a), b)
  const centre = () => {
    const a = [...pts.values()]
    return { x: a.reduce((s, p) => s + p.x, 0) / a.length, y: a.reduce((s, p) => s + p.y, 0) / a.length }
  }
  const spread = () => {
    const [a, b] = [...pts.values()]
    return b ? Math.hypot(a.x - b.x, a.y - b.y) : 0
  }
  let prev = { x: 0, y: 0 }
  let prevSpread = 0
  const reset = () => Object.assign(view, { yaw: 0, pitch: 0, zoom: 1, panX: 0, panY: 0, held: false })
  el.addEventListener('pointerdown', (e) => {
    el.setPointerCapture(e.pointerId)
    pts.set(e.pointerId, { x: e.clientX, y: e.clientY })
    prev = centre()
    prevSpread = spread()
    if (pts.size === 1) {
      const now = performance.now()
      if (now - last < 300) reset()
      last = now
    }
  })
  el.addEventListener('pointermove', (e) => {
    if (!pts.has(e.pointerId)) return
    pts.set(e.pointerId, { x: e.clientX, y: e.clientY })
    const c = centre()
    const dx = c.x - prev.x
    const dy = c.y - prev.y
    const h = innerHeight
    if (pts.size === 1 && !e.shiftKey && e.button !== 2 && !(e.buttons & 2)) {
      view.yaw = clamp(view.yaw - (dx / h) * 3, -Math.PI * 0.95, Math.PI * 0.95)
      view.pitch = clamp(view.pitch + (dy / h) * 2, -0.9, 0.9)
    } else {
      view.panX += dx / h
      view.panY += dy / h
      const s = spread()
      if (s && prevSpread) view.zoom = clamp(view.zoom * (prevSpread / s), 0.35, 3)
      prevSpread = s
    }
    view.panX = clamp(view.panX, -1, 1)
    view.panY = clamp(view.panY, -1, 1)
    view.held = true
    prev = c
  })
  const up = (e: PointerEvent) => {
    pts.delete(e.pointerId)
    prev = pts.size ? centre() : prev
    prevSpread = spread()
  }
  el.addEventListener('pointerup', up)
  el.addEventListener('pointercancel', up)
  el.addEventListener('contextmenu', (e) => e.preventDefault())
  el.addEventListener('wheel', (e) => {
    e.preventDefault()
    view.zoom = clamp(view.zoom * Math.exp(e.deltaY * 0.0015), 0.35, 3)
    view.held = true
  }, { passive: false })
  el.addEventListener('dblclick', reset)
}

function frame(yaw: number, want: { top: number; bottom: number }) {
  band.top += (want.top - band.top) * 0.06
  band.bottom += (want.bottom - band.bottom) * 0.06
  HEAD.y += (ex.focus - HEAD.y) * 0.06
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
  // The person's own view on top: turn, tilt, zoom and pan; the gentle sway fades while they hold a view.
  const sway = 1 - view.touched
  view.touched += ((view.held ? 1 : 0) - view.touched) * 0.08
  const turn = yaw * sway + view.yaw
  const r = dist * view.zoom
  const target = new THREE.Vector3(0, lookY, HEAD.z)
  camera.position.set(
    Math.sin(turn) * Math.cos(view.pitch) * r,
    lookY + 0.03 + Math.sin(view.pitch) * r,
    HEAD.z + Math.cos(turn) * Math.cos(view.pitch) * r,
  )
  camera.lookAt(target)
  camera.updateMatrixWorld()
  const right = new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld, 0)
  const up = new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld, 1)
  const shift = right.multiplyScalar(-view.panX * visibleH * view.zoom).add(up.multiplyScalar(view.panY * visibleH * view.zoom))
  camera.position.add(shift)
  camera.lookAt(target.add(shift))
  camera.updateProjectionMatrix()
  camera.updateMatrixWorld()
  // The instruction stands just above the head, where the arrows point.
  const p = COACH_AT.clone().project(camera)
  const coach = $('coach')
  coach.style.top = `${Math.max(64, ((1 - p.y) / 2) * h - coach.offsetHeight)}px`
}

// The session.
type State = 'overview' | 'start' | 'run' | 'done'
let state: State = 'overview'
let elapsed = 0
let paused = false
let last = performance.now()
let lastStep = ''
let total = faceExerciseDuration(ex)
let demoTotal = faceExerciseDuration(ex.demo)
let demoFrom = 0
let wake: { release(): Promise<void> } | null = null

function show(s: State) {
  state = s
  for (const id of ['overview', 'start', 'run', 'done']) $(id).classList.toggle('hidden', id !== s)
  $('coach').classList.toggle('hidden', s === 'done' || s === 'overview')
}
function rest() {
  for (const id of FACE_MOVES) rig.set(id, 0)
  follow({})
}
/** Opens an exercise's start sheet: its figure shows it once, step by step, in a loop. */
function choose(next: FayoExercise) {
  rest()
  ex = next
  total = faceExerciseDuration(ex)
  demoTotal = faceExerciseDuration(ex.demo)
  demoFrom = performance.now()
  $('ex-title').textContent = ex.title
  $('ex-minutes').textContent = `${ex.target} · ${ex.minutes}`
  $('ex-lead').textContent = ex.lead
  $('ex-fine').textContent = ex.fine
  document.title = `Fayo · ${ex.title}`
  applyTheme()
  show('start')
}
function overview() {
  rest()
  document.title = 'Fayo · Gesichtsübungen'
  show('overview')
}
for (const e of EXERCISES) {
  const card = document.createElement('button')
  card.className = 'card'
  card.innerHTML = `<img alt="" data-card="${base}${e.card}"><div><p class="what"></p><h3></h3><p class="blurb"></p></div>`
  card.querySelector('.what')!.textContent = `${e.target} · ${e.minutes}`
  card.querySelector('h3')!.textContent = e.title
  card.querySelector('.blurb')!.textContent = e.blurb
  card.querySelector('img')!.src = `${base}${e.card}-${dark ? 'dark' : 'light'}.png`
  card.onclick = () => choose(e)
  $('cards').appendChild(card)
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
  rest()
  wake?.release().catch(() => {})
  wake = null
}
$('go').onclick = begin
$('again').onclick = begin
$('home').onclick = overview
$('back').onclick = overview
$('stop').onclick = () => choose(ex)
$('pause').onclick = () => {
  paused = !paused
  $('pause').textContent = paused ? 'Weiter' : 'Pause'
}
const go = $('go') as HTMLButtonElement
go.disabled = false
go.textContent = 'Starten'

/** How strongly the arrows' muscle works at most in the exercise: the arrows are drawn full there. */
const peak = () => Math.max(1e-3, ...ex.steps.map((st) => st.muscles[ex.arrowsFollow] ?? 0))
/** The neighbouring skin moves along with the working muscle. */
function follow(muscles: Record<string, number>) {
  const k = muscles[ex.follow.by] ?? 0
  for (const [id, share] of Object.entries(ex.follow.areas)) rig.follow(id, share * k)
}

function tick(now: number) {
  const dt = Math.min(now - last, 1000)
  last = now
  const t = now / 1000
  if (state === 'run') {
    if (!paused) elapsed += dt
    const pose = facePose(ex, elapsed)
    for (const id of FACE_MOVES) rig.set(id, pose.muscles[id] ?? 0)
    follow(pose.muscles)
    const left = Math.ceil(((1 - pose.stepProgress) * pose.step.durationMs) / 1000)
    const grow = Math.min(1, (pose.muscles[ex.arrowsFollow] ?? 0) / peak())
    arrows?.update(grow, Math.min(1, grow * 3), t)
    hands?.update(grow, 1)
    $('step').textContent = pose.step.label
    $('cue').textContent = pose.step.cue ?? ''
    $('count').textContent = paused ? 'Pause' : `${left} s`
    $('rep').textContent = pose.repetition >= 0 ? `${pose.repetition + 1} von ${ex.repetitions}` : ''
    ;($('progress') as HTMLElement).style.width = `${(elapsed / total) * 100}%`
    const key = `${pose.repetition}-${pose.step.label}`
    if (key !== lastStep) {
      if (lastStep) navigator.vibrate?.(30)
      lastStep = key
    }
    if (pose.done) finish()
  } else if (state === 'start') {
    // Waiting: the figure shows the exercise step by step, in a loop.
    const pose = facePose(ex.demo, (now - demoFrom) % demoTotal)
    for (const id of FACE_MOVES) rig.set(id, pose.muscles[id] ?? 0)
    follow(pose.muscles)
    const grow = Math.min(1, (pose.muscles[ex.arrowsFollow] ?? 0) / peak())
    arrows?.update(grow, Math.min(1, grow * 3), t)
    hands?.update(grow, 1)
    $('step').textContent = pose.step.label
    $('cue').textContent = pose.step.cue ?? ''
  } else {
    arrows?.update(0, 0, t)
    hands?.update(0, 0)
  }
  frame(Math.sin(t * 0.35) * (state === 'run' ? 0.12 : 0.22), state === 'run' ? { top: 0.27, bottom: 0.77 } : { top: 0.22, bottom: 0.56 })
  renderer.clear()
  renderer.render(scene, camera)
  requestAnimationFrame(tick)
}
requestAnimationFrame(tick)
;(window as unknown as { ready: boolean }).ready = true

// A link can open one exercise directly (?ex=cheek-lift), and ?run starts it (for the card pictures).
show('overview')
if (params.get('ex')) choose(ex)
if (params.has('run')) begin()

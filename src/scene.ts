import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { projects } from './projects';

type Voxel = { x: number; y: number; z: number; w: number; h: number; d: number; color: string };
type SceneOptions = { onSelect: (id: string) => void; onHover: (id: string | null) => void; reducedMotion: boolean };

// All models are built here from boxes. No external models or textures are loaded.
class VoxelModel {
  voxels: Voxel[] = [];
  box(x: number, y: number, z: number, w: number, h: number, d: number, color: string) {
    this.voxels.push({ x, y, z, w, h, d, color });
    return this;
  }
  build(parent: THREE.Object3D, sharedGeometry: THREE.BoxGeometry) {
    const palette = new Map<string, Voxel[]>();
    this.voxels.forEach(v => { const list = palette.get(v.color) ?? []; list.push(v); palette.set(v.color, list); });
    const transform = new THREE.Object3D();
    for (const [color, voxels] of palette) {
      const material = new THREE.MeshStandardMaterial({ color, roughness: 1, metalness: 0 });
      const mesh = new THREE.InstancedMesh(sharedGeometry, material, voxels.length);
      voxels.forEach((v, i) => {
        transform.position.set(v.x, v.y, v.z);
        transform.scale.set(v.w, v.h, v.d);
        transform.updateMatrix();
        mesh.setMatrixAt(i, transform.matrix);
      });
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      parent.add(mesh);
    }
  }
}

function randomSource(seed: number) {
  return () => {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

const stone = ['#747e79', '#65716e', '#828980', '#596865'];
const soil = ['#252e32', '#2b3638', '#35403f', '#3c4641', '#303a39'];
const iron = '#252e33';
const bone = '#ded7bc';
const coat = '#222830';

function makeTree(model: VoxelModel, x: number, z: number, scale: number, mirror: number) {
  const wood = ['#41423e', '#4b4b43', '#535146'];
  const b = (px: number, py: number, pz: number, w: number, h: number, d: number, color = wood[0]) =>
    model.box(x + px * scale * mirror, py * scale, z + pz * scale, w * scale, h * scale, d * scale, color);
  // Stepped trunks and branches keep the silhouette strictly voxel.
  for (let i = 0; i < 14; i++) {
    const bend = Math.max(0, i - 3) * .085;
    const width = .47 - i * .021;
    b(bend, .18 + i * .24, 0, width, .27, width, wood[i % 3]);
  }
  for (let i = 0; i < 9; i++) {
    b(.4 - i * .16, 1.65 + i * .13, .04, .22, .21, .18, wood[1]);
    if (i > 4) b(.4 - i * .16, 1.65 + i * .13 + (i - 4) * .13, .04, .1, (i - 4) * .26, .11, wood[2]);
  }
  for (let i = 0; i < 7; i++) {
    b(.68 + i * .16, 2.36 + i * .12, -.08 - i * .07, .2, .19, .17, wood[1]);
    if (i > 3) b(.68 + i * .16, 2.36 + i * .12 + (i - 3) * .1, -.08 - i * .07, .085, (i - 3) * .2, .09, wood[2]);
  }
  for (let i = 0; i < 5; i++) b(.89 - i * .07, 3.08 + i * .19, -.03, .14, .23, .14, wood[1]);
  for (let i = 0; i < 4; i++) {
    b(-.17 - i * .17, .11, .06 + i * .1, .3, .15, .24);
    b(.18 + i * .14, .1, -.1 - i * .1, .23, .13, .22);
  }
}

function makeConductor(parent: THREE.Object3D, geometry: THREE.BoxGeometry) {
  const m = new VoxelModel();
  // Seated coat, tails, dangling boots, and raised conducting arm.
  m.box(0, .36, 0, .62, .75, .38, coat);
  m.box(0, .76, 0, .72, .18, .42, '#30363c');
  m.box(-.26, .04, -.07, .22, .64, .24, '#20262d');
  m.box(.26, .04, -.07, .22, .64, .24, '#20262d');
  m.box(-.21, -.08, .27, .24, .24, .65, coat);
  m.box(.21, -.04, .24, .24, .24, .55, '#30343a');
  m.box(-.21, -.48, .51, .22, .7, .22, coat);
  m.box(.21, -.41, .43, .23, .62, .24, '#282e35');
  m.box(-.21, -.84, .59, .25, .18, .43, '#171e24');
  m.box(.21, -.74, .54, .26, .2, .44, '#171e24');
  for (let i = 0; i < 3; i++) {
    m.box(-.14, .3 + i * .14, .204, .25, .035, .025, '#b2b3a4');
    m.box(.14, .3 + i * .14, .204, .25, .035, .025, '#b2b3a4');
    m.box(0, .3 + i * .14, .225, .04, .045, .035, '#d5caaa');
  }
  m.box(-.42, .59, .04, .23, .27, .29, '#353b40');
  m.box(-.51, .43, .13, .2, .24, .26, coat);
  m.box(-.53, .28, .25, .22, .12, .28, coat);
  m.box(-.54, .26, .4, .2, .12, .16, bone);
  m.box(.44, .61, 0, .24, .27, .28, coat);
  m.box(.59, .57, .01, .24, .21, .24, coat);
  m.box(.73, .68, .03, .2, .23, .2, coat);
  m.box(.76, .85, .04, .18, .17, .18, bone);
  m.box(.76, .71, .04, .21, .055, .21, '#9c4b43');
  m.box(.78, 1.18, .06, .035, .72, .035, '#c4bfa4');
  // Skull: pixel silhouette, recessed eyes, jaw and individual teeth.
  const skull = [
    '  BBBBBB  ',
    ' BBBBBBBB ',
    'BBBBBBBBBB',
    'BBXXBBXXBB',
    'BXXXBBXXXB',
    'BBXBBBBXBB',
    ' BBBXXBBB ',
    '  BBBBBB  ',
    '  B B BB  ',
    '  BBBBBB  ',
  ];
  const pixel = .061;
  m.box(0, 1.12, -.035, .48, .45, .36, '#c7c2ac');
  skull.forEach((row, y) => [...row].forEach((p, x) => {
    if (p !== ' ') m.box((x - 4.5) * pixel, 1.41 - y * pixel, .19, pixel, pixel, .085, p === 'X' ? '#252e30' : bone);
  }));
  m.box(0, .9, 0, .19, .17, .19, '#d7cfb5');
  // Tall black parade hat, silver band, cockade and pixel feather.
  m.box(0, 1.45, -.025, .68, .09, .54, '#151d24');
  m.box(0, 1.65, -.07, .54, .36, .43, '#222931');
  m.box(.025, 1.86, -.08, .47, .1, .39, '#2e353b');
  m.box(0, 1.5, .194, .52, .055, .045, '#b4b5a6');
  m.box(.2, 1.66, .173, .1, .13, .07, '#b8b49d');
  m.box(.2, 1.66, .218, .045, .065, .025, coat);
  for (let i = 0; i < 8; i++) {
    const x = -.1 + Math.sin(i * .45) * .19;
    m.box(x, 1.93 + i * .105, -.12, .12 + i * .012, .14, .1, i % 3 === 0 ? '#4b4a43' : '#303539');
    if (i > 3) m.box(x + .12, 1.93 + i * .105, -.12, .14, .06, .08, '#383b3a');
  }
  const arm = new THREE.Group();
  arm.position.set(.35, .68, 0);
  const leftLeg = new THREE.Group();
  leftLeg.position.set(-.21, -.08, .25);
  const rightLeg = new THREE.Group();
  rightLeg.position.set(.21, -.04, .24);
  for (const [joint, predicate] of [
    [arm, (v: Voxel) => v.x > .34 && v.y > .2],
    [leftLeg, (v: Voxel) => v.x < 0 && v.y < -.2],
    [rightLeg, (v: Voxel) => v.x > 0 && v.y < -.2],
  ] as const) {
    const part = new VoxelModel();
    part.voxels = m.voxels.filter(predicate).map(v => ({ ...v, x: v.x - joint.position.x, y: v.y - joint.position.y, z: v.z - joint.position.z }));
    m.voxels = m.voxels.filter(v => !predicate(v));
    part.build(joint, geometry);
    parent.add(joint);
  }
  m.build(parent, geometry);
  return { arm, leftLeg, rightLeg };
}

function plaque(parent: THREE.Object3D, text: string, width: number, y: number, z: number) {
  const canvas = document.createElement('canvas');
  canvas.width = 512; canvas.height = 128;
  const ctx = canvas.getContext('2d')!;
  ctx.clearRect(0, 0, 512, 128);
  ctx.fillStyle = '#d0d1b7'; ctx.font = '500 43px Georgia'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(text, 256, 60, 480);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(width, width / 4), new THREE.MeshBasicMaterial({ map: texture, transparent: true, depthWrite: false }));
  mesh.position.set(0, y, z);
  parent.add(mesh);
}

export function createScene(container: HTMLElement, options: SceneOptions) {
  const random = randomSource(4417);
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
  renderer.setClearColor('#101319', 0);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.35;
  container.appendChild(renderer.domElement);
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2('#101319', .027);
  const camera = new THREE.OrthographicCamera(-8, 8, 6, -6, .1, 80);
  const initialCamera = new THREE.Vector3(11.5, 10, 16);
  camera.position.copy(initialCamera);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 1.35, 0);
  controls.enableDamping = false;
  controls.enablePan = false;
  controls.enableZoom = false;
  controls.minAzimuthAngle = .18;
  controls.maxAzimuthAngle = 1.08;
  controls.minPolarAngle = .73;
  controls.maxPolarAngle = 1.15;
  controls.rotateSpeed = .45;
  controls.touches.ONE = THREE.TOUCH.ROTATE;
  controls.update();

  scene.add(new THREE.HemisphereLight('#b7c9d1', '#555142', 2.3));
  const moon = new THREE.DirectionalLight('#c1d2db', 3.5);
  moon.position.set(-5, 11, 3);
  moon.castShadow = true;
  moon.shadow.mapSize.set(2048, 2048);
  moon.shadow.camera.left = -8; moon.shadow.camera.right = 8;
  moon.shadow.camera.top = 8; moon.shadow.camera.bottom = -8;
  moon.shadow.normalBias = .035;
  moon.shadow.bias = -.0003;
  scene.add(moon);
  const rim = new THREE.DirectionalLight('#a2bda1', 1.6);
  rim.position.set(4, 6, -7);
  scene.add(rim);

  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const environment = new VoxelModel();
  const island = new THREE.Group();
  scene.add(island);
  // Broken edges and stratified earth give the floating diorama a hand-built feel.
  environment.box(0, -.22, 0, 9.5, .45, 7.3, '#343e3b');
  environment.box(0, -.58, 0, 8.8, .35, 6.6, '#263034');
  for (let x = -10; x <= 10; x++) for (let z = -8; z <= 8; z++) {
    if ((Math.abs(x) > 9 && Math.abs(z) > 6) || (Math.abs(x) > 8 && Math.abs(z) > 7)) continue;
    const y = -.18 - random() * .035;
    environment.box(x * .455, y, z * .43, .455, .21, .43, ['#444e43', '#3c493e', '#414d42', '#4b5345'][Math.floor(random() * 4)]);
    if (Math.abs(x) > 8 || Math.abs(z) > 6) {
      const depth = .3 + random() * .55;
      environment.box(x * .455, -.34 - depth / 2, z * .43, .455, depth, .43, soil[Math.floor(random() * soil.length)]);
    }
  }
  for (let i = 0; i < 65; i++) {
    const x = (random() - .5) * 8.7, z = (random() - .5) * 6.5;
    if (Math.abs(x) < .7) continue;
    environment.box(x, .015, z, .1 + random() * .25, .05, .08 + random() * .23, '#647059');
    if (random() > .5) {
      environment.box(x, .09, z, .035, .15, .04, '#788062');
      environment.box(x + .08, .06, z, .035, .12, .04, '#68775b');
    }
  }
  // A worn central path, each paver offset rather than tiled perfectly.
  for (let i = 0; i < 8; i++) for (let j = 0; j < 2; j++) {
    environment.box((j - .5) * .49 + (random() - .5) * .07, .025, 3.12 - i * .72, .44, .085, .52 + random() * .1, stone[Math.floor(random() * stone.length)]);
  }
  // Rear iron fence, masonry gateposts and a stepped arch.
  for (const x of [-1.1, 1.1]) {
    environment.box(x, .14, -2.65, .72, .28, .72, '#666e65');
    for (let y = 0; y < 7; y++) environment.box(x, .43 + y * .29, -2.65, .48, .27, .48, stone[y % 4]);
    environment.box(x, 2.38, -2.65, .68, .17, .68, '#929583');
    environment.box(x, 2.53, -2.65, .52, .14, .52, '#747d70');
  }
  for (let i = -5; i <= 5; i++) {
    const x = i * .185, height = 2.17 + .42 * (1 - Math.abs(i) / 5);
    environment.box(x, height / 2, -2.65, .045, height, .045, iron);
    environment.box(x, height + .045, -2.65, .09, .09, .09, '#5a655e');
  }
  for (const y of [.46, 1.44, 1.96]) environment.box(0, y, -2.65, 2.1, .055, .055, iron);
  for (const side of [-1, 1]) {
    for (let i = 0; i < 12; i++) {
      const x = side * (1.53 + i * .25);
      environment.box(x, .63, -2.65, .045, 1.26, .045, iron);
      environment.box(x, 1.3, -2.65, .085, .13, .085, '#58645c');
    }
    for (const y of [.35, 1.03]) environment.box(side * 2.88, y, -2.65, 3, .06, .06, iron);
    for (let i = 0; i < 9; i++) {
      environment.box(side * 4.45, .51, -2.5 + i * .59, .045, 1.02, .045, iron);
    }
    for (const y of [.29, .86]) environment.box(side * 4.45, y, -.17, .05, .05, 4.9, iron);
  }
  makeTree(environment, -3.85, -1.35, 1.07, -1);
  makeTree(environment, 3.65, -2.65, 1.02, 1);
  // Small background markers make this a cemetery, not just four product stands.
  for (const [x, z] of [[-3.5, 1.8], [3.8, 1.4], [-2.6, -2.1]]) {
    environment.box(x, .3, z, .45, .6, .2, '#5c6b63');
    environment.box(x, .65, z, .32, .12, .22, '#6a7569');
    environment.box(x, .38, z + .11, .045, .27, .025, '#a9ae95');
    environment.box(x, .42, z + .11, .17, .045, .025, '#a9ae95');
  }
  // Crimson flowers, tiny bones, fallen leaves.
  for (const [x, z] of [[-3.15, 2.2], [2.9, 1.5], [-1.3, -.8], [2.8, -1.5]]) {
    for (let i = 0; i < 3; i++) {
      const dx = x + (random() - .5) * .3, dz = z + (random() - .5) * .3;
      environment.box(dx, .14, dz, .025, .27, .025, '#697653');
      environment.box(dx, .27, dz, .13, .08, .11, '#8b4944');
    }
  }
  environment.build(island, geometry);

  const conductor = new THREE.Group();
  conductor.position.set(1.1, 2.7, -2.5);
  conductor.rotation.y = -.12;
  conductor.scale.setScalar(.85);
  const conductorRig = makeConductor(conductor, geometry);
  island.add(conductor);

  const monuments = new Map<string, THREE.Group>();
  const crypts = new Map<string, { lid: THREE.Group; glow: THREE.PointLight; mist: THREE.Group }>();
  const pickables: THREE.Object3D[] = [];
  const locations = [[-2, -.65], [1.95, -.55], [-1.95, 1.55], [1.95, 1.65]];
  projects.forEach((project, index) => {
    const group = new THREE.Group();
    group.position.set(locations[index][0], 0, locations[index][1]);
    group.rotation.y = .12;
    group.userData.project = project.id;
    const m = new VoxelModel();
    m.box(0, .1, 0, 1.45, .2, 1.15, '#626e65');
    m.box(0, .23, -.1, 1.19, .1, .89, '#89927e');
    m.box(0, .31, -.1, 1.02, .1, .72, '#6e7c6e');
    if (index === 0) {
      // Rinku: a little doorway, connecting worlds.
      m.box(-.38, .98, -.12, .24, 1.3, .4, '#7b877b');
      m.box(.38, .98, -.12, .24, 1.3, .4, '#7b877b');
      m.box(0, 1.7, -.12, 1.02, .22, .46, '#919783');
      m.box(0, 1.86, -.12, .75, .14, .42, '#abb095');
      m.box(0, 1.95, -.12, .43, .08, .38, '#b1b59c');
      m.box(0, 1.03, -.23, .56, 1.15, .13, '#293b3b');
      m.box(0, 1.07, -.15, .035, .63, .04, '#abb78b');
      m.box(0, 1.07, -.15, .31, .035, .04, '#abb78b');
      m.box(0, 1.49, -.14, .14, .14, .04, '#c0c9a1');
      m.box(0, .46, .17, .9, .12, .55, '#8b9481');
      plaque(group, 'RINKU', .85, .23, .49);
    } else if (index === 1) {
      // SmartNotes: a weathered tablet with a carved waveform.
      m.box(0, .99, -.12, .92, 1.35, .37, '#818778');
      m.box(0, 1.7, -.12, .75, .12, .37, '#969b86');
      m.box(0, 1.8, -.12, .51, .1, .37, '#a0a38c');
      m.box(0, 1.04, .077, .69, .89, .03, '#535f58');
      [.2, .35, .62, .43, .24].forEach((h, i) => m.box((i - 2) * .11, 1.11, .105, .045, h, .035, '#c3b498'));
      plaque(group, 'SMARTNOTES', .89, .48, .082);
      m.box(0, 1.57, .09, .15, .05, .03, '#c3b498');
    } else if (index === 2) {
      // ChatLaunch: a softly stepped headstone with a speech bubble.
      m.box(0, .88, -.11, 1.03, 1.12, .4, '#778c7d');
      m.box(0, 1.48, -.11, .85, .15, .4, '#8c9d87');
      m.box(0, 1.6, -.11, .59, .1, .4, '#9ca88e');
      m.box(0, 1.72, -.11, .31, .14, .4, '#adb59a');
      m.box(0, 1.07, .1, .49, .4, .04, '#b4c2a4');
      m.box(0, 1.07, .125, .35, .26, .03, '#536e60');
      m.box(-.14, .83, .1, .12, .12, .04, '#b4c2a4');
      for (let i = 0; i < 3; i++) m.box((i - 1) * .105, 1.07, .15, .045, .045, .035, '#c1c6a8');
      plaque(group, 'CHATLAUNCH', .94, .52, .105);
    } else {
      // KMP-Record: a recording-eye obelisk.
      m.box(0, .48, -.1, .77, .25, .67, '#7d8490');
      m.box(0, 1.15, -.1, .53, 1.13, .49, '#818a91');
      m.box(0, 1.82, -.1, .43, .22, .4, '#a0a69e');
      m.box(0, 1.98, -.1, .25, .1, .25, '#b6b8a7');
      m.box(0, 2.07, -.1, .1, .09, .1, '#bfc1ad');
      m.box(0, 1.29, .155, .31, .31, .04, '#444e5d');
      m.box(0, 1.29, .185, .17, .17, .04, '#b3b4c1');
      m.box(0, 1.29, .215, .08, .08, .03, '#7b5355');
      for (let i = 0; i < 3; i++) m.box(0, .81 + i * .09, .16, .23, .023, .02, '#b4b9a8');
      plaque(group, 'KMP-RECORD', 1.02, .23, .58);
    }
    const lid = new THREE.Group();
    const lidModel = new VoxelModel();
    lidModel.voxels = m.voxels.filter(v => v.y > .32);
    m.voxels = m.voxels.filter(v => v.y <= .32);
    // Carry engraved plaques with the opening stone.
    [...group.children].forEach(child => { if (child.position.y > .32) lid.add(child); });
    lidModel.build(lid, geometry);
    group.add(lid);
    m.box(0, .33, -.1, .78, .035, .59, '#182726');
    m.build(group, geometry);
    const glow = new THREE.PointLight(project.accent, 0, 4);
    glow.position.set(0, .65, .15);
    group.add(glow);
    const vapor = new THREE.Group();
    for (let i = 0; i < 9; i++) {
      const puff = new THREE.Mesh(new THREE.BoxGeometry(.16, .16, .16), new THREE.MeshBasicMaterial({ color: project.accent, transparent: true, opacity: 0, depthWrite: false }));
      puff.position.set(Math.sin(i * 3) * .4, .5 + i * .12, Math.cos(i * 4) * .3);
      vapor.add(puff);
    }
    group.add(vapor);
    crypts.set(project.id, { lid, glow, mist: vapor });
    const hitbox = new THREE.Mesh(new THREE.BoxGeometry(1.45, 2.25, 1.2), new THREE.MeshBasicMaterial({ visible: false }));
    hitbox.position.y = 1.1;
    hitbox.userData.project = project.id;
    group.add(hitbox);
    pickables.push(hitbox);
    monuments.set(project.id, group);
    island.add(group);
  });

  const flames: { mesh: THREE.Mesh; light: THREE.PointLight; phase: number }[] = [];
  const candles = new VoxelModel();
  for (const [x, z] of [[-1.05, 1.7], [2.85, .95], [-2.85, -.45], [.9, -2.1], [3.85, -1.4], [-3.5, 2.5]]) {
    for (let i = 0; i < 2; i++) {
      const height = .17 + i * .13;
      candles.box(x + i * .16, height / 2 + .03, z + i * .09, .105, height, .105, '#cfc0a0');
    }
    const flame = new THREE.Mesh(new THREE.BoxGeometry(.065, .12, .065), new THREE.MeshBasicMaterial({ color: '#ffd39a' }));
    flame.position.set(x + .16, .39, z + .09);
    island.add(flame);
    const light = new THREE.PointLight('#ffac59', 3, 3, 2);
    light.position.set(x, .58, z);
    island.add(light);
    flames.push({ mesh: flame, light, phase: random() * 10 });
    // A tiny halo reads as candlelight without expensive post-processing.
    const glowCanvas = document.createElement('canvas'); glowCanvas.width = glowCanvas.height = 64;
    const context = glowCanvas.getContext('2d')!;
    const gradient = context.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, '#ffbb6866'); gradient.addColorStop(.25, '#ffbb6825'); gradient.addColorStop(1, '#ffbb6800');
    context.fillStyle = gradient; context.fillRect(0, 0, 64, 64);
    const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(glowCanvas), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
    glow.position.copy(flame.position); glow.scale.set(.6, .6, 1); island.add(glow);
  }
  candles.build(island, geometry);

  const ghosts = locations.map(([x, z], index) => {
    const ghost = new THREE.Group();
    const model = new VoxelModel();
    model.box(0, .3, 0, .36, .48, .26, '#b6d3c7');
    model.box(0, .58, 0, .25, .09, .22, '#b6d3c7');
    for (const side of [-1, 1]) {
      model.box(side * .24, .3, 0, .16, .12, .18, '#b6d3c7');
      model.box(side * .1, .04, 0, .09, .17, .22, '#b6d3c7');
      model.box(side * .085, .41, .14, .065, .09, .025, '#203b3b');
    }
    model.build(ghost, geometry);
    ghost.traverse(child => {
      if (child instanceof THREE.InstancedMesh) {
        const material = child.material as THREE.MeshStandardMaterial;
        material.transparent = true; material.opacity = 0; material.depthWrite = false;
        material.emissive.set('#739e90'); material.emissiveIntensity = .4;
        child.castShadow = false;
      }
    });
    ghost.position.set(x, .2, z - .55);
    island.add(ghost);
    return { ghost, x, z, offset: index * 5 };
  });

  const raven = new THREE.Group();
  const ravenBody = new VoxelModel();
  ravenBody.box(0, .14, 0, .24, .25, .36, '#171f2b');
  ravenBody.box(0, .08, -.25, .18, .09, .28, '#222a36');
  for (const side of [-1, 1]) ravenBody.box(side * .07, -.03, .05, .035, .14, .12, '#9a9276');
  ravenBody.build(raven, geometry);
  const ravenHead = new THREE.Group();
  ravenHead.position.set(0, .34, .09);
  const head = new VoxelModel();
  head.box(0, 0, 0, .23, .22, .23, '#202a37');
  head.box(0, -.025, .17, .1, .065, .18, '#8d907b');
  for (const side of [-1, 1]) head.box(side * .12, .025, .055, .025, .035, .035, '#d3c2a1');
  head.build(ravenHead, geometry); raven.add(ravenHead);
  const wings = [-1, 1].map(side => {
    const wing = new THREE.Group(); wing.position.set(side * .12, .19, 0);
    const model = new VoxelModel();
    model.box(side * .1, 0, -.03, .24, .065, .34, '#303b49');
    model.build(wing, geometry); raven.add(wing); return wing;
  });
  raven.position.set(-1.1, 2.7, -2.65); island.add(raven);

  const moteGeometry = new THREE.BufferGeometry();
  const motePositions = new Float32Array(50 * 3);
  for (let i = 0; i < 50; i++) {
    motePositions[i * 3] = (random() - .5) * 10;
    motePositions[i * 3 + 1] = random() * 4 + .2;
    motePositions[i * 3 + 2] = (random() - .5) * 7;
  }
  moteGeometry.setAttribute('position', new THREE.BufferAttribute(motePositions, 3));
  const motes = new THREE.Points(moteGeometry, new THREE.PointsMaterial({ color: '#c3bba0', size: .025, transparent: true, opacity: .55, depthWrite: false }));
  scene.add(motes);

  const fogMaterial = new THREE.ShaderMaterial({
    uniforms: { time: { value: 0 } }, transparent: true, depthWrite: false, side: THREE.DoubleSide,
    vertexShader: 'varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
    fragmentShader: `varying vec2 vUv; uniform float time;
      void main(){ vec2 p=vUv; float edge=smoothstep(.5,.08,length((p-.5)*vec2(1.,1.25)));
      float w=sin(p.x*18.+p.y*9.+time*.12)*sin(p.y*23.-p.x*8.-time*.09);
      float mist=pow(max(0.,w*.5+.5),2.); gl_FragColor=vec4(.56,.65,.65,mist*edge*.32); }`,
  });
  const mist = new THREE.Mesh(new THREE.PlaneGeometry(12, 10), fogMaterial);
  mist.rotation.x = -Math.PI / 2; mist.position.y = .37; scene.add(mist);

  let paused = options.reducedMotion;
  let visible = true;
  let active = true;
  let hovered: string | null = null;
  let elapsed = 0;
  let previousTime = 0;
  let lastRender = -Infinity;
  let dirty = true;
  let selected: string | null = null;
  let transition: { opening: boolean; time: number; start: number; done?: () => void } | null = null;
  let reveal = 0;
  const savedCamera = new THREE.Vector3();
  const savedTarget = new THREE.Vector3();
  const savedZoom = { value: 1 };

  function applyReveal(value: number) {
    if (!selected) return;
    const group = monuments.get(selected)!;
    const crypt = crypts.get(selected)!;
    crypt.lid.position.set(value * .48, value * .12, -value * .65);
    crypt.lid.rotation.y = -value * .18;
    crypt.glow.intensity = value * 12;
    crypt.mist.children.forEach((child, i) => {
      child.position.y = .45 + ((i * .13 + value * 1.4) % 1.5);
      (child as THREE.Mesh<THREE.BoxGeometry, THREE.MeshBasicMaterial>).material.opacity = value * .24;
    });
    const target = group.position.clone().add(new THREE.Vector3(0, 1, 0));
    controls.target.lerpVectors(savedTarget, target, value * .65);
    camera.position.copy(savedCamera).add(controls.target.clone().sub(savedTarget));
    camera.zoom = THREE.MathUtils.lerp(savedZoom.value, 1.5, value);
    camera.updateProjectionMatrix(); controls.update();
    conductorRig.arm.rotation.z = -.95 * value;
    conductorRig.arm.rotation.x = -.9 * value;
    conductorRig.arm.rotation.y = Math.atan2(group.position.x - conductor.position.x, group.position.z - conductor.position.z) * value;
    dirty = true;
  }

  function finishTransition() {
    if (!transition) return;
    const completed = transition;
    reveal = completed.opening ? 1 : 0;
    applyReveal(reveal);
    transition = null;
    if (!completed.opening) { selected = null; controls.enabled = true; }
    container.dataset.phase = completed.opening ? 'open' : 'idle';
    completed.done?.();
  }
  let dragging = false;
  let pointerDown: { x: number; y: number } | null = null;
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  const tooltip = document.getElementById('world-tooltip')!;

  function setHover(id: string | null) {
    if (hovered === id) return;
    hovered = id;
    dirty = true;
    for (const [key, group] of monuments) {
      group.traverse(child => {
        if (child instanceof THREE.InstancedMesh) {
          const material = child.material as THREE.MeshStandardMaterial;
          material.emissive.set(key === id ? '#566a48' : '#000000');
          material.emissiveIntensity = key === id ? .22 : 0;
        }
      });
    }
    renderer.domElement.style.cursor = id ? 'pointer' : dragging ? 'grabbing' : 'grab';
    tooltip.classList.toggle('visible', Boolean(id));
    if (id) tooltip.textContent = `${projects.find(p => p.id === id)!.name} ↗`;
    options.onHover(id);
  }

  function hitTest(event: PointerEvent) {
    const rect = renderer.domElement.getBoundingClientRect();
    pointer.set((event.clientX - rect.left) / rect.width * 2 - 1, -(event.clientY - rect.top) / rect.height * 2 + 1);
    raycaster.setFromCamera(pointer, camera);
    const hit = raycaster.intersectObjects(pickables, false)[0];
    return hit?.object.userData.project as string | undefined;
  }
  function onMove(event: PointerEvent) {
    if (pointerDown && Math.hypot(event.clientX - pointerDown.x, event.clientY - pointerDown.y) > 6) dragging = true;
    const rect = container.getBoundingClientRect();
    tooltip.style.left = `${Math.max(90, Math.min(rect.width - 90, event.clientX - rect.left))}px`;
    tooltip.style.top = `${Math.max(55, event.clientY - rect.top - 22)}px`;
    setHover(dragging ? null : hitTest(event) ?? null);
  }
  function onDown(event: PointerEvent) { pointerDown = { x: event.clientX, y: event.clientY }; dragging = false; }
  function onUp(event: PointerEvent) {
    if (!selected && pointerDown && !dragging && Math.hypot(event.clientX - pointerDown.x, event.clientY - pointerDown.y) < 6) {
      const id = hitTest(event);
      if (id) { setHover(null); options.onSelect(id); }
    }
    pointerDown = null; dragging = false;
  }
  function onLeave() { setHover(null); pointerDown = null; dragging = false; }
  renderer.domElement.addEventListener('pointermove', onMove);
  renderer.domElement.addEventListener('pointerdown', onDown);
  renderer.domElement.addEventListener('pointerup', onUp);
  renderer.domElement.addEventListener('pointerleave', onLeave);
  renderer.domElement.addEventListener('pointercancel', onLeave);

  function resize() {
    const { width, height } = container.getBoundingClientRect();
    if (!width || !height) return;
    const aspect = width / height;
    const halfWidth = aspect < 1 ? 6.6 : 7.5;
    const halfHeight = halfWidth / aspect;
    camera.left = -halfWidth; camera.right = halfWidth;
    camera.top = halfHeight; camera.bottom = -halfHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
    dirty = true;
  }
  const observer = new ResizeObserver(resize);
  observer.observe(container);
  const intersection = new IntersectionObserver(entries => { visible = entries[0].isIntersecting; }, { threshold: 0 });
  intersection.observe(container);
  controls.addEventListener('change', () => { dirty = true; });

  function frame(time: number) {
    if (!active) return;
    const delta = previousTime ? Math.min((time - previousTime) / 1000, .05) : 0;
    previousTime = time;
    if (transition) {
      transition.time += delta;
      const progress = Math.min(transition.time / (transition.opening ? 1.15 : .8), 1);
      const eased = progress * progress * (3 - 2 * progress);
      reveal = THREE.MathUtils.lerp(transition.start, transition.opening ? 1 : 0, eased);
      applyReveal(reveal);
      if (progress === 1) finishTransition();
    }
    if (!visible || document.hidden) return;
    if (!paused) {
      elapsed += delta;
      fogMaterial.uniforms.time.value = elapsed;
      mist.position.x = Math.sin(elapsed * .18) * .6;
      mist.position.z = Math.cos(elapsed * .13) * .5;
      if (!selected) {
        conductorRig.arm.rotation.z = Math.sin(elapsed * 1.5) * .3;
        conductorRig.arm.rotation.x = Math.sin(elapsed * 1.5 + .8) * .35;
      }
      conductorRig.leftLeg.rotation.x = Math.sin(elapsed * 1.8) * .22;
      conductorRig.rightLeg.rotation.x = Math.sin(elapsed * 1.8 + 1.8) * .22;
      for (const { ghost, x, z, offset } of ghosts) {
        const cycle = (elapsed + offset) % 22;
        const amount = cycle < 6 ? Math.sin(cycle / 6 * Math.PI) : 0;
        ghost.visible = amount > .01;
        ghost.position.set(x + Math.sin(elapsed * .8 + offset) * .18, .15 + amount * 1.8, z - .55);
        ghost.rotation.y = Math.sin(elapsed + offset) * .25;
        ghost.traverse(child => { if (child instanceof THREE.InstancedMesh) (child.material as THREE.MeshStandardMaterial).opacity = amount * .65; });
      }
      const flight = elapsed % 18;
      const flightProgress = Math.min(Math.max((flight - 14) / 2, 0), 1);
      const reverse = Math.floor(elapsed / 18) % 2 === 1;
      const travel = reverse ? 1 - flightProgress : flightProgress;
      raven.position.set(THREE.MathUtils.lerp(-1.1, -3.3, travel), 2.7 - travel * 1.3 + Math.sin(flightProgress * Math.PI) * 1.1, -2.65);
      ravenHead.rotation.y = Math.sin(elapsed * .9) * .6;
      wings.forEach((wing, i) => { wing.rotation.z = (i ? 1 : -1) * (flightProgress > 0 && flightProgress < 1 ? Math.sin(elapsed * 20) * .9 : -.8); });
      for (const [id, group] of monuments) {
        if (id !== selected) group.rotation.z = id === hovered ? Math.sin(elapsed * 24) * .008 : 0;
      }
      motes.position.y = Math.sin(elapsed * .2) * .14;
      motes.rotation.y = Math.sin(elapsed * .04) * .05;
      flames.forEach(({ mesh, light, phase }) => {
        const flicker = Math.sin(elapsed * 4 + phase) * .19 + Math.sin(elapsed * 7.3 + phase) * .09;
        mesh.scale.y = 1 + flicker;
        mesh.rotation.z = Math.sin(elapsed * 3 + phase) * .15;
        light.intensity = 3 + flicker * 5;
      });
    }
    // Atmospheric motion needs only 30fps. A paused scene renders on interaction only.
    if (!dirty && (paused || time - lastRender < 1000 / 30)) return;
    renderer.render(scene, camera);
    lastRender = time;
    dirty = false;
  }
  resize();
  renderer.setAnimationLoop(frame);
  document.getElementById('world-status')!.classList.add('is-ready');

  return {
    openProject(id: string, done: () => void) {
      if (transition && !transition.opening) finishTransition();
      if (selected || !monuments.has(id)) return false;
      selected = id; setHover(null); controls.enabled = false;
      monuments.get(id)!.rotation.z = 0;
      savedCamera.copy(camera.position); savedTarget.copy(controls.target); savedZoom.value = camera.zoom;
      transition = { opening: true, time: 0, start: 0, done };
      container.dataset.phase = 'opening';
      if (paused) finishTransition();
      return true;
    },
    closeProject() {
      if (!selected) return;
      transition = { opening: false, time: 0, start: reveal };
      container.dataset.phase = 'closing';
      if (paused) finishTransition();
    },
    setPaused(value: boolean) { paused = value; dirty = true; if (paused) finishTransition(); },
    highlight(id: string | null) { setHover(id); if (id) tooltip.classList.remove('visible'); },
    reset() { if (selected) return; camera.position.copy(initialCamera); controls.target.set(0, 1.35, 0); controls.update(); },
    dispose() {
      active = false;
      renderer.setAnimationLoop(null);
      observer.disconnect(); intersection.disconnect(); controls.dispose();
      renderer.domElement.removeEventListener('pointermove', onMove);
      renderer.domElement.removeEventListener('pointerdown', onDown);
      renderer.domElement.removeEventListener('pointerup', onUp);
      renderer.domElement.removeEventListener('pointerleave', onLeave);
      renderer.domElement.removeEventListener('pointercancel', onLeave);
      const geometries = new Set<THREE.BufferGeometry>();
      const materials = new Set<THREE.Material>();
      const textures = new Set<THREE.Texture>();
      scene.traverse(object => {
        if (object instanceof THREE.Mesh || object instanceof THREE.Points || object instanceof THREE.Sprite) {
          if ('geometry' in object) geometries.add(object.geometry);
          const objectMaterials = Array.isArray(object.material) ? object.material : [object.material];
          objectMaterials.forEach(material => {
            materials.add(material);
            const map = (material as THREE.MeshBasicMaterial).map;
            if (map) textures.add(map);
          });
        }
      });
      geometries.forEach(g => g.dispose()); materials.forEach(m => m.dispose()); textures.forEach(t => t.dispose());
      renderer.dispose(); renderer.domElement.remove();
    },
  };
}

import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
import { OrbitControls } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js";
import { CSS2DRenderer, CSS2DObject } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/renderers/CSS2DRenderer.js";

// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
let humanModel;
let controls;

// Renderers
const renderer = new THREE.WebGLRenderer({ alpha: true });
const labelRenderer = new CSS2DRenderer();
const container = document.getElementById("container3D");

// Box interaction variables
let clickableBoxes = [];
let hoveredBox = null;
const originalColors = new WeakMap();
const HOVER_COLOR = 0xffffff;

// Touch interaction variables
let touchStartTime = 0;
let touchStartPosition = { x: 0, y: 0 };
let isTouchDragging = false;
let touchMoved = false;

// Initialize renderers
renderer.setSize(container.clientWidth, container.clientHeight);
container.appendChild(renderer.domElement);

labelRenderer.setSize(window.innerWidth, window.innerHeight);
labelRenderer.domElement.style.position = 'absolute';
labelRenderer.domElement.style.top = '0';
labelRenderer.domElement.style.pointerEvents = 'none';
document.body.appendChild(labelRenderer.domElement);

// Raycasting setup
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// Add event listeners
renderer.domElement.addEventListener('touchstart', onTouchStart, { passive: false });
renderer.domElement.addEventListener('touchend', onTouchEnd, { passive: false });
renderer.domElement.addEventListener('touchmove', onTouchMove, { passive: false });

// Load model
const loader = new GLTFLoader();
loader.load(
  `./models/human/scene.gltf`,
  (gltf) => {
    humanModel = gltf.scene;
    scene.add(humanModel);
    humanModel.position.y = -0.95;

    const createBoxMaterial = () => new THREE.MeshBasicMaterial({
      color: 0xffffff,
      opacity: 0,
      transparent: true,
      side: THREE.DoubleSide,
      wireframe: true,
      wireframeLinewidth: 1
    });

    // Geometries
    const geometryHead = new THREE.BoxGeometry(0.2, 0.25, 0.28);
    const geometryUpperArm = new THREE.BoxGeometry(0.1,0.3,0.17);
    const geometryForearm = new THREE.BoxGeometry(0.1, 0.315, 0.12);
    const geometryUpperChest = new THREE.BoxGeometry(0.29,0.13,0.015);
    const geometryTorso = new THREE.BoxGeometry(0.29,0.33,0.015);
    const geometryHand = new THREE.BoxGeometry(0.1,0.162,0.18);
    const geometryKnee = new THREE.BoxGeometry(0.1,0.1,0.1);
    const geometryShin = new THREE.BoxGeometry(0.125,0.27,0.06);
    const geometryCalf = new THREE.BoxGeometry(0.125,0.27,0.05);
    const geometryFoot = new THREE.BoxGeometry(0.125,0.1,0.29);
    const geometryThigh = new THREE.BoxGeometry(0.15,0.27,0.06);
    const geometryBackLeg = new THREE.BoxGeometry(0.15,0.38,0.075);
    const geometryTopBack = new THREE.BoxGeometry(0.32,0.16,0.05);
    const geometryMiddleBack = new THREE.BoxGeometry(0.29,0.15,0.05);
    const geometryLowerBack = new THREE.BoxGeometry(0.24,0.14,0.05);

    const boxes = [
      new THREE.Mesh(geometryHead, createBoxMaterial()),
      new THREE.Mesh(geometryUpperArm, createBoxMaterial()),
      new THREE.Mesh(geometryUpperArm, createBoxMaterial()),
      new THREE.Mesh(geometryForearm, createBoxMaterial()),
      new THREE.Mesh(geometryForearm, createBoxMaterial()),
      new THREE.Mesh(geometryUpperChest, createBoxMaterial()),
      new THREE.Mesh(geometryTorso,createBoxMaterial()),
      new THREE.Mesh(geometryHand,createBoxMaterial()),
      new THREE.Mesh(geometryHand,createBoxMaterial()),
      new THREE.Mesh(geometryKnee,createBoxMaterial()),
      new THREE.Mesh(geometryKnee,createBoxMaterial()),
      new THREE.Mesh(geometryShin,createBoxMaterial()),
      new THREE.Mesh(geometryShin,createBoxMaterial()),
      new THREE.Mesh(geometryCalf,createBoxMaterial()),
      new THREE.Mesh(geometryCalf,createBoxMaterial()),
      new THREE.Mesh(geometryFoot,createBoxMaterial()),
      new THREE.Mesh(geometryFoot,createBoxMaterial()),
      new THREE.Mesh(geometryThigh,createBoxMaterial()),
      new THREE.Mesh(geometryThigh,createBoxMaterial()),
      new THREE.Mesh(geometryBackLeg,createBoxMaterial()),
      new THREE.Mesh(geometryBackLeg,createBoxMaterial()),
      new THREE.Mesh(geometryTopBack,createBoxMaterial()),
      new THREE.Mesh(geometryMiddleBack,createBoxMaterial()),
      new THREE.Mesh(geometryLowerBack,createBoxMaterial())
    ];

    // Positions
    boxes[0].position.set(0,5,0);
    boxes[1].position.set(-0.23, 1.335, -0.098);
    boxes[2].position.set(0.23, 1.335, -0.098);
    boxes[3].position.set(-0.2868, 1.03, -0.07);
    boxes[4].position.set(0.2868, 1.03, -0.07);
    boxes[5].position.set(0,1.37,0.1);
    boxes[6].position.set(0,1.14,0.1);
    boxes[7].position.set(-0.292,0.8,0.04);
    boxes[8].position.set(0.292,0.8,0.04);
    boxes[9].position.set(-0.095,0.53,0.015);
    boxes[10].position.set(0.095,0.53,0.015);
    boxes[11].position.set(-0.095,0.3,-0.03);
    boxes[12].position.set(0.095,0.3,-0.03);
    boxes[13].position.set(-0.095,0.32,-0.12);
    boxes[14].position.set(0.095,0.32,-0.12);
    boxes[15].position.set(-0.09,0.05,-0.001);
    boxes[16].position.set(0.09,0.05,-0.001);
    boxes[17].position.set(-0.082,0.74,0.0555);
    boxes[18].position.set(0.082,0.74,0.0555);
    boxes[19].position.set(-0.082,0.8,-0.068);
    boxes[20].position.set(0.082,0.8,-0.068);
    boxes[21].position.set(0.0,1.4,-0.172);
    boxes[22].position.set(0.0,1.23,-0.13);
    boxes[23].position.set(0.0,1.07,-0.089);

    // Rotations
    boxes[1].rotation.x = Math.PI / 18;
    boxes[2].rotation.x = Math.PI / 18;
    boxes[3].rotation.x = -Math.PI / 8;
    boxes[3].rotation.z = -Math.PI / 15;
    boxes[4].rotation.x = -Math.PI / 8;
    boxes[4].rotation.z = Math.PI / 15;
    boxes[5].rotation.x = -Math.PI / 13;
    boxes[6].rotation.x = Math.PI / 40;
    boxes[7].rotation.x = -Math.PI/ 8;
    boxes[7].rotation.z = Math.PI / 12;
    boxes[8].rotation.x = -Math.PI/ 8;
    boxes[8].rotation.z = -Math.PI / 12;
    boxes[11].rotation.x = Math.PI / 15;
    boxes[12].rotation.x = Math.PI / 15;
    boxes[13].rotation.x = Math.PI / 40;
    boxes[14].rotation.x = Math.PI / 40;
    boxes[15].rotation.x = Math.PI / 40;
    boxes[16].rotation.x = Math.PI / 40;
    boxes[19].rotation.x = -Math.PI / 20;
    boxes[19].rotation.y = Math.PI / 20;
    boxes[20].rotation.x = -Math.PI / 20;
    boxes[20].rotation.y = -Math.PI / 20;
    boxes[22].rotation.x = -Math.PI / 12;

    boxes.forEach(box => {
      humanModel.add(box);
      originalColors.set(box, box.material.color.getHex());
    });

    clickableBoxes = boxes;
  },
  (xhr) => console.log(`${(xhr.loaded / xhr.total * 100)}% loaded`),
  (error) => console.error(error)
);

let touchStartedOnBox = false;
const TOUCH_MOVE_THRESHOLD = 10; // pixels
let currentTouchedBox = null;

// Modified touch handlers
function onTouchStart(event) {
  if (event.touches.length !== 1) return;
  
  const touch = event.touches[0];
  touchStartTime = Date.now();
  touchStartPosition.x = touch.clientX;
  touchStartPosition.y = touch.clientY;
  touchMoved = false;
  isTouchDragging = false;
  currentTouchedBox = null;

  // Check initial touch position
  const rect = renderer.domElement.getBoundingClientRect();
  mouse.x = ((touch.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((touch.clientY - rect.top) / rect.height) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(clickableBoxes);

  if (intersects.length > 0) {
    event.preventDefault();
    currentTouchedBox = intersects[0].object;
    touchStartedOnBox = true;
  }
}
function onTouchMove(event) {
  if (event.touches.length !== 1) return;
  
  const touch = event.touches[0];
  const moveX = Math.abs(touch.clientX - touchStartPosition.x);
  const moveY = Math.abs(touch.clientY - touchStartPosition.y);
  
  if (moveX > TOUCH_MOVE_THRESHOLD || moveY > TOUCH_MOVE_THRESHOLD) {
    touchMoved = true;
    isTouchDragging = true;
  }
}

function onTouchEnd(event) {
  if (event.touches.length > 0) return;
  
  const touchDuration = Date.now() - touchStartTime;
  const isTap = !touchMoved && touchDuration < 300;

  if (isTap && currentTouchedBox) {
    // Handle the click immediately using the stored box reference
    handleBoxClick(currentTouchedBox);
  }

  // Reset states
  touchMoved = false;
  isTouchDragging = false;
  touchStartedOnBox = false;
  currentTouchedBox = null;
}

// Modified handleTouchEvent
function handleTouchEvent(event) {
  const rect = renderer.domElement.getBoundingClientRect();
  const touch = event.touches?.[0] || event.changedTouches?.[0];
  if (!touch) return;

  mouse.x = ((touch.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((touch.clientY - rect.top) / rect.height) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(clickableBoxes);

  if (intersects.length > 0) {
    event.preventDefault();
    touchStartedOnBox = true;
    
    // Only store the intersected box, don't click yet
    if (event.type === 'touchstart') {
      hoveredBox = intersects[0].object;
    }
  }
}

// Click handling
function handleBoxClick(clickedBox) {
  clickedBox.material.color.setHex(HOVER_COLOR);
  clickedBox.material.opacity = 0.5;
  
  setTimeout(() => {
    // clickedBox.material.opacity = 0;
  }, 300);

  const links = [
    "https://example.com/head",
    "https://example.com/upperleft-arm",
    "https://example.com/upperright-arm",
    "https://example.com/leftForearm",
    "https://example.com/rightForearm",
    "https://example.com/Upperchest",
    "https://google.com"
  ];

  const boxIndex = clickableBoxes.indexOf(clickedBox);
  if (links[boxIndex]) {
    window.location.href = links[boxIndex];
  }
}

// Mouse interaction
window.addEventListener("mousemove", (event) => {
  const rect = renderer.domElement.getBoundingClientRect();
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);

  const intersects = raycaster.intersectObjects(clickableBoxes);

  if (hoveredBox) {
    hoveredBox.material.color.setHex(originalColors.get(hoveredBox));
    hoveredBox.material.opacity = 0;
    hoveredBox = null;
  }

  if (intersects.length > 0) {
    hoveredBox = intersects[0].object;
    hoveredBox.material.color.setHex(HOVER_COLOR);
    hoveredBox.material.opacity = 0.5;
  }
});

window.addEventListener("click", (event) => {
  const rect = renderer.domElement.getBoundingClientRect();
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  
  if (isDragging) return;
  
  const intersects = raycaster.intersectObjects(clickableBoxes);
  if (intersects.length > 0) {
    handleBoxClick(intersects[0].object);
  }
});

// Lights
const topLight = new THREE.DirectionalLight(0xffffff, 0.6);
topLight.position.set(0.756, 11.231, 13.484);
scene.add(topLight);

const ambientLight = new THREE.AmbientLight(0x73509f, 0.4);
scene.add(ambientLight);

const backLight = new THREE.DirectionalLight(0xffffff, 0.6);
backLight.position.set(-0.741, 9.037, -11.487);
scene.add(backLight);

// Camera and controls
camera.position.z = 1.4;
camera.position.y = 0.3;

controls = new OrbitControls(camera, renderer.domElement);
controls.minDistance = 1.4;
controls.maxDistance = 1.4;
controls.enableZoom = true;
controls.enableRotate = true;
controls.enablePan = true;

// Control state management
let isDragging = false;
let isMousedown = false;

controls.addEventListener('start', () => {
  isMousedown = true;
  isDragging = false;
});

controls.addEventListener('change', () => {
  if (isMousedown) {
    isDragging = true;
  }
});

// Modified touch controls
controls.touchStart = function () {
  if (!touchStartedOnBox) {
    OrbitControls.prototype.touchStart.apply(controls, arguments);
  }
};

controls.touchMove = function () {
  if (!touchStartedOnBox) {
    OrbitControls.prototype.touchMove.apply(controls, arguments);
  }
};

controls.touchEnd = function () {
  if (!touchStartedOnBox) {
    OrbitControls.prototype.touchEnd.apply(controls, arguments);
  }
};

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
  labelRenderer.render(scene, camera);
}

// Resize handler
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  labelRenderer.setSize(window.innerWidth, window.innerHeight);
});

// Start animation
animate();
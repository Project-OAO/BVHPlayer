import * as THREE from "./jsm/build/three.module.js";
import { OrbitControls } from "./jsm/controls/OrbitControls.js";
import { BVHLoader } from "./jsm/loaders/BVHLoader.js";
import { GLTFLoader } from "./jsm/loaders/GLTFLoader.js";

const clock = new THREE.Clock();

let camera, controls, scene, renderer;
let mixer, skeletonHelper;

let animeStatus = true;

// -----------------------------------------------Three.js 의 기본 셋팅 ------------------------------------------
/*
 *   기본은 Three.js에서 돌아가는 것이다. 그에 따라 몇가지 설정을 해주어야 한다.
 *   설정에 대한 부분은 한번에 처리하기 위해서 모듈화하여 init 함수에 담고자 했다.
 *
 */

function initBvh() {
  // 캔바스 설정
  const canvas = document.querySelector("#three-canvas");

  // Scene에 대한 설정
  scene = new THREE.Scene();
  scene.background = new THREE.Color("#E1FFE1"); // 배경색에 대한 설정이다.

  scene.add(new THREE.GridHelper(800, 10));
  scene.add(new THREE.AxesHelper(600));

  // 카메라
  camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    1,
    1000
  );
  camera.position.set(0, 200, 300);
  scene.add(camera); // 카메라를 씬에 넣어주자.

  // renderer에 대한 설정
  renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
  });
  renderer.setPixelRatio(window.devicePixelRatio); // 차후 필요하면 삼항 연산자를 이용해서 정리해두자.
  renderer.setSize(window.innerWidth, window.innerHeight);
  //document.body.appendChild( renderer.domElement );

  controls = new OrbitControls(camera, renderer.domElement);
  controls.minDistance = 300;
  controls.maxDistance = 700;

  window.addEventListener("resize", onWindowResize); // 화면 사이즈가 변화하면 그에 맞춰서 변화해야 하는데 이에 대한 맞춤 설정이다.

  // gui.add(camera.position,'y',-1000,1000,0.01);
}

// 사이즈 조절과 관련된 함수이다.
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}

// -----------------------------------------------Animation 구현-------------------------------------------------
function animate() {
  const delta = clock.getDelta();

  if (animeStatus == true) {
    if (mixer) mixer.update(delta); // Mixer 구동을 위한 구현부
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  } else if (animeStatus == false) {
    requestAnimationFrame(animate);
  }
}
// animation 동작 제어 (pause, run)
function togleAnimate() {
  if (animeStatus == true) {
    animeStatus = false;
  } else if (animeStatus == false) {
    animeStatus = true;
  }
}
function playAnimate() {
  animeStatus = true;
}
function stopAnimate() {
  animeStatus = false;
}

function loadGLTF() {
  const gltfLoader = new GLTFLoader();

  gltfLoader.load("./models/skeleton.glb", (gltf) => {
    console.log("success");
    console.log(gltf);
  });
}
export { initBvh, loadGLTF, animate, playAnimate, stopAnimate, togleAnimate };

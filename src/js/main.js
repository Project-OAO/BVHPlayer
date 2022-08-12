import * as THREE from "./jsm/build/three.module.js";
import { OrbitControls } from "./jsm/controls/OrbitControls.js";
import { BVHLoader } from "./jsm/loaders/BVHLoader.js";
import { GLTFLoader } from "./jsm/loaders/GLTFLoader.js";
const clock = new THREE.Clock();

let camera, controls, scene, renderer;
let mixer, skeleton, model;

let animeStatus = true;
// let animeStatus;

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

function loadGLTF() {
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(100, 100),
    new THREE.MeshPhongMaterial({ color: 0xff3333, depthWrite: false })
  );
  mesh.rotation.x = -Math.PI / 2;
  mesh.receiveShadow = true;
  scene.add(mesh);
  const gltfLoader = new GLTFLoader();

  gltfLoader.load("./models/Xbot.glb", (gltf) => {
    console.log(gltf);
    model = gltf.scene;
    scene.add(model);
    console.log(model);
    skeleton = new THREE.SkeletonHelper(model);
    console.log(skeleton);
    skeleton.visible = true;
    scene.add(skeleton);

    mixer = new THREE.AnimationMixer(model);
    const actions = [];
    actions[0] = mixer.clipAction(gltf.animations[0]);
    actions[0].play();
  });
}

// -----------------------------------------------Animation 구현-------------------------------------------------
function animate() {
  const delta = clock.getDelta();
  if (animeStatus == true) {
    if (mixer) mixer.update(delta); // Mixer 구동을 위한 구현부
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
  } else if (animeStatus == false) {
    requestAnimationFrame(animate);
  }
}

export { initBvh, loadGLTF, animate };

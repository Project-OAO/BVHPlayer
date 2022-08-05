import * as THREE from './jsm/build/three.module.js'
import {OrbitControls} from "./jsm/controls/OrbitControls.js";
import {BVHLoader} from "./jsm/loaders/BVHLoader.js";
import Stats from './jsm/interfaces/Stats.js';

const clock = new THREE.Clock(); // Animation 동작을 위해서 구현해두었다.
const stats = new Stats(); // Stats를 사용하기 위한 메서드

let camera, controls, scene, renderer; // 기본적인 Three.js 모듈이다.
let mixer, skeletonHelper; // 스켈레톤 구현하기 위한 툴이다.

//get_bvh_list();
// //init_bvh();
// init();
// loadBVH();
// animate();



// -----------------------------------------------Three.js 의 기본 셋팅 ------------------------------------------
/*
*   기본은 Three.js에서 돌아가는 것이다. 그에 따라 몇가지 설정을 해주어야 한다.
*   설정에 대한 부분은 한번에 처리하기 위해서 모듈화하여 init 함수에 담고자 했다.
*
*/

function init() {
    // 캔바스 설정
    const canvas = document.querySelector("#three-canvas");

    // Scene에 대한 설정
    scene = new THREE.Scene();
    scene.background = new THREE.Color( "#E1FFE1" ); // 배경색에 대한 설정이다.

    scene.add( new THREE.GridHelper( 800, 10 ) );
    scene.add( new THREE.AxesHelper(600))

    // 카메라
    camera = new THREE.PerspectiveCamera(
        60,
        window.innerWidth / window.innerHeight,
        1,
        1000
    );
    camera.position.set( 0, 200, 300 );
    scene.add(camera); // 카메라를 씬에 넣어주자.

    // renderer에 대한 설정
    renderer = new THREE.WebGLRenderer( {
        canvas : canvas,
        antialias: true
    } );
    renderer.setPixelRatio( window.devicePixelRatio); // 차후 필요하면 삼항 연산자를 이용해서 정리해두자.
    renderer.setSize( window.innerWidth, window.innerHeight );
    //document.body.appendChild( renderer.domElement );

    controls = new OrbitControls( camera, renderer.domElement );
    controls.minDistance = 300;
    controls.maxDistance = 700;

    window.addEventListener( 'resize', onWindowResize ); // 화면 사이즈가 변화하면 그에 맞춰서 변화해야 하는데 이에 대한 맞춤 설정이다.

    document.body.appendChild(stats.domElement); // 이는 Frame 수를 체크하기 위한 것으로 차후 어늦어도 코드가 구현이 되면 제외시키자.
    // gui.add(camera.position,'y',-1000,1000,0.01);

}

// 사이즈 조절과 관련된 함수이다.
function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

}

// ---------------------------------------BVH 관련해서 서버와 통신 -------------------------------------------------
// 사용하지 않는 부분. 이 부분은 비동기 방식 때문에 HTML 문에서 구현을 해두었음.
let joint, motion;
let projectID, title, updateTime;
function get_bvh_list() {
    $.ajax({
        url: "https://www.vucoms.co.kr:8200/get_bvh_list",
        type: "POST",
        data: {
            "url": "www.vucoms.co.kr",
            "userID" : "solo"
        },
        dataType: 'json',
        success: function(data) {
            console.log(data);
            for (let key in data){
                console.log(data[key].PROJECTID);
            }
            // projectID = data.PROJECTID;
            // title = data.TITLE;
            // updateTime = data.UPDATETIME;
            // console.log(projectID, title,updateTime);
        }
    });
}
function init_bvh() {
    $.ajax({
        url: "https://www.vucoms.co.kr:8200/get_bvh",
        type: "POST",
        data: {
            "url": "https://www.vucoms.co.kr",
            "projectID": "solo"
        },
        dataType: 'json',
        success: function(data) {
            joint = data.bvhJoint;
            motion = data.bvhMotion;
            console.log(joint, motion);
        }
    });
}

// ------------------------------------------------BVH Loader --------------------------------------------------
/*
*   BVH Loader
*   Reference : 참고 레퍼런스가 없어서 소스코드를 보아야 함.
*
*   현재 우리는 개발을 하는게 중요하므로, 동작원리에 대한 세부적인 이해보다는 아래와 같이 스켈레톤으로 구현할 수 있는 방식으로
*   return 된다는 것을 확인하면 된다.
*
*
*/
function loadBVH(strBVH) {
    const loader = new BVHLoader(); // BVH Loader를 파싱 받는다.

// BVH Loader를 통해 받은 정보는 result로 나오게 되는데, 이를 바탕으로 skeleton을 이용해서 구현하게 된다.


    // loader.load("../../bvh/test2.bvh", function (result) { // Url에 BVH Player를 구현해두면 된다.
    //     skeletonHelper = new THREE.SkeletonHelper(result.skeleton.bones[0]);
    //     skeletonHelper.skeleton = result.skeleton; // allow animation mixer to bind to THREE.SkeletonHelper directly
    //
    //     const boneContainer = new THREE.Group();
    //     boneContainer.add(result.skeleton.bones[0]);
    //
    //     scene.add(skeletonHelper);
    //     scene.add(boneContainer);
    //
    //     // play animation
    //     mixer = new THREE.AnimationMixer(skeletonHelper);
    //     mixer.clipAction(result.clip).setEffectiveWeight(1.0).play();
    // })
    //console.log(strBVH);


// 위에 주석처리된 부분은 예제코드 부분이고, 해당 부분에서 parse만 따로 뺴내와서 스켈레톤 정보로 바꾼 다음 셋업해주는 형태로 바뀜.


// 이 부분이 핵심으로, 여기서 구현된 loader가 해당 내용을 스켈레톤 정보로 뿌리게 됨.
    let result = loader.parse(strBVH);
    skeletonHelper = new THREE.SkeletonHelper(result.skeleton.bones[0]);
    skeletonHelper.skeleton = result.skeleton; // allow animation mixer to bind to THREE.SkeletonHelper directly

    const boneContainer = new THREE.Group();
    boneContainer.add(result.skeleton.bones[0]);

    scene.add(skeletonHelper);
    scene.add(boneContainer);

    // play animation
    mixer = new THREE.AnimationMixer(skeletonHelper);
    mixer.clipAction(result.clip).setEffectiveWeight(1.0).play();
}


// ----------------------------------------------test----------------------------------------------------------


// -----------------------------------------------Animation 구현-------------------------------------------------
function animate() {

    stats.update(); // Frame 수 표시를 위한 메서드로 나중에 필요 없어지면 버리자.

    requestAnimationFrame( animate );

    const delta = clock.getDelta();

    if ( mixer ) mixer.update( delta ); // Mixer 구동을 위한 구현부

    renderer.render( scene, camera );

}
export{init,loadBVH,animate}
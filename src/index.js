import './style/main.css'
import * as THREE from 'three'
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader";
import BillboardReflection from "./BillboardReflection.module"

const resize = () => {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
}
window.addEventListener('resize', resize)

const scene = new THREE.Scene()

// load env map
new RGBELoader().load("/env.hdr", tex => {
    const pmremGenerator = new THREE.PMREMGenerator(renderer)
    pmremGenerator.compileEquirectangularShader()
    const envMap = pmremGenerator.fromEquirectangular(tex).texture

    scene.environment = scene.background = envMap
});



const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
camera.position.set(0, 5, 10)
scene.add(camera)

const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('.webgl')
})
renderer.setPixelRatio(window.devicePixelRatio)
resize();



const controls = new OrbitControls(camera, renderer.domElement);


const textureLoader = new THREE.TextureLoader()

const billboardMesh = new THREE.Mesh(new THREE.PlaneBufferGeometry(), new THREE.MeshBasicMaterial({
    map: textureLoader.load("/rubik.png"), // from https://www.flaticon.com/free-icons/cube
    transparent: true,
    side: THREE.DoubleSide
}))
billboardMesh.scale.setScalar(4)
billboardMesh.position.y = 5
scene.add(billboardMesh)


const ground = new THREE.Mesh(new THREE.PlaneBufferGeometry(64, 64), new THREE.MeshStandardMaterial({
    roughness: 2,
    metalness: 1,
    normalScale: new THREE.Vector2(0.1, 0.1),
    normalMap: textureLoader.load("/nrm.jpg"),
    roughnessMap: textureLoader.load("/rgh.png")
}))
ground.material.roughnessMap.wrapS = ground.material.roughnessMap.wrapT = ground.material.normalMap.wrapS = ground.material.normalMap.wrapT = THREE.RepeatWrapping
ground.material.roughnessMap.repeat.setScalar(4)
ground.material.normalMap.repeat.setScalar(4)
ground.rotation.x = -Math.PI / 2
scene.add(ground)


// enable reflections

let billboardReflection = new BillboardReflection()

billboardReflection.create(billboardMesh)
ground.material.onBeforeCompile = shader => billboardReflection.enableReflection(shader)

const loop = () => {
    controls.update();
    renderer.render(scene, camera)
    window.requestAnimationFrame(loop)
}

loop()
import * as THREE from 'three'

export function createScene() {
    const scene = new THREE.Scene()
    scene.background = new THREE.Color('#000000')
    const light = new THREE.AmbientLight(0xffffff, 0.8)
    scene.add(light)
    return scene
}

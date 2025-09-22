import * as THREE from 'three'

export class Planet {
    mesh: THREE.Mesh
    constructor(radius: number, color: string) {
        const geo = new THREE.SphereGeometry(radius, 64, 64)
        const mat = new THREE.MeshStandardMaterial({ color })
        this.mesh = new THREE.Mesh(geo, mat)
    }
}

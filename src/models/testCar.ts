import * as THREE from 'three';

export const testCarModel = () => {
    const meshes = [
        new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.8, 4.4), new THREE.MeshPhysicalMaterial({ color: 0xfe4a34 })),
        new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.5, 2.6), new THREE.MeshPhysicalMaterial({ color: 0xfff0e0 })),
    ];

    meshes[0].position.set(0, 0, 0);
    meshes[1].position.set(0, 0.65, -0.35);

    const group = new THREE.Group();
    meshes.forEach(m => group.add(m));
    return group;
};

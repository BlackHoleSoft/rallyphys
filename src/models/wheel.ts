import * as THREE from 'three';

export const wheelModel = (radius: number) => {
    const mesh = new THREE.Mesh(
        new THREE.CylinderGeometry(radius, radius, radius * 0.7, 10, 1),
        new THREE.MeshPhysicalMaterial({ color: 0x343434 }),
    );
    mesh.rotateZ(Math.PI / 2);
    const group = new THREE.Group();
    group.add(mesh);
    return group;
};

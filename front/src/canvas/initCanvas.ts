import * as THREE from 'three';

export const initCanvas = () => {
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('app')?.appendChild(renderer.domElement);

    return renderer;
};

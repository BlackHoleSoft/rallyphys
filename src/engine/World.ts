import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { testCarModel } from '../models/testCar';
import { wheelModel } from '../models/wheel';

export class World {
    private scene?: THREE.Scene;
    private camera?: THREE.PerspectiveCamera;
    private renderer: THREE.WebGLRenderer;
    private ambient?: THREE.AmbientLight;
    private sun?: THREE.DirectionalLight;
    private controls?: OrbitControls;
    private prevTime: number = 0;

    deltaTime: number = 1;
    fps: number = 0;

    constructor(renderer: THREE.WebGLRenderer) {
        this.renderer = renderer;

        this.init();
    }

    private updateLoop() {
        // console.log('FPS:', this.fps, this.deltaTime);

        this.controls?.update();
    }

    private init() {
        this.renderer.setClearColor(0xe2e2e2);

        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);

        this.ambient = new THREE.AmbientLight(0xe3e2e0);
        this.scene.add(this.ambient);

        this.sun = new THREE.DirectionalLight(0xffffbb, 0.9);
        this.sun.position.set(1, 3, 2);
        this.scene.add(this.sun);

        this.controls = new OrbitControls(this.camera, this.renderer.domElement);

        // test

        const car = testCarModel();
        this.scene.add(car);

        const wheels = new Array(4).fill(null).map(() => wheelModel(0.3));
        wheels.forEach((w, i) => {
            w.position.set(i % 2 ? -0.8 : 0.8, -0.4, i < 2 ? 1.5 : -1.4);
            this.scene!.add(w);
        });

        this.camera.position.z = -4;
        this.camera.position.y = 1.5;
        this.camera.position.x = -0.8;
        this.camera.lookAt(car.position);
        this.controls.update();
        //

        const loop = (time: DOMHighResTimeStamp) => {
            this.deltaTime = time - this.prevTime;
            this.fps = 1000 / this.deltaTime;

            this.updateLoop();

            this.renderer.render(this.scene!, this.camera!);

            this.prevTime = time;
        };

        this.renderer.setAnimationLoop(loop);
    }
}

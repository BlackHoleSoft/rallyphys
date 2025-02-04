import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { testCarModel } from '../models/testCar';
import { wheelModel } from '../models/wheel';
import { PhysicBody } from '../physics/PhysicBody';
import { CarPhys } from '../physics/CarPhys';
import { initController } from './controller';
import { createTestCar, createVehicle } from './factory/vehicleFactory';

export class World {
    private scene?: THREE.Scene;
    private camera?: THREE.PerspectiveCamera;
    private renderer: THREE.WebGLRenderer;
    private ambient?: THREE.AmbientLight;
    private sun?: THREE.DirectionalLight;
    private car?: CarPhys;
    private controls?: OrbitControls;
    private prevTime: number = 0;

    deltaTime: number = 0;
    fps: number = 0;

    constructor(renderer: THREE.WebGLRenderer) {
        this.renderer = renderer;

        this.init();
    }

    getCar() {
        return this.car;
    }

    private updateLoop() {
        // console.log('FPS:', this.fps, this.deltaTime);
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
        this.controls.enablePan = false;
        this.controls.minDistance = 3;
        this.controls.maxDistance = 6;
        this.controls.enableDamping = true;

        const plane = new THREE.Mesh(
            new THREE.PlaneGeometry(100, 100, 100, 100),
            new THREE.MeshPhysicalMaterial({
                color: 0x666666,
                wireframe: true,
            }),
        );
        plane.rotateX(Math.PI / 2);
        this.scene.add(plane);

        const { carPhysics, physicBody } = createTestCar(this.scene);
        this.car = carPhysics;

        this.camera.position.z = -5;
        this.camera.position.y = 1.4;
        this.camera.position.x = -0.8;
        this.camera.rotateY(Math.PI);
        // this.camera.lookAt(car.position);
        this.controls.update();

        initController(carPhysics);

        const loop = (time: DOMHighResTimeStamp) => {
            this.deltaTime = time - this.prevTime;
            this.fps = this.deltaTime ? 1000 / this.deltaTime : 0;

            this.updateLoop();

            carPhysics.update(this.deltaTime / 1000);

            this.controls!.target = physicBody.getObject().position.clone();
            this.controls!.target.y = 2;

            // const targetCameraPos = physicBody
            //     .getObject()
            //     .localToWorld(new THREE.Vector3(0, 3, -6))
            //     .sub(physicBody.getObject().position);
            // const posDelta = targetCameraPos.sub(this.camera!.position);

            // this.controls.
            // this.camera!.position.x += (posDelta.x / 1000) * this.deltaTime;
            // this.camera!.position.y += (posDelta.y / 1000) * this.deltaTime;
            // this.camera!.position.z += (posDelta.z / 1000) * this.deltaTime;

            this.controls?.update();

            this.renderer.render(this.scene!, this.camera!);

            this.prevTime = time;
        };

        this.renderer.setAnimationLoop(loop);

        // const startTime = Date.now();
        // setInterval(() => loop(Date.now() - startTime), 100);
    }
}

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { testCarModel } from '../models/testCar';
import { wheelModel } from '../models/wheel';
import { PhysicBody } from '../physics/PhysicBody';
import { CarPhys } from '../physics/CarPhys';
import { initController } from './controller';

export class World {
    private scene?: THREE.Scene;
    private camera?: THREE.PerspectiveCamera;
    private renderer: THREE.WebGLRenderer;
    private ambient?: THREE.AmbientLight;
    private sun?: THREE.DirectionalLight;
    private controls?: OrbitControls;
    private prevTime: number = 0;

    deltaTime: number = 0;
    fps: number = 0;

    constructor(renderer: THREE.WebGLRenderer) {
        this.renderer = renderer;

        this.init();
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

        // test

        const plane = new THREE.Mesh(
            new THREE.PlaneGeometry(100, 100, 100, 100),
            new THREE.MeshPhysicalMaterial({
                color: 0x666666,
                wireframe: true,
            }),
        );
        plane.rotateX(Math.PI / 2);
        plane.position.y = -0.6;
        this.scene.add(plane);

        const testCarGroup = new THREE.Group();

        const car = testCarModel();
        testCarGroup.add(car);

        const wheels = new Array(4).fill(null).map(() => wheelModel(0.3));
        wheels.forEach((w, i) => {
            w.position.set(i % 2 ? -0.8 : 0.8, -0.4, i < 2 ? 1.5 : -1.4);
            testCarGroup.add(w);
        });

        this.scene.add(testCarGroup);

        const testPhysObj = new PhysicBody(this.scene, testCarGroup, 1000, 1000);
        const testCarPhys = new CarPhys(testPhysObj, {
            mass: 1000,
            brakeTorque: 600,
            maxSteerAngle: Math.PI / 5,
            suspensionHardness: 1000,
            suspensionLength: 0.2,
            engine: {
                maxTorque: 300,
                pickRPMMax: 4500,
                pickRPMMin: 2100,
            },
            axles: [
                {
                    axlePosition: 1.2,
                    axleWidth: 0.7,
                    isDriving: false,
                    isSteering: true,
                    maxSteerAngle: Math.PI / 5,
                    leftWheel: {
                        friction: 0.8,
                        mass: 10,
                        radius: 0.3,
                        rotSpeed: 0,
                        prevPosition: new THREE.Vector3(),
                    },
                    rightWheel: {
                        friction: 0.8,
                        mass: 10,
                        radius: 0.3,
                        rotSpeed: 0,
                        prevPosition: new THREE.Vector3(),
                    },
                },
                {
                    axlePosition: -1.2,
                    axleWidth: 0.7,
                    isDriving: true,
                    isSteering: false,
                    maxSteerAngle: 0,
                    leftWheel: {
                        friction: 0.8,
                        mass: 10,
                        radius: 0.3,
                        rotSpeed: 0,
                        prevPosition: new THREE.Vector3(),
                    },
                    rightWheel: {
                        friction: 0.8,
                        mass: 10,
                        radius: 0.3,
                        rotSpeed: 0,
                        prevPosition: new THREE.Vector3(),
                    },
                },
            ],
        });

        this.camera.position.z = -5;
        this.camera.position.y = 1.4;
        this.camera.position.x = -0.8;
        this.camera.rotateY(Math.PI);
        // this.camera.lookAt(car.position);
        this.controls.update();
        //

        initController(testCarPhys);

        const loop = (time: DOMHighResTimeStamp) => {
            this.deltaTime = time - this.prevTime;
            this.fps = this.deltaTime ? 1000 / this.deltaTime : 0;

            this.updateLoop();

            // test
            testCarPhys.update(this.deltaTime / 1000);

            this.controls!.target = testCarGroup.position;
            this.controls?.update();
            // testPhysObj.update(this.deltaTime / 1000);
            //

            this.renderer.render(this.scene!, this.camera!);

            this.prevTime = time;
        };

        this.renderer.setAnimationLoop(loop);

        // const startTime = Date.now();
        // setInterval(() => loop(Date.now() - startTime), 100);
    }
}

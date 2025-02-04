import * as THREE from 'three';
import { PhysicBody } from '../../physics/PhysicBody';
import { CarPhys, ICarAxleBase, ICarEngine, ICarGearbox } from '../../physics/CarPhys';
import { testCarModel } from '../../models/testCar';
import { wheelModel } from '../../models/wheel';

export type CreateVehicleOptions = {
    carModel: THREE.Object3D;
    wheelModels: THREE.Object3D[];
    axles: ICarAxleBase[];
    engine: ICarEngine;
    gearbox: ICarGearbox;
    maxSteerAngle: number;
    wheelsFriction: number;
    mass: number;
    inertia: number;
    wheelRadius: number;
    brakeTorque: number;
    airFriction: number;
    suspensionHardness: number;
    bodyPosition?: THREE.Vector3;
};

export const createVehicle = (scene: THREE.Scene, options: CreateVehicleOptions) => {
    const carGroup = new THREE.Group();

    const bodyPos = options.bodyPosition || new THREE.Vector3();

    const car = options.carModel;
    car.position.set(bodyPos.x, bodyPos.y, bodyPos.z);
    carGroup.add(car);

    const wheels = options.wheelModels;
    wheels.forEach((w, i) => {
        w.position.set(i % 2 ? -0.8 : 0.8, -0.4, i < 2 ? 1.5 : -1.4);
        carGroup.add(w);
    });

    scene.add(carGroup);

    const wheelsCount = options.axles.length * 2;

    const physicBody = new PhysicBody(scene, carGroup, options.mass, options.inertia);
    const carPhysics = new CarPhys(
        physicBody,
        {
            mass: options.mass,
            brakeTorque: options.brakeTorque,
            airFriction: options.airFriction,
            maxSteerAngle: (options.maxSteerAngle / 180) * Math.PI,
            suspensionHardness: options.suspensionHardness,
            engine: options.engine,
            gearbox: options.gearbox,
            axles: options.axles.map(ax => ({
                ...ax,
                leftWheel: {
                    friction: options.wheelsFriction,
                    mass: options.mass / wheelsCount,
                    radius: options.wheelRadius,
                    rotSpeed: 0,
                },
                rightWheel: {
                    friction: options.wheelsFriction,
                    mass: options.mass / wheelsCount,
                    radius: options.wheelRadius,
                    rotSpeed: 0,
                },
            })),
        },
        options.wheelModels,
        options.carModel,
    );

    return {
        physicBody,
        carPhysics,
    };
};

export const createTestCar = (scene: THREE.Scene) => {
    const wheelRadius = 0.3;
    return createVehicle(scene, {
        engine: {
            maxTorque: 200,
            pickRPMMin: 2200,
            pickRPMMax: 4600,
            idleRPM: 1500,
        },
        gearbox: {
            ratios: [3.2, 0, 3.8, 2.4, 1.6, 1.0],
            mainRatio: 4.5,
            shiftTime: 0.3,
            minRPM: 1800,
            maxRPM: 4700,
        },
        axles: [
            {
                axlePosition: 1.3,
                axleWidth: 1.6,
                isDriving: false,
                isSteering: true,
            },
            {
                axlePosition: -1.3,
                axleWidth: 1.6,
                isDriving: true,
                isSteering: false,
            },
        ],
        mass: 1000,
        inertia: 950,
        brakeTorque: 1200,
        maxSteerAngle: 35,
        wheelRadius,
        wheelsFriction: 0.8,
        suspensionHardness: 2.2,
        airFriction: 0.4,
        carModel: testCarModel(),
        wheelModels: new Array(4).fill(null).map(() => wheelModel(wheelRadius)),
        bodyPosition: new THREE.Vector3(0, 0.7, 0),
    });
};

import { PhysicBody } from './PhysicBody';

export interface IMassObject {
    mass: number;
}

export interface ICarWheel extends IMassObject {
    radius: number;
    friction: number;
    steerAngle: number;
    rotSpeed: number; // rad per second
}

export interface ICarAxle {
    leftWheel: ICarWheel;
    rightWheel: ICarWheel;
    axleWidth: number;
    axlePosition: number;
    maxSteerAngle: number;
    isDriving: boolean;
}

export interface ICarEngine {
    maxTorque: number;
    pickRPMMin: number;
    pickRPMMax: number;
}

export interface ICarChasis extends IMassObject {
    axles: ICarAxle[];
    suspensionLength: number;
    suspensionHardness: number;
    engine: ICarEngine;
}

export class CarPhys {
    private physics: PhysicBody;

    private chasis: ICarChasis;

    private pedalAccel: number = 0;
    private pedalBrake: number = 0;
    private steering: number = 0; // in radians

    constructor(physics: PhysicBody, chasis: ICarChasis) {
        this.physics = physics;
        this.chasis = chasis;
    }

    private updateForces(dt: number) {
        this.physics.resetForces();

        this.chasis.axles.forEach(axle => {
            // torq forces
        });
    }

    update(dt: number) {
        this.physics.update(dt);
    }
}

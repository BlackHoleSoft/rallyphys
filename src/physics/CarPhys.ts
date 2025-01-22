import { PhysicBody } from './PhysicBody';
import * as THREE from 'three';

export interface IMassObject {
    mass: number;
}

export interface ICarWheel extends IMassObject {
    radius: number;
    friction: number;
    steerAngle: number;
    rotSpeed: number; // rad per second
    prevPosition: THREE.Vector3;
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
    brakeTorque: number;
    maxSteerAngle: number;
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

    private getWheelForceVector(value: number, steerAngle: number) {
        return this.physics
            .getObject()
            .localToWorld(new THREE.Vector3(0, 0, value).applyAxisAngle(new THREE.Vector3(0, 1, 0), steerAngle));
    }

    private getWheelSideVector(value: number, steerAngle: number) {
        return this.physics
            .getObject()
            .localToWorld(new THREE.Vector3(value, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), steerAngle));
    }

    private applyWheelForces(dt: number, wheel: ICarWheel, position: THREE.Vector3, isDrive: boolean) {
        const carVelocity = this.physics.getVelocity().length();

        // torq force
        if (isDrive) {
            this.physics.applyForce({
                position,
                vector: this.getWheelForceVector(this.chasis.engine.maxTorque * dt * this.pedalAccel, wheel.steerAngle),
            });
        }

        // brake force
        if (carVelocity > 0.01) {
            this.physics.applyForce({
                position,
                vector: this.getWheelForceVector(
                    -Math.sign(wheel.rotSpeed) * this.chasis.brakeTorque * dt * this.pedalBrake,
                    wheel.steerAngle,
                ),
            });
        }

        const worldWheelPosition = this.physics.getObject().localToWorld(position.clone());
        const wheelDeltaVector = worldWheelPosition.sub(wheel.prevPosition);
        const sideProjectedDelta = wheelDeltaVector.dot(this.getWheelSideVector(1, wheel.steerAngle).normalize());

        // side force
        if (carVelocity > 0.01) {
            this.physics.applyForce({
                position,
                vector: this.getWheelSideVector(
                    -sideProjectedDelta * wheel.friction * this.chasis.mass * 10,
                    wheel.steerAngle,
                ),
            });
        }

        wheel.prevPosition = worldWheelPosition;
    }

    private updateForces(dt: number) {
        this.physics.resetForces();

        this.chasis.axles.forEach(axle => {
            this.applyWheelForces(
                dt,
                axle.leftWheel,
                new THREE.Vector3(-axle.axleWidth / 2, 0, axle.axlePosition),
                axle.isDriving,
            );
            this.applyWheelForces(
                dt,
                axle.rightWheel,
                new THREE.Vector3(axle.axleWidth / 2, 0, axle.axlePosition),
                axle.isDriving,
            );
        });
    }

    update(dt: number) {
        this.updateForces(dt);

        this.physics.update(dt);

        // console.log('CAR:', this.pedalAccel, this.pedalBrake, this.steering, this.physics.getVelocity().length());
    }

    setAccel(value: number) {
        this.pedalAccel = Math.min(1, Math.max(0, value));
    }

    setBrake(value: number) {
        this.pedalBrake = Math.min(1, Math.max(0, value));
    }

    setSteering(value: number) {
        this.steering = Math.min(
            this.chasis.maxSteerAngle,
            Math.max(-this.chasis.maxSteerAngle, value * this.chasis.maxSteerAngle),
        );
    }
}

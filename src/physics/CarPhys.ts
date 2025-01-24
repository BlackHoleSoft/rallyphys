import { PhysicBody, PHYSICS_MIN_VELOCITY } from './PhysicBody';
import * as THREE from 'three';

export interface IMassObject {
    mass: number;
}

export interface ICarWheel extends IMassObject {
    radius: number;
    friction: number;
    rotSpeed: number; // rad per second
    prevPosition?: THREE.Vector3;
}

export interface ICarAxle {
    leftWheel: ICarWheel;
    rightWheel: ICarWheel;
    axleWidth: number;
    axlePosition: number;
    maxSteerAngle: number;
    isDriving: boolean;
    isSteering: boolean;
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
            .localToWorld(new THREE.Vector3(0, 0, value).applyAxisAngle(new THREE.Vector3(0, 1, 0), -steerAngle))
            .sub(this.physics.getObject().position);
    }

    private getWheelSideVector(value: number, steerAngle: number) {
        return this.physics
            .getObject()
            .localToWorld(new THREE.Vector3(value, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), -steerAngle))
            .sub(this.physics.getObject().position);
    }

    private applyWheelForces(
        dt: number,
        wheel: ICarWheel,
        position: THREE.Vector3,
        isDrive: boolean,
        isSteer: boolean,
    ) {
        // torq force
        if (isDrive) {
            this.physics.applyForce({
                position: position.clone(),
                vector: this.getWheelForceVector(
                    this.chasis.engine.maxTorque * this.pedalAccel,
                    isSteer ? this.steering : 0,
                ),
            });
        }

        // brake force
        // if (carVelocity > PHYSICS_MIN_VELOCITY) {
        //     this.physics.applyForce({
        //         position,
        //         vector: this.getWheelForceVector(
        //             -Math.sign(wheel.rotSpeed) * this.chasis.brakeTorque * this.pedalBrake,
        //             isSteer ? this.steering : 0,
        //         ),
        //     });
        // }

        const worldWheelPosition = this.physics.getObject().localToWorld(position.clone());
        const wheelDeltaVector = worldWheelPosition.clone().sub(wheel.prevPosition || worldWheelPosition.clone());
        const sideProjectedDelta = wheelDeltaVector.dot(this.getWheelSideVector(1, isSteer ? this.steering : 0));
        const sideProjectedSpeed = sideProjectedDelta / dt;

        const slipPoint = 0.4;
        const vForce =
            sideProjectedSpeed < slipPoint
                ? Math.pow(sideProjectedSpeed, 2) / Math.pow(slipPoint, 2)
                : 1 - (sideProjectedSpeed - slipPoint) * 4;

        // const fValue = -Math.sign(sideProjectedSpeed) * Math.pow(sideProjectedSpeed, 2);
        const fValue = -Math.sign(sideProjectedSpeed) * Math.min(1, Math.max(0.1, Math.pow(sideProjectedSpeed, 2)));

        // side force
        //if (sideProjectedSpeed > PHYSICS_MIN_VELOCITY) {
        this.physics.applyForce({
            position: position.clone(),
            vector: this.getWheelSideVector(fValue * wheel.friction * wheel.mass * 10, isSteer ? this.steering : 0),
        });
        //}

        wheel.prevPosition = worldWheelPosition.clone();
    }

    private updateForces(dt: number) {
        this.physics.resetForces();

        this.chasis.axles.forEach(axle => {
            this.applyWheelForces(
                dt,
                axle.leftWheel,
                new THREE.Vector3(-axle.axleWidth / 2, 0, axle.axlePosition),
                axle.isDriving,
                axle.isSteering,
            );
            this.applyWheelForces(
                dt,
                axle.rightWheel,
                new THREE.Vector3(axle.axleWidth / 2, 0, axle.axlePosition),
                axle.isDriving,
                axle.isSteering,
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

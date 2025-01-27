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
    xAngle?: number;
}

export interface ICarAxleBase {
    axleWidth: number;
    axlePosition: number;
    isDriving: boolean;
    isSteering: boolean;
}

export interface ICarAxle extends ICarAxleBase {
    leftWheel: ICarWheel;
    rightWheel: ICarWheel;
    axleWidth: number;
    axlePosition: number;
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
    suspensionHardness: number;
    engine: ICarEngine;
    brakeTorque: number;
    maxSteerAngle: number;
}

export class CarPhys {
    private physics: PhysicBody;

    private chasis: ICarChasis;

    private wheelModels: THREE.Object3D[];
    private bodyModel: THREE.Object3D;

    private bodyTiltX: number = 0;
    private bodyTiltZ: number = 0;

    private pedalAccel: number = 0;
    private pedalBrake: number = 0;
    private steering: number = 0; // in radians

    constructor(physics: PhysicBody, chasis: ICarChasis, wheels: THREE.Object3D[], body: THREE.Object3D) {
        this.physics = physics;
        this.chasis = chasis;

        this.wheelModels = wheels;
        this.bodyModel = body;
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

        const worldWheelPosition = this.physics.getObject().localToWorld(position.clone());
        const wheelDeltaVector = worldWheelPosition.clone().sub(wheel.prevPosition || worldWheelPosition.clone());
        const sideProjectedDelta = wheelDeltaVector.dot(this.getWheelSideVector(1, isSteer ? this.steering : 0));
        const dirProjectedDelta = wheelDeltaVector.dot(this.getWheelForceVector(1, isSteer ? this.steering : 0));
        const sideProjectedSpeed = sideProjectedDelta / dt;
        const dirProjectedSpeed = dirProjectedDelta / dt;

        // brake force (not blocked)
        if (dirProjectedSpeed > PHYSICS_MIN_VELOCITY) {
            this.physics.applyForce({
                position,
                vector: this.getWheelForceVector(
                    -Math.sign(dirProjectedSpeed) * this.chasis.brakeTorque * this.pedalBrake,
                    isSteer ? this.steering : 0,
                ),
            });
        }

        const maxPoint = 0.4;
        const slipPoint = 0.6;

        const fValue =
            -Math.sign(sideProjectedSpeed) *
            (Math.abs(sideProjectedSpeed) > slipPoint ? 0.2 : Math.min(1, Math.pow(sideProjectedSpeed / maxPoint, 2)));
        const sideForce = fValue * wheel.friction * wheel.mass * 10;

        // side force
        this.physics.applyForce({
            position: position.clone(),
            vector: this.getWheelSideVector(sideForce, isSteer ? this.steering : 0),
        });

        wheel.rotSpeed = dirProjectedSpeed / (2 * wheel.radius);

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

    private updateWheels(dt: number) {
        this.chasis.axles.forEach((axle, i) => {
            // left wheel
            let model = this.wheelModels[i * 2 + 0];
            model.position.set(-axle.axleWidth / 2, 0 + axle.leftWheel.radius, axle.axlePosition);
            model.setRotationFromAxisAngle(new THREE.Vector3(0, -1, 0), axle.isSteering ? this.steering : 0);
            model.rotateX(axle.leftWheel.xAngle || 0);
            axle.leftWheel.xAngle = (axle.leftWheel.xAngle || 0) + axle.leftWheel.rotSpeed * dt;

            // right wheel
            model = this.wheelModels[i * 2 + 1];
            model.position.set(axle.axleWidth / 2, 0 + axle.rightWheel.radius, axle.axlePosition);
            model.setRotationFromAxisAngle(new THREE.Vector3(0, -1, 0), axle.isSteering ? this.steering : 0);
            model.rotateX(axle.rightWheel.xAngle || 0);
            axle.rightWheel.xAngle = (axle.rightWheel.xAngle || 0) + axle.rightWheel.rotSpeed * dt;
        });
    }

    private updateBody(dt: number) {
        const accelX = this.physics
            .getAccel()
            .clone()
            .dot(
                this.physics
                    .getObject()
                    .localToWorld(new THREE.Vector3(1, 0, 0))
                    .sub(this.physics.getObject().position),
            );
        const accelZ = this.physics
            .getAccel()
            .clone()
            .dot(
                this.physics
                    .getObject()
                    .localToWorld(new THREE.Vector3(0, 0, 1))
                    .sub(this.physics.getObject().position),
            );

        const maxTilt = 0.2;
        const maxAccel = 3.0;

        this.bodyTiltX = Math.min(maxTilt, Math.max(-maxTilt, this.bodyTiltX - (accelZ / maxAccel) * dt));
        this.bodyTiltZ = Math.min(maxTilt, Math.max(-maxTilt, this.bodyTiltZ + (accelX / maxAccel) * dt));

        this.bodyTiltX = Math.min(
            maxTilt,
            Math.max(-maxTilt, this.bodyTiltX - Math.sign(this.bodyTiltX) * Math.pow(this.bodyTiltX * 6, 2) * dt),
        );
        this.bodyTiltZ = Math.min(
            maxTilt,
            Math.max(-maxTilt, this.bodyTiltZ - Math.sign(this.bodyTiltZ) * Math.pow(this.bodyTiltZ * 6, 2) * dt),
        );

        // this.bodyModel.setRotationFromEuler(new THREE.Euler(this.bodyTiltX, 0, this.bodyTiltZ));
        // this.bodyModel.setRotationFromAxisAngle(
        //     this.physics
        //         .getObject()
        //         .localToWorld(new THREE.Vector3(1, 0, 0))
        //         .sub(this.physics.getObject().position),
        //     this.bodyTiltX,
        // );

        // console.log(this.bodyTiltX, this.bodyTiltZ);

        this.bodyModel.setRotationFromEuler(new THREE.Euler(this.bodyTiltX, 0, this.bodyTiltZ, 'ZYX'));
        // this.bodyModel.setRotationFromAxisAngle(new THREE.Vector3(0, 0, 1), this.bodyTiltZ);
        // this.bodyModel.rotateX(this.bodyTiltX - this.bodyModel.rotation.x);
    }

    update(dt: number) {
        this.updateForces(dt);
        this.updateBody(dt);
        this.updateWheels(dt);

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

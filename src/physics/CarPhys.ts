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

export class CarPhys {}

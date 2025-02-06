export type Vector = [number, number]; // X, Z

export type Player = {
    id: string;
    position: Vector;
    velocity: Vector;
    accel: Vector;
    rotation: number;
    rotationSpeed: number;
    steering: number;
};

export type Update = {
    action: 'create' | 'update' | 'delete';
} & Partial<Player>;

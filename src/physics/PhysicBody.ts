import * as THREE from 'three';

export type Force = {
    vector: THREE.Vector3;
    position: THREE.Vector3;
};

export class PhysicBody {
    private object3d: THREE.Object3D;

    private mass: number = 1;
    private inertia: number = 1;

    private centerOfMass: THREE.Vector3 = new THREE.Vector3();

    private velocity: THREE.Vector3 = new THREE.Vector3();
    private angularVelocity: THREE.Vector3 = new THREE.Vector3();

    private acceleration: THREE.Vector3 = new THREE.Vector3();
    private angularAccel: THREE.Vector3 = new THREE.Vector3();

    private forces: Force[] = [];

    private debugLines: boolean = true;

    constructor(object: THREE.Object3D, mass: number, inertia: number, centerOfMass?: THREE.Vector3) {
        this.object3d = object;
        this.mass = mass;
        this.inertia = inertia;

        if (centerOfMass) this.centerOfMass = centerOfMass;
    }

    applyForce(force: Force) {
        this.forces.push(force);
    }

    resetForces() {
        this.forces = [];
    }

    update(dt: number) {
        this.updateAccel(dt);
        this.updateVelocity(dt);
        this.updateVisual(dt);

        // console.log('Phys:', this);
    }

    private updateAccel(dt: number) {
        this.acceleration.set(0, 0, 0);
        this.angularAccel.set(0, 0, 0);

        this.forces.forEach(f => {
            this.acceleration.set(
                this.acceleration.x + (f.vector.x / this.mass) * dt,
                this.acceleration.y + (f.vector.y / this.mass) * dt,
                this.acceleration.z + (f.vector.z / this.mass) * dt,
            );

            const forceWorldPosition = this.object3d.localToWorld(f.position).sub(this.object3d.position);
            const distToForce = forceWorldPosition.distanceTo(this.centerOfMass);
            const distVector = forceWorldPosition.sub(this.centerOfMass);
            const forceProjectXZ = f.vector.projectOnPlane(new THREE.Vector3(0, 1, 0));
            const angleY = this.signedAngleTo(forceProjectXZ, distVector.projectOnPlane(new THREE.Vector3(0, 1, 0)));
            const forceValueY = forceProjectXZ.length() * Math.sin(angleY);
            this.angularAccel.set(0, this.angularAccel.y + ((distToForce * forceValueY) / this.inertia) * dt, 0);

            // console.log(distToForce, forceValueY, Math.round((angleY / Math.PI) * 180));
        });
    }

    private updateVelocity(dt: number) {
        this.velocity.set(
            this.velocity.x + this.acceleration.x * dt,
            this.velocity.y + this.acceleration.y * dt,
            this.velocity.z + this.acceleration.z * dt,
        );

        this.angularVelocity.set(
            this.angularVelocity.x + this.angularAccel.x * dt,
            this.angularVelocity.y + this.angularAccel.y * dt,
            this.angularVelocity.z + this.angularAccel.z * dt,
        );
    }

    private updateVisual(dt: number) {
        this.object3d.position.set(
            this.object3d.position.x + this.velocity.x * dt,
            this.object3d.position.y + this.velocity.y * dt,
            this.object3d.position.z + this.velocity.z * dt,
        );
        this.object3d.rotateOnWorldAxis(new THREE.Vector3(0, 1, 0), -this.angularVelocity.y * dt);

        // console.log(this.angularVelocity.y, this.angularAccel.y);
    }

    private getNormal(u: THREE.Vector3, v: THREE.Vector3): THREE.Vector3 {
        return new THREE.Plane().setFromCoplanarPoints(new THREE.Vector3(), u, v).normal;
    }

    private signedAngleTo(u: THREE.Vector3, v: THREE.Vector3): number {
        const angle = u.angleTo(v);
        const normal = this.getNormal(u, v);
        return normal.y * angle;
    }
}

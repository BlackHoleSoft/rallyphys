import * as THREE from 'three';

export type Force = {
    /**
     * Force vector in world space
     */
    vector: THREE.Vector3;
    /**
     * Force position in local space
     */
    position: THREE.Vector3;
};

export class PhysicBody {
    private object3d: THREE.Object3D;
    private scene: THREE.Scene;

    private mass: number = 1;
    private inertia: number = 1;

    private centerOfMass: THREE.Vector3 = new THREE.Vector3();

    private velocity: THREE.Vector3 = new THREE.Vector3();
    private angularVelocity: THREE.Vector3 = new THREE.Vector3();

    private acceleration: THREE.Vector3 = new THREE.Vector3();
    private angularAccel: THREE.Vector3 = new THREE.Vector3();

    private forces: Force[] = [];

    private debugLines: boolean = true;
    private arrows: THREE.ArrowHelper[] = [];

    constructor(
        scene: THREE.Scene,
        object: THREE.Object3D,
        mass: number,
        inertia: number,
        centerOfMass?: THREE.Vector3,
    ) {
        this.scene = scene;
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

    getObject() {
        return this.object3d;
    }

    getVelocity() {
        return this.velocity;
    }

    update(dt: number) {
        this.updateArrows();

        this.updateAccel(dt);
        this.updateVelocity(dt);
        this.updateVisual(dt);

        // console.log('Phys:', this);
    }

    private updateArrows() {
        if (this.debugLines) {
            this.arrows.forEach(arr => this.scene.remove(arr));

            this.arrows = this.forces.map(
                f =>
                    new THREE.ArrowHelper(
                        f.vector.normalize(),
                        this.localToWorld(f.position),
                        f.vector.length(),
                        0xff3333,
                    ),
            );
            this.arrows.push(
                new THREE.ArrowHelper(
                    this.localDirToWorld(new THREE.Vector3(1, 0, 0)).normalize(),
                    this.object3d.position,
                    3,
                    0x3333ff,
                ),
            );
            this.arrows.push(
                new THREE.ArrowHelper(
                    this.localDirToWorld(new THREE.Vector3(0, 1, 0)).normalize(),
                    this.object3d.position,
                    3,
                    0x3333ff,
                ),
            );
            this.arrows.push(
                new THREE.ArrowHelper(
                    this.localDirToWorld(new THREE.Vector3(0, 0, 1)).normalize(),
                    this.object3d.position,
                    3,
                    0x3333ff,
                ),
            );

            this.arrows.push(
                new THREE.ArrowHelper(
                    this.acceleration.normalize(),
                    this.object3d.position,
                    this.acceleration.length(),
                    0xffbb33,
                ),
            );

            this.arrows.forEach(arr => this.scene.add(arr));
        }
    }

    private localDirToWorld(vector: THREE.Vector3) {
        return this.object3d.localToWorld(vector.clone()).sub(this.object3d.position);
    }

    private localToWorld(vector: THREE.Vector3) {
        return this.object3d.localToWorld(vector.clone());
    }

    private updateAccel(dt: number) {
        this.acceleration.set(0, 0, 0);
        this.angularAccel.set(0, 0, 0);

        this.forces.forEach(f => {
            this.acceleration.set(
                this.acceleration.x + f.vector.x / this.mass,
                this.acceleration.y + f.vector.y / this.mass,
                this.acceleration.z + f.vector.z / this.mass,
            );

            const forceWorldPosition = this.localToWorld(f.position).sub(this.object3d.position);
            const distToForce = forceWorldPosition.distanceTo(this.centerOfMass);
            const distVector = forceWorldPosition.sub(this.centerOfMass);
            const forceProjectXZ = f.vector.projectOnPlane(new THREE.Vector3(0, 1, 0));
            const angleY = this.signedAngleTo(forceProjectXZ, distVector.projectOnPlane(new THREE.Vector3(0, 1, 0)));
            const forceValueY = forceProjectXZ.length() * Math.sin(angleY);
            this.angularAccel.set(0, (distToForce * forceValueY) / this.inertia, 0);

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

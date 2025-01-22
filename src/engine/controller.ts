import { CarPhys } from '../physics/CarPhys';

export const initController = (car: CarPhys) => {
    window.addEventListener('keydown', e => {
        if (e.key === 'ArrowUp') {
            car.setAccel(1);
        }
        if (e.key === 'ArrowDown') {
            car.setBrake(1);
        }
        if (e.key === 'ArrowLeft') {
            car.setSteering(-1);
        }
        if (e.key === 'ArrowRight') {
            car.setSteering(1);
        }
    });

    window.addEventListener('keyup', e => {
        if (e.key === 'ArrowUp') {
            car.setAccel(0);
        }
        if (e.key === 'ArrowDown') {
            car.setBrake(0);
        }
        if (e.key === 'ArrowLeft') {
            car.setSteering(0);
        }
        if (e.key === 'ArrowRight') {
            car.setSteering(0);
        }
    });
};

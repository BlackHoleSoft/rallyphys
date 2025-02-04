import { initCanvas } from './canvas/initCanvas';
import { World } from './engine/World';
import { NetworkService } from './network/NetworkService';
import './style.css';
import { testGUI } from './testGui';

const init = () => {
    console.log('Start Awesome Rally...');

    const renderer = initCanvas();
    const world = new World(renderer);

    const network = new NetworkService();

    const testUiFn = testGUI();
    setInterval(() => {
        const uivars = world.getCar()?.getUiVars();
        testUiFn({
            fps: world.fps,
            rpm: uivars?.rpm || 0,
            gear: uivars?.gear || 0,
            speed: uivars?.speed || 0,
        });
    }, 300);
};

init();

import { initCanvas } from './canvas/initCanvas';
import { World } from './engine/World';
import './style.css';
import { testGUI } from './testGui';

const init = () => {
    console.log('Start Awesome Rally...');

    const renderer = initCanvas();
    const world = new World(renderer);

    const testUiFn = testGUI();
    setInterval(() => {
        testUiFn({
            fps: world.fps,
            rpm: world.getCar()?.getUiVars().rpm || 0,
        });
    }, 1000);
};

init();

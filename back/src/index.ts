import { initServer } from './server';

console.log('Starting server...');

const start = () => {
    initServer('localhost', 7777);
};

start();

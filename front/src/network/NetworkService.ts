import { io, Socket } from 'socket.io-client';

export class NetworkService {
    private socket: Socket;

    constructor() {
        this.socket = io('http://localhost:7777');

        this.socket.on('connect', () => console.log('Connected!', this.socket.id));
    }
}

import { Server } from 'socket.io';
import { createServer } from 'node:http';

export const initServer = (host: string, port: number) => {
    const server = createServer();
    const io = new Server(server, {
        cors: {
            origin: 'http://localhost:5173',
        },
    });

    io.on('connection', socket => {
        console.log('Connected:', socket.id);
    });

    server.listen(port, host, () => console.log(`server running at http://${host}:${port}`));
};

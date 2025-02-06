import { Player, Update, Vector } from './types';

export class Room {
    private name: string = '';
    private players: Player[] = [];
    private updates: Update[] = [];

    private readonly spawnPoint: Vector = [0, 0];
    private readonly updateInterval: number = Math.round(1000 / 20);
    private interval: number | null = null;

    constructor(name: string) {
        this.name = name;
    }

    onUpdate?: (updates: Update[]) => void;

    start() {
        this.interval = setInterval(this.update.bind(this), this.updateInterval);
    }

    stop() {
        if (this.interval) {
            clearInterval(this.interval);
        }
        this.players = [];
        this.updates = [];
    }

    addPlayer(id: string) {
        const newPlayer: Player = {
            id,
            position: [this.spawnPoint[0] + 3 * this.players.length, this.spawnPoint[1]],
            velocity: [0, 0],
            accel: [0, 0],
            rotation: 0,
            rotationSpeed: 0,
            steering: 0,
        };
        this.players.push(newPlayer);
        this.updates.push({
            ...newPlayer,
            action: 'create',
        });
    }

    removePlayer(id: string) {
        this.players = this.players.filter(f => f.id !== id);
        this.updates.push({
            id,
            action: 'delete',
        });
    }

    private update() {
        if (this.onUpdate) this.onUpdate(this.updates);
        this.updates = [];
    }
}

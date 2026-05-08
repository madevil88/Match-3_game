import { Sprite } from 'pixi.js';
import { gsap } from 'gsap';
import { getSprite } from '../utils';
import { Field } from './Field';

type Position = {
    x: number;
    y: number;
};

export class Tile {
    public field: Field | undefined;
    public sprite!: Sprite;
    public color: string;

    public constructor(color: string) {
        this.color = color;
        this.sprite = getSprite(this.color);
        this.sprite.anchor.set(0.5);
    }

    public setPosition(position: Position): void {
        this.sprite.x = position.x;
        this.sprite.y = position.y;
    }

    public moveTo(position: Position, duration: number, delay?: number, ease?: string): Promise<void> {
        return new Promise((resolve) => {
            gsap.to(this.sprite, {
                duration,
                delay,
                ease,
                x: position.x,
                y: position.y,
                onComplete: resolve
            });
        });
    }

    public isNeighbour(tile: Tile): boolean {
        if (!this.field || !tile.field) {
            return false;
        }
        return Math.abs(this.field.row - tile.field.row) + Math.abs(this.field.col - tile.field.col) === 1;
    }

    public remove(): void {
        gsap.killTweensOf(this.sprite);
        this.sprite.destroy();
        if (this.field) {
            this.field.clearTile();
        }
    }

    public fallDownTo(position: Position, delay: number): Promise<void> {
        return this.moveTo(position, 0.5, delay, 'bounce.out');
    }
}

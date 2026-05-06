import { Sprite, Container } from 'pixi.js';
import { getSprite } from '../utils';
import type { Tile } from './Tile';

type Position = {
    x: number;
    y: number;
};

export class Field {
    public container: Container;
    public row: number;
    public col: number;
    private readonly _allCols: number;
    public sprite: Sprite;
    private readonly _selected: Sprite;
    public tile?: Tile;

    public constructor(row: number, col: number, allCols: number) {
        this.container = new Container();
        this.row = row;
        this.col = col;
        this._allCols = allCols;

        this.sprite = this._createField('field', true);
        this._selected = this._createField('field-selected', false);

        this.container.addChild(this.sprite);
        this.container.addChild(this._selected);
        this.container.interactive = true;
    }

    private _createField(name: string, isVisible: boolean): Sprite {
        const sprite = getSprite(name);
        sprite.anchor.set(0.5);
        const fieldScale = window.innerWidth / (sprite.width * (this._allCols + 1));
        sprite.scale.set(fieldScale);
        sprite.x = this.col * sprite.width;
        sprite.y = this.row * sprite.height;
        sprite.visible = isVisible;
        return sprite;
    }

    public get position(): Position {
        return {
            x: this.col * this.sprite.width,
            y: this.row * this.sprite.height
        };
    }

    public select(): void {
        this._selected.visible = true;
    }

    public unselect(): void {
        this._selected.visible = false;
    }

    public setTile(tile: Tile): void {
        this.tile = tile;
        tile.field = this;
        tile.setPosition(this.position);
    }
}

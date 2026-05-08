import { Container, Sprite } from 'pixi.js';
import { gsap } from 'gsap';
import { getSprite } from '../utils';
import { App } from '../system/App';
import { Board } from './Board';
import { Field } from './Field';
import { ScoreManager } from './ScoreManager';
import type { Config } from '../system/Config';
import type { Tile } from './Tile';

export class Game {
    public container: Container;
    private readonly _board: Board;
    private _isDisabled: boolean = false;
    private _selectedTile: Tile | undefined = undefined;
    private readonly _scoreManager: ScoreManager;
    private _isGameStarted: boolean = false;
    private _bg!: Sprite;

    public constructor(config: typeof Config) {
        this.container = new Container();
        this.container.addChild(this._createBackground());

        this._board = new Board(config);
        this.container.addChild(this._board.container);
        this._board.container.on('tile-touch-start', this._onTileClick);

        const fieldRect = this._board.getFieldRect();
        this._scoreManager = new ScoreManager(config, fieldRect, () => App.resetGame());
        this.container.addChild(this._scoreManager.container);
        this._removeStartMatches();
    }

    private _removeStartMatches(): void {
        let matches = this._board.getMatches();

        while (matches.length) {
            this._removeMatches(matches);

            this._board.fields
                .filter((field) => field.tile === undefined)
                .forEach((field) => {
                    this._board.createTile(field);
                    this._board.container.addChild(field.tile!.sprite);
                });

            matches = this._board.getMatches();
        }
        this._isGameStarted = true;
    }

    private _createBackground(): Sprite {
        this._bg = getSprite('bg');
        this._bg.width = globalThis.innerWidth;
        this._bg.height = globalThis.innerHeight;
        return this._bg;
    }

    public resize(): void {
        this._bg.width = globalThis.innerWidth;
        this._bg.height = globalThis.innerHeight;
        this._board.adjustPosition();
        this._scoreManager.resize(this._board.getFieldRect());
    }

    private readonly _onTileClick = async (tile: Tile): Promise<void> => {
        if (this._isDisabled) {
            return;
        }
        if (this._selectedTile) {
            if (this._selectedTile.isNeighbour(tile)) {
                await this._swap(this._selectedTile, tile);
                this._clearSelection(tile);
            } else {
                this._clearSelection(tile);
                this._selectTile(tile);
            }
        } else {
            this._selectTile(tile);
        }
    };

    private async _swap(selectedTile: Tile, tile: Tile): Promise<void> {
        this._isDisabled = true;

        if (!tile.field || !selectedTile.field) {
            this._isDisabled = false;
            return;
        }

        const posA = { ...selectedTile.field.position };
        const posB = { ...tile.field.position };

        await selectedTile.moveTo(posB, 0.2);
        await tile.moveTo(posA, 0.2);

        this._board.swap(selectedTile, tile);
        this._clearSelection(tile);

        const matches = this._board.getMatches();
        if (matches.length) {
            await this._processMatches(matches);
        } else {
            await selectedTile.moveTo(posA, 0.2);
            await tile.moveTo(posB, 0.2);
            this._board.swap(tile, selectedTile);
        }

        this._isDisabled = false;
    }

    private _removeMatches(matches: Tile[][]): void {
        matches.forEach((match) => {
            match.forEach((tile) => {
                if (this._isGameStarted) {
                    this._scoreManager.decreaseScore();
                }
                tile.remove();
            });
        });
    }

    private async _processMatches(matches: Tile[][]): Promise<void> {
        this._removeMatches(matches);
        await this._processFallDown();
        await this._addTiles();
        await this._onFallDownOver();
    }

    private async _onFallDownOver(): Promise<void> {
        const matches = this._board.getMatches();

        if (matches.length) {
            await this._processMatches(matches);
        }
    }

    private async _addTiles(): Promise<void> {
        const fields = this._board.fields.filter((field) => field.tile === undefined);
        if (fields.length === 0) return;

        await Promise.all(
            fields.map(async (field) => {
                const tile = this._board.createTile(field);
                this._board.container.addChild(field.tile!.sprite);
                tile.sprite.y = -500;
                const delay = (Math.random() * 2) / 10 + 0.3 / (field.row + 1);
                await tile.fallDownTo(field.position, delay);
            })
        );
    }

    private async _processFallDown(): Promise<void> {
        const promises: Promise<void>[] = [];

        for (let row = this._board.rows - 1; row >= 0; row--) {
            for (let col = this._board.cols - 1; col >= 0; col--) {
                const field = this._board.getField(row, col);
                if (field && !field.tile) {
                    promises.push(this._fallDownTo(field));
                }
            }
        }

        await Promise.all(promises);
    }

    private _fallDownTo(emptyField: Field): Promise<void> {
        for (let row = emptyField.row - 1; row >= 0; row--) {
            const fallingField = this._board.getField(row, emptyField.col);

            if (fallingField?.tile) {
                const fallingTile = fallingField.tile;
                fallingField.tile = undefined;
                fallingTile.field = emptyField;
                emptyField.tile = fallingTile;
                return fallingTile.fallDownTo(emptyField.position, 0.1);
            }
        }

        return Promise.resolve();
    }

    private _clearSelection(tile: Tile): void {
        tile.field?.unselect();
        if (this._selectedTile?.field) {
            this._selectedTile.field.unselect();
            this._selectedTile = undefined;
        }
    }

    private _selectTile(tile: Tile): void {
        this._selectedTile = tile;
        if (this._selectedTile.field) {
            this._selectedTile.field.select();
        }
    }

    public destroy(): void {
        this._board.container.removeAllListeners();
        this._board.fields.forEach((field) => {
            if (field.tile) {
                gsap.killTweensOf(field.tile.sprite);
            }
        });
        this._scoreManager.destroy();
        this.container.destroy({ children: true });
    }
}

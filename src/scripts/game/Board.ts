import type { Config } from "../system/Config";
import { Container } from "pixi.js";
import { Field } from "./Field";
import { Tile } from "./Tile";

const getRandomRange = (min: number, max: number): number =>
  Math.floor(
    (window.crypto.getRandomValues(new Uint8Array(1))[0] / 256) *
      (max - min + 1)
  ) + min;

export type FieldRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export class Board {
  public container: Container;
  private readonly _field: Field;
  public fields: Field[];
  public readonly rows: number;
  public readonly cols: number;
  private _halfFieldWidth: number = 0;
  private _width: number = 0;
  private _height: number = 0;
  private _tileScale: number = 0;
  private readonly _combinationRules: { col: number; row: number }[][];
  private readonly _tilesColors: string[];
  private readonly _fieldMap: Map<string, Field> = new Map();

  public constructor(config: typeof Config) {
    const { rows, cols, combinationRules } = config.boardParams;

    this.container = new Container();
    this.fields = [];
    this.rows = rows;
    this.cols = cols;
    this._combinationRules = combinationRules;
    this._field = new Field(0, 0, cols);
    this._tilesColors = config.tilesColors;

    this._createFields();
    this.fields
      .map((field) => this.createTile(field))
      .forEach(({ sprite }) => this.container.addChild(sprite));
    this._adjustPosition();
  }

  public createTile(field: Field): Tile {
    const tile = this.generateRandomTile();
    field.setTile(tile);
    if (this._tileScale === 0) {
      this._tileScale = this._field.sprite.width / tile.sprite.width / 1.5;
    }
    tile.sprite.scale.set(this._tileScale);

    tile.sprite.interactive = true;
    tile.sprite.on("pointerdown", () => {
      this.container.emit("tile-touch-start", tile);
    });

    return tile;
  }

  public getField(row: number, col: number): Field | undefined {
    return this._fieldMap.get(`${row},${col}`);
  }

  private _createFields(): void {
    const total = this.rows * this.cols;

    for (let i = 0; i < total; i++) {
      const row = Math.floor(i / this.cols);
      const col = i % this.cols;
      const field = new Field(row, col, this.cols);
      this.fields.push(field);
      this._fieldMap.set(`${row},${col}`, field);
      this.container.addChild(field.container);
    }
  }

  private _adjustPosition(): void {
    const fieldWidth = this.fields[0].sprite.width;
    this._halfFieldWidth = fieldWidth / 2;
    this._width = this.cols * fieldWidth;
    this._height = this.rows * fieldWidth;

    const uiPadding = 60;
    const scale = Math.min(
      globalThis.innerWidth / this._width,
      (globalThis.innerHeight - uiPadding * 5) / this._height,
      1,
    );

    this.container.scale.set(scale);
    this._halfFieldWidth *= scale;
    this._width *= scale;
    this._height *= scale;

    this.container.x =
      (globalThis.innerWidth - this._width) / 2 + this._halfFieldWidth;
    this.container.y =
      (globalThis.innerHeight - this._height) / 2 +
      this._halfFieldWidth +
      uiPadding / 2;
  }

  public getFieldRect(): FieldRect {
    return {
      x: this.container.x - this._halfFieldWidth,
      y: this.container.y - this._halfFieldWidth,
      width: this._width,
      height: this._height,
    };
  }

  public swap(tile1: Tile, tile2: Tile): void {
    const tile1Field = tile1.field;
    const tile2Field = tile2.field;
    if (!tile1Field || !tile2Field) {
      console.error("One of the tiles does not have a field");
      return;
    }
    tile1Field.tile = tile2;
    tile2.field = tile1Field;

    tile2Field.tile = tile1;
    tile1.field = tile2Field;
  }

  public getMatches(): Tile[][] {
    return this.fields
      .filter((field) => field.tile !== undefined)
      .flatMap((checkingField) => {
        const checkingTile = checkingField.tile!;
        return this._combinationRules
          .map((offsets) => {
            const matchedTiles = offsets.map((offset) => {
              const field = this.getField(
                checkingField.row + offset.row,
                checkingField.col + offset.col,
              );
              return field?.tile;
            });

            const isValid = matchedTiles.every(
              (tile) => tile !== undefined && tile.color === checkingTile.color,
            );

            if (!isValid) return null;
            const tiles = matchedTiles.filter((t): t is Tile => t !== undefined);
            return [checkingTile, ...tiles];
          })
          .filter((match): match is Tile[] => match !== null);
      });
  }

  public generateRandomTile(): Tile {
    const color =
      this._tilesColors[getRandomRange(0, this._tilesColors.length - 1)];
    return new Tile(color);
  }
}

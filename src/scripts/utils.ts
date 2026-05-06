import { Assets, Sprite } from 'pixi.js';
import { Config } from './system/Config';

export const getSprite = (key: string): Sprite => {
    const asset = Config.assets.find((asset) => asset.alias === key);
    if (!asset) throw new Error(`Asset not found: ${key}`);
    const texture = Assets.get(asset.src);
    if (!texture) throw new Error(`Texture not found: ${key}`);
    return Sprite.from(texture);
};

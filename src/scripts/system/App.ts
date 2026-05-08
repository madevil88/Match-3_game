import * as PIXI from "pixi.js";
import { gsap } from "gsap";
import { PixiPlugin } from "gsap/PixiPlugin";
import { Config } from "./Config";
import { Game } from "../game/Game";

class GameApp {
  private _app!: PIXI.Application;
  private _scene!: Game;
  private readonly _config: typeof Config;
  private _resizeTimeout?: ReturnType<typeof globalThis.setTimeout>;

  public constructor(config: typeof Config) {
    this._config = config;
  }

  public async run(): Promise<void> {
    gsap.registerPlugin(PixiPlugin);
    PixiPlugin.registerPIXI(PIXI);

    this._app = new PIXI.Application();
    await this._app.init({
      resizeTo: globalThis as Window & typeof globalThis,
    });

    const container = document.querySelector("#app") ?? document.body;
    const containerRect = container.getBoundingClientRect();
    this._app.renderer.background.alpha = 0;
    this._app.renderer.resize(containerRect.width, containerRect.height);
    container.appendChild(this._app.canvas);
    await this._loadSprites(Config.assets);

    this._scene = new Game(this._config);
    this._app.stage.eventMode = "static";
    this._app.stage.addChild(this._scene.container);

    globalThis.addEventListener('resize', this._onResize);
  }

  private readonly _onResize = (): void => {
    clearTimeout(this._resizeTimeout);
    this._resizeTimeout = globalThis.setTimeout(() => this._scene.resize(), 200);
  };

  private async _loadSprites(
    assets: { alias: string; src: string }[],
  ): Promise<void> {
    await PIXI.Assets.load(assets);
  }

  public resetGame(): void {
    this._scene.destroy();
    this._app.stage.removeChildren();
    this._scene = new Game(this._config);
    this._app.stage.eventMode = "static";
    this._app.stage.addChild(this._scene.container);
  }
}

export const App = new GameApp(Config);

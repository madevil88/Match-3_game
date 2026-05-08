import { Container, Text, TextStyle, Graphics } from "pixi.js";
import { gsap } from "gsap";
import type { FieldRect } from "./Board";
import { GameTimer } from "./GameTimer";
import type { Config } from "../system/Config";

export class ScoreManager {
  public container: Container;
  private _score: number;
  private _scoreText!: Text;
  private _boardParams: FieldRect;
  private readonly _backgroundHeight: number = 50;
  private _isResultShown: boolean = false;
  private _gameTimer!: GameTimer;
  private readonly _gameTime: number;
  private readonly _onReset: () => void;
  private _resultTimeline?: gsap.core.Timeline;
  private _bgGraphics?: Graphics;
  private _resetButton?: Container;
  private _resultOverlay?: Graphics;
  private _resultTextNode?: Text;
  private _lastResult?: string;

  public constructor(
    config: typeof Config,
    fieldRect: FieldRect,
    onReset: () => void,
  ) {
    this.container = new Container();
    this._score = config.winScore;
    this._boardParams = fieldRect;
    this._gameTime = config.gameTime;
    this._onReset = onReset;
    this._init();
  }

  public decreaseScore(): void {
    if (this._isResultShown) return;
    this._score -= 1;
    this._scoreText.text = `Score: ${this._score}`;
    if (this._score <= 0) {
      this._showResult("You win!");
      this._gameTimer.stopTimer();
      this._isResultShown = true;
    }
  }

  private _showResult(message: string): void {
    this._lastResult = message;

    const background = new Graphics();
    background.rect(
      this._boardParams.x,
      this._boardParams.y,
      this._boardParams.width,
      this._boardParams.height,
    );
    background.fill({ color: 0x000000, alpha: 0.75 });
    this._resultOverlay = background;
    this.container.addChild(background);

    const style = new TextStyle({
      fontFamily: "Arial",
      fontSize: 50,
      fontWeight: "bold",
      fill: "#FF3000",
    });
    const resultText = new Text({
      text: message,
      style,
    });
    resultText.anchor.set(0.5);
    resultText.x = this._boardParams.x + this._boardParams.width / 2;
    resultText.y = this._boardParams.y + this._boardParams.height / 2;
    this._resultTextNode = resultText;
    this.container.addChild(resultText);

    this._resultTimeline = gsap.timeline({ repeat: -1, yoyo: true });

    this._resultTimeline
      .to(resultText, { duration: 1, pixi: { tint: 0xff3000 }, alpha: 1 })
      .to(resultText, { duration: 1, pixi: { tint: 0xffc700 }, alpha: 0.4 })
      .to(resultText, { duration: 1, pixi: { tint: 0xff3000 }, alpha: 1 })
      .to(resultText, { duration: 1, pixi: { tint: 0xffc700 }, alpha: 0.4 });
  }

  private _createBackground(): void {
    const background = new Graphics();
    background.roundRect(
      this._boardParams.x,
      this._boardParams.y - this._backgroundHeight,
      this._boardParams.width,
      this._backgroundHeight,
    );
    background.fill({ color: 0xececec });
    this._bgGraphics = background;
    this.container.addChild(background);
  }

  private _createScore(): void {
    const style = new TextStyle({
      fontFamily: "Arial",
      fontSize: 25,
      fill: "#000000",
    });

    this._scoreText = new Text({
      text: `Score: ${this._score}`,
      style,
    });
    this._scoreText.anchor.set(0.5);
    const padding = (this._backgroundHeight - this._scoreText.height) / 2;
    this._scoreText.x = this._boardParams.x + this._boardParams.width - padding - this._scoreText.width / 2;
    this._scoreText.y = this._boardParams.y - this._backgroundHeight / 2;

    this.container.addChild(this._scoreText);
  }

  private _createResetButton(): void {
    const button = new Container();
    button.eventMode = "static";

    const bg = new Graphics();
    bg.roundRect(0, 0, 150, 50, 10);
    bg.fill({ color: 0x000000, alpha: 0.5 });
    button.addChild(bg);

    const style = new TextStyle({
      fontFamily: "Arial",
      fontSize: 20,
      fill: "#ffffff",
    });

    const label = new Text({ text: "Reset Game", style });
    label.anchor.set(0.5);
    label.x = 75;
    label.y = 25;
    button.addChild(label);

    button.on("pointerdown", () => {
      this._onReset();
    });

    button.x =
      this._boardParams.width / 2 - button.width / 2 + this._boardParams.x;
    button.y = this._boardParams.y + this._boardParams.height + 5;

    this._resetButton = button;
    this.container.addChild(button);
  }

  private _init(): void {
    this._createBackground();
    this._createScore();
    this._createResetButton();
    const timerPosX =
      this._boardParams.x +
      (this._backgroundHeight - this._scoreText.height) / 2;
    const timerPosY = this._boardParams.y - this._backgroundHeight / 2;
    this._gameTimer = new GameTimer(
      timerPosX,
      timerPosY,
      this._gameTime,
      () => {
        this._showResult("Game Over!");
        this._isResultShown = true;
      },
    );
    this.container.addChild(this._gameTimer.container);
  }

  public resize(fieldRect: FieldRect): void {
    this._boardParams = fieldRect;

    const timerContainer = this._gameTimer.container;
    timerContainer.removeFromParent();

    this._bgGraphics?.destroy();
    this._bgGraphics = undefined;
    this._scoreText.destroy();
    this._resetButton?.destroy();
    this._resetButton = undefined;

    this._resultTimeline?.kill();
    this._resultTimeline = undefined;
    this._resultOverlay?.destroy();
    this._resultOverlay = undefined;
    this._resultTextNode?.destroy();
    this._resultTextNode = undefined;

    this._createBackground();
    this._createScore();
    this._createResetButton();

    const timerPosX = fieldRect.x + (this._backgroundHeight - this._scoreText.height) / 2;
    const timerPosY = fieldRect.y - this._backgroundHeight / 2;
    this._gameTimer.reposition(timerPosX, timerPosY);
    this.container.addChild(timerContainer);

    if (this._isResultShown && this._lastResult) {
      this._showResult(this._lastResult);
    }
  }

  public destroy(): void {
    this._resultTimeline?.kill();
    this._gameTimer.destroy();
    this.container.destroy({ children: true });
  }
}

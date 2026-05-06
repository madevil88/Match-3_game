import { Container, Text, TextStyle } from 'pixi.js';
import { gsap } from 'gsap';

export class GameTimer {
    public container: Container;
    private _timeLeft: number;
    private _timerText!: Text;
    private _intervalId?: number;
    private readonly _onComplete?: () => void;

    public constructor(x: number, y: number, gameTime: number, onComplete?: () => void) {
        this.container = new Container();
        this._timeLeft = gameTime;
        this._onComplete = onComplete;
        this._createTimer(x, y);
        this._startTimer();
    }

    private _createTimer(x: number, y: number): void {
        const style = new TextStyle({
            fontFamily: 'Arial',
            fontSize: 25,
            fill: '#000000'
        });

        this._timerText = new Text({ text: `Time: ${this._timeLeft}`, style });
        this._timerText.x = x;
        this._timerText.y = y - this._timerText.height / 2;
        this.container.addChild(this._timerText);

        gsap.to(this._timerText.scale, {
            x: 1.05,
            y: 1.05,
            duration: 0.5,
            yoyo: true,
            repeat: -1,
            ease: 'power1.inOut'
        });
    }

    private _startTimer(): void {
        this._intervalId = window.setInterval(() => {
            this._timeLeft--;
            this._timerText.text = `Time: ${this._timeLeft}`;

            if (this._timeLeft <= 0) {
                this.stopTimer();
                if (this._onComplete) this._onComplete();
            }
        }, 1000);
    }

    public stopTimer(): void {
        if (this._intervalId !== undefined) {
            clearInterval(this._intervalId);
            this._intervalId = undefined;
        }
    }
}

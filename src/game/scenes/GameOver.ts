import { EventBus } from '../EventBus';
import { Scene } from 'phaser';

export class GameOver extends Scene
{
    constructor ()
    {
        super('GameOver');
    }

    create ()
    {
        const finalScore = this.registry.get('finalScore') as number ?? 0;
        const prevBest = parseInt(localStorage.getItem('runner-highscore') ?? '0', 10);
        const isNewRecord = finalScore > prevBest;
        if (isNewRecord) {
            localStorage.setItem('runner-highscore', String(finalScore));
        }

        const isPortrait = this.scale.width < this.scale.height;
        const W = isPortrait ? this.scale.height : this.scale.width;
        const H = isPortrait ? this.scale.width : this.scale.height;
        const fs = Math.min(H / 768, 1); // フォントスケール（スマホ横画面対応）

        // 背景（ゲームと同じ）
        const bgScale = H / 768;
        this.add.tileSprite(W/2, H/2, W, H, 'bg').setTileScale(bgScale, bgScale);

        // 地面
        this.add.tileSprite(W/2, H - 34, W, 68, 'ground-tex');

        // 白い半透明オーバーレイ
        const overlay = this.add.graphics();
        overlay.fillStyle(0xffffff, 0.45);
        overlay.fillRoundedRect(W * 0.1, H * 0.14, W * 0.8, H * 0.62, 32);

        // やわらかいピーチのボーダー
        overlay.lineStyle(4, 0xF9D3AD, 1);
        overlay.strokeRoundedRect(W * 0.1, H * 0.14, W * 0.8, H * 0.62, 32);

        // "GAME OVER" タイトル
        const gameOverText = this.add.text(W/2, -100, 'GAME OVER', {
            fontFamily: 'Tsukimi Rounded',
            fontSize: Math.round(80 * fs),
            color: '#ffffff',
            stroke: '#ffb3b3',
            strokeThickness: 10,
            shadow: {
                offsetX: 0,
                offsetY: 6,
                color: '#ffaaaa',
                blur: 0,
                fill: true
            }
        }).setOrigin(0.5).setDepth(10);

        this.tweens.add({
            targets: gameOverText,
            y: H * 0.32,
            duration: 600,
            ease: 'Bounce.Out'
        });

        this.add.text(W/2, H * 0.46, `SCORE: ${finalScore}`, {
            fontFamily: 'Tsukimi Rounded',
            fontSize: Math.round(36 * fs),
            color: '#ffd700'
        }).setOrigin(0.5).setDepth(10);

        const bestScore = isNewRecord ? finalScore : prevBest;
        this.add.text(W/2, H * 0.555, `BEST: ${bestScore}`, {
            fontFamily: 'Tsukimi Rounded',
            fontSize: Math.round(28 * fs),
            color: '#5a4a3a'
        }).setOrigin(0.5).setDepth(10);

        if (isNewRecord) {
            const newRecordText = this.add.text(W/2, H * 0.638, 'NEW RECORD!', {
                fontFamily: 'Tsukimi Rounded',
                fontSize: Math.round(24 * fs),
                color: '#ffffff',
                stroke: '#B5FBDF',
                strokeThickness: 6
            }).setOrigin(0.5).setDepth(10);

            this.tweens.add({
                targets: newRecordText,
                alpha: 0,
                duration: 400,
                yoyo: true,
                repeat: -1
            });
        }

        this.time.delayedCall(800, () => {
            const restartText = this.add.text(W/2, H * 0.715, 'PRESS SPACE TO RESTART', {
                fontFamily: 'Tsukimi Rounded',
                fontSize: Math.round(22 * fs),
                color: '#5a4a3a'
            }).setOrigin(0.5).setDepth(10);

            this.tweens.add({
                targets: restartText,
                alpha: 0,
                duration: 600,
                yoyo: true,
                repeat: -1
            });

            const restart = () => {
                this.cameras.main.fadeOut(500, 0, 0, 0);
                this.cameras.main.once('camerafadeoutcomplete', () => {
                    this.scene.start('Game');
                });
            };

            this.input.keyboard!.once('keydown-SPACE', restart);
            this.input.once('pointerdown', restart);
        });

        EventBus.emit('current-scene-ready', this);
    }
}

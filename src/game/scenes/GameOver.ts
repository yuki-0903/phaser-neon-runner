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
        
        const finalScore = this.registry.get("finalScore") as number ?? 0;
        const prevBest = parseInt(localStorage.getItem("runner-highscore") ?? "0", 10);
        const isNewRecord = finalScore > prevBest;
        if( isNewRecord ) {
            localStorage.setItem("runner-highscore", String(finalScore));
        }

        const W = this.scale.width;
        const H = this.scale.height;

        const overlay = this.add.graphics();
        overlay.fillStyle(0x000000, 0.7);
        overlay.fillRect(0,0,W,H);

        overlay.lineStyle(3, 0x00f5ff);
        overlay.strokeRect(W*0.05, H*0.2, W*0.9, H*0.52);

        const gameOverText = this.add.text(W/2,-100,"GAME OVER", {
            fontFamily: "Arial Black",
            fontSize: 80,
            color: "#ff2d6b",
            stroke: "#ffffff",
            strokeThickness: 4
        }).setOrigin(0.5);

        this.tweens.add({
            targets: gameOverText,
            y: H * 0.36,
            duration: 600,
            ease: "Bounce.Out"
        })

        this.add.text(W/2, H * 0.48, `SCORE: ${finalScore}`, {
            fontFamily: "Arial Black",
            fontSize: 36,
            color: "#ffd700"
        }).setOrigin(0.5);

        const bestScore = isNewRecord ? finalScore: prevBest;
        this.add.text(W/2, H * 0.547, `BEST: ${bestScore}`, {
            fontFamily: "Arial",
            fontSize: 28,
            color: "#ffffff"
        }).setOrigin(0.5);

        if (isNewRecord) {                                        
            const newRecordText = this.add.text(W/2, H * 0.612, 'NEW RECORD!', {                                                 
                fontFamily: 'Arial Black',                          
                fontSize: 24,                                       
                color: '#00f5ff'                                  
            }).setOrigin(0.5);                                    

            this.tweens.add({                                       
                targets: newRecordText,
                alpha: 0,                                           
                duration: 400,
                yoyo: true,                                       
                repeat: -1
            });
        }

        this.time.delayedCall(800, () => {
            const restartText = this.add.text(W/2, H * 0.677, "PRESS SPACE TO RESTART", {
                fontFamily: "Arial",
                fontSize: 22,
                color: "#ffffff"
            }).setOrigin(0.5);

            this.tweens.add({
                targets: restartText,
                alpha:0,
                duration: 600,
                yoyo: true,
                repeat: -1
            })

            this.input.keyboard!.once("keydown-SPACE", () => {
                this.cameras.main.fadeOut(500,0,0,0);
                this.cameras.main.once("camerafadeoutcomplete", () => {
                    this.scene.start("Game");
                })
            })

            this.input.once("pointerdown", () => {
                this.cameras.main.fadeOut(500,0,0,0);
                this.cameras.main.once("camerafadeoutcomplete", () => {
                    this.scene.start("Game");
                })
            })
        })

        
        EventBus.emit('current-scene-ready', this);
    }

}

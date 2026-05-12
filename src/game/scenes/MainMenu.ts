import { Scene } from 'phaser';

import { EventBus } from '../EventBus';

export class MainMenu extends Scene
{
    constructor ()
    {
        super('MainMenu');
    }

    create ()
    {
        const W = this.scale.width;
        const H = this.scale.height;

        const bg = this.add.graphics();
        bg.fillStyle(0x0a0a1a);
        bg.fillRect(0, 0, W, H);

        const titleText = this.add.text(W/2, -100, 'NEON RUNNER', {
            fontFamily: 'Arial Black',                              
            fontSize: 72,                                          
            color: '#00f5ff',                                          
            stroke: '#00f5ff',                                    
            strokeThickness: 20                                     
        }).setOrigin(0.5).setAlpha(0.4);

        this.tweens.add({
            targets: titleText,
            y: H * 0.26,
            duration: 800,
            ease: 'Bounce.Out'
        });

        const titleText2 = this.add.text(W/2, -100, 'NEON RUNNER', {
            fontFamily: 'Arial Black',
            fontSize: 72,
            color: '#ffffff',
            stroke: '#00f5ff',
            strokeThickness: 4
        }).setOrigin(0.5);

        this.tweens.add({
            targets: titleText2,
            y: H * 0.26,
            duration: 800,
            ease: 'Bounce.Out'
        });

        const startText = this.add.text(W/2, H * 0.585, "PRESS SPACE OR TAP TO PLAY",{
            fontFamily: "Arial",
            fontSize: 24,
            color: "#ffffff"
        }).setOrigin(0.5);

        this.tweens.add({
            targets: startText,
            alpha: 0,
            duration: 600,
            yoyo: true,
            repeat: -1
        })

        const StartGame = () => {
            this.cameras.main.fadeOut(500, 0,0,0);
            this.cameras.main.once("camerafadeoutcomplete", ()=> {
                this.scene.start("Game")
            })
        }

        this.input.keyboard!.once("keydown-SPACE", StartGame);
        this.input.once("pointerdown", StartGame);

         const best = localStorage.getItem("runner-highscore");
        if(best) {
            this.add.text(W/2, H * 0.65, `BEST: ${best}`, {
                fontFamily: "Arial",
                fontSize: 20,
                color: "#ffd700"
            }).setOrigin(0.5);
        }
        EventBus.emit('current-scene-ready', this);
    }

}

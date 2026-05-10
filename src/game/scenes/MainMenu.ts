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
        const bg = this.add.graphics();
        bg.fillStyle(0x0a0a1a);
        bg.fillRect(0, 0, 1024, 768);

        const titleText = this.add.text(512, -100, 'NEON RUNNER', {                    
            fontFamily: 'Arial Black',                              
            fontSize: 72,                                          
            color: '#00f5ff',                                          
            stroke: '#00f5ff',                                    
            strokeThickness: 20                                     
        }).setOrigin(0.5).setAlpha(0.4);

        this.tweens.add({
            targets: titleText,                                     
            y: 200,     
            duration: 800,                                        
            ease: 'Bounce.Out'
        }); 

        const titleText2 = this.add.text(512, -100, 'NEON RUNNER', {
            fontFamily: 'Arial Black',                            
            fontSize: 72,
            color: '#ffffff',                                       
            stroke: '#00f5ff',
            strokeThickness: 4                                      
        }).setOrigin(0.5);

        this.tweens.add({
            targets: titleText2,                                     
            y: 200,     
            duration: 800,                                        
            ease: 'Bounce.Out'
        }); 

        const startText = this.add.text(512, 450, "PRESS SPACE OR TAP TO PLAY",{
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
            this.add.text(512, 500, `BEST: ${best}`, {
                fontFamily: "Arial",
                fontSize: 20,
                color: "#ffd700"
            }).setOrigin(0.5);
        }
        EventBus.emit('current-scene-ready', this);
    }

}

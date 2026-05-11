import { Scene } from 'phaser';

export class Preloader extends Scene
{
    constructor ()
    {
        super('Preloader');
    }
    preload () {
        // 走り・ジャンプを1枚にまとめたスプライトシート（6x6=36フレーム、1フレーム 958×960px）
        this.load.spritesheet("player", "assets/player/player.png",{
            frameWidth: 958,
            frameHeight: 960
        });
        // 背景画像（1344×768px、tileSprite でループスクロール）
        this.load.image('bg', 'assets/bg/bg.png');
    }
    create ()
    {
        

        const g2 = this.make.graphics(); 
        // hot-pink 矩形                                 
        g2.fillStyle(0xff2d6b);                          
        g2.fillRect(0, 0, 32, 64);                       
                                                        
        // ハイライト（白を薄く左端に）                  
        g2.fillStyle(0xffffff, 0.3);
        g2.fillRect(0, 0, 8, 64);                        
                                                        
        g2.generateTexture('obstacle-tex', 32, 64);    
        g2.destroy();  

        // ground-tex: 64×32 ダークタイル + cyan上端ライン                                   
        const g3 = this.make.graphics();                 
                                                        
        g3.fillStyle(0x16213e);                          
        g3.fillRect(0, 0, 64, 32);                     
                                                        
        // cyan上端ライン
        g3.fillStyle(0x00f5ff);                        
        g3.fillRect(0, 0, 64, 2);                        
        
        g3.generateTexture('ground-tex', 64, 32);        
        g3.destroy();   
                                                        
        // ground-hitbox-tex: 4×4 白矩形
        const g4 = this.make.graphics();                 
                        
        g4.fillStyle(0xffffff);                        
        g4.fillRect(0, 0, 4, 4);
                                                        
        g4.generateTexture('ground-hitbox-tex', 4, 4);
        g4.destroy(); 
        this.scene.start('MainMenu');
    }
}

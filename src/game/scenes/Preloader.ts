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

        // 障害物（切り株）画像
        this.load.image('obstacle','assets/obstacle/stump.webp');
    }
    create ()
    { 

        // ground-tex: 64×32 ダークタイル + cyan上端ライン
        const g3 = this.make.graphics();

        g3.fillStyle(0xe8c87a);
        g3.fillRect(0, 0, 64, 32);

        // cyan上端ライン
        g3.fillStyle(0xe8c87a);
        g3.fillRect(0, 0, 64, 2);

        // 小石テクスチャ 
        g3.fillStyle(0xd4b060);
        g3.fillRect(10, 8, 4, 2); 
        g3.fillRect(40, 10, 4, 2);

        g3.generateTexture('ground-tex', 64, 32);
        g3.destroy();
                                                        
        // ground-hitbox-tex: 4×4 白矩形
        const g4 = this.make.graphics();                 
                        
        g4.fillStyle(0xffffff);                        
        g4.fillRect(0, 0, 4, 4);
                                                        
        g4.generateTexture('ground-hitbox-tex', 4, 4);
        g4.destroy();

        this.anims.create({
            key: 'run',
            frames: this.anims.generateFrameNumbers('player', {
                frames: [0,1,2,3,4,22,23,24,25,26,27,28,29,30,31,32,33,34,35]
            }),
            frameRate: 12,
            repeat: -1
        });

        this.anims.create({
            key: 'jump',
            frames: this.anims.generateFrameNumbers('player', { start: 5, end: 21 }),
            frameRate: 12,
            repeat: 0
        });

        this.scene.start('MainMenu');
    }
}

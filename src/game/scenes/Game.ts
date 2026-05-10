import { EventBus } from '../EventBus';
import { Scene,Physics,Math as PhaserMath } from 'phaser';

export class Game extends Scene
{
    // --- クラスフィールド ---
    private player: Phaser.Physics.Arcade.Image;
    private ground: Phaser.GameObjects.TileSprite;
    private obstacles: Phaser.Physics.Arcade.Group;
    private scoreText: Phaser.GameObjects.Text;
    private score: number = 0;
    private speed: number = 300;        // 現在の移動速度 (px/s)
    private isAlive: boolean = true;
    private spawnTimer: Phaser.Time.TimerEvent;
    private bgOffset: number = 0;
    private bgGraphics: Phaser.GameObjects.Graphics;

    constructor ()
    {
        super('Game');
    }

    create ()
    {
        // --- 状態リセット（シーン再起動時のため）---
        this.score = 0;
        this.speed = 300;
        this.isAlive = true;
        this.bgOffset = 0;
        this.bgGraphics = null!;

        // --- 背景 ---
        this.drawBackground(0);

        // --- 地面（見た目・スクロールする）---
        this.ground = this.add.tileSprite(512, 734, 1024, 68,"ground-tex")
                    .setDepth(5);

        // --- 地面コライダー（透明・プレイヤーが乗る床）---
        const groundHitBox = this.physics.add.staticImage(512, 702, "ground-hitbox-tex")
                                .setDisplaySize(1024,4)
                                .setAlpha(0)
                                .refreshBody();

        // --- プレイヤー ---
        this.player = this.physics.add.image(150,640, "player-tex").setDepth(20);
        this.player.setCollideWorldBounds(true);

        // --- コライダー設定 ---
        this.physics.add.collider(this.player, groundHitBox);

        // --- 障害物グループ（最大10個を使い回す）---
        this.obstacles = this.physics.add.group({
            classType: Physics.Arcade.Image,
            maxSize: 10
        });

        this.physics.add.collider(this.player, this.obstacles, ()=> {
            this.onPlayerHitObstacle();
        });

        // --- スコアUI（右上）---
        this.scoreText = this.add.text(980, 20, "SCORE:0",{
            fontFamily: "Arial Black",
            fontSize: 24,
            color: "#ffd700"
        }).setOrigin(1,0).setDepth(30);

        // --- 障害物タイマー起動 ---
        this.spawnTimer = this.time.delayedCall(1500, this.spawnObstacle, [], this);

        // --- 入力（Space / タップでジャンプ）---
        this.input.keyboard!.on('keydown-SPACE', () => this.jump());
        this.input.on('pointerdown', () => this.jump());

        EventBus.emit('current-scene-ready', this);
    }

    update(_time: number, delta: number): void {
        if(!this.isAlive) return;

        // パラレックス背景を更新
        this.bgOffset += this.speed * delta / 1000;
        this.drawBackground(this.bgOffset);

        // 地面をスクロール
        this.ground.tilePositionX += this.speed * delta / 1000;

        // 速度を徐々に上げる（最大800）
        this.speed = Math.min(800, this.speed + 15 * delta / 1000);

        // スコアを更新（速いほど高得点）
        this.score += (this.speed / 300) * delta / 1000 * 10;
        this.scoreText.setText(`SCORE: ${Math.floor(this.score)}`);

        // 画面外に出た障害物を回収
        this.obstacles.getChildren().forEach((obj) => {
            const obs = obj as Physics.Arcade.Image;
            if(obs.active && obs.x < -100) {
                this.obstacles.killAndHide(obs);
            }
        });
    }

    // ジャンプ（接地中のみ・シングルジャンプ）
    private jump(): void {
        if(!this.isAlive) return;

        const body = this.player.body as Physics.Arcade.Body;
        if(!body.blocked.down) return;  // 空中では不可
        body.setVelocityY(-500);        // ← ジャンプ力（絶対値を小さくすると低くなる）

        // スカッシュ＆ストレッチtween
        this.tweens.add({
            targets: this.player,
            scaleX: 0.7,
            scaleY: 1.3,
            duration: 80,
            yoyo: true
        });
    }

    // 障害物をスポーン
    private spawnObstacle(): void {
        if(!this.isAlive) return;

        // 3種類のサイズをランダムに選択
        const variants = [
            {w:32, h: 48},
            {w:48, h: 64},
            {w:64, h:40}
        ];
        const v = variants[PhaserMath.Between(0,2)];

        const obs = this.obstacles.get(1100, 702-v.h /2, "obstacle-tex") as Physics.Arcade.Image;
        if(!obs) return;

        obs.setActive(true).setVisible(true);
        obs.setDisplaySize(v.w,v.h);
        obs.setImmovable(true);
        (obs.body as Physics.Arcade.Body).allowGravity = false;
        (obs.body as Physics.Arcade.Body).setVelocityX(-this.speed);

        // 当たり判定を少し小さくして寛容にする
        obs.body!.setSize(v.w - 8, v.h - 4);

        // 速度に応じて次の出現間隔を短くする
        const speedFactor = (this.speed - 300) / 500;
        const delay = PhaserMath.Linear(1800, 700, speedFactor) + PhaserMath.Between(-200, 200);
        this.spawnTimer = this.time.delayedCall(delay, this.spawnObstacle, [], this);
    }

    // 障害物に当たった時の処理
    private onPlayerHitObstacle(): void {
        if(!this.isAlive) return;
        this.isAlive = false;

        this.spawnTimer.remove();

        // 画面揺れ＋赤フラッシュ
        this.cameras.main.shake(400,0.025);
        this.cameras.main.flash(200,255,0,0);

        // プレイヤーをフェードアウトしてGameOverへ
        this.tweens.add({
            targets: this.player,
            alpha: 0,
            duration: 500,
            onComplete: () => {
                this.registry.set("finalScore", Math.floor(this.score));
                this.scene.start("GameOver");
            }
        });
    }

    // 背景をパラレックスで描画（毎フレーム呼ばれる）
    private drawBackground(offset: number): void {
        if(this.bgGraphics) {
            this.bgGraphics.clear();
        } else {
            this.bgGraphics = this.add.graphics().setDepth(0);
        }

        const g = this.bgGraphics;

        // 背景塗りつぶし
        g.fillStyle(0x0a0a1a);
        g.fillRect(0,0,1024,768);

        // 星（layer 1: 最も遅い）
        g.fillStyle(0xffffff, 0.6);
        for(let i = 0; i < 60; i++) {
            const x = ((i * 137 + offset * 0.1) % 1024);
            const y = (i * 73) % 400;
            g.fillRect(x, y, 2,2);
        }

        // 山（layer 2）
        g.fillStyle(0x16213e);
        for(let i = 0; i < 8; i++) {
            const x = (((i * 220 - offset * 0.3) % 1200) + 1200) % 1200 - 100; 
            g.fillTriangle(x, 500, x + 150, 300, x + 300, 500);
        }

        // 丘（layer 3: 最も速い）
        g.fillStyle(0x0f3460);
        for (let i = 0; i < 10; i++) {
            const x = (((i * 200 - offset * 0.6) % 1300) + 1300) % 1300 - 100;
            g.fillTriangle(x, 580, x + 120, 450, x + 240, 580);
        }
    }
}

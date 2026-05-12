import { EventBus } from '../EventBus';
import { Scene,Physics,Math as PhaserMath } from 'phaser';

export class Game extends Scene
{
    // --- クラスフィールド ---
    private player: Phaser.Physics.Arcade.Sprite;
    private ground: Phaser.GameObjects.TileSprite;
    private obstacles: Phaser.Physics.Arcade.Group;
    private scoreText: Phaser.GameObjects.Text;
    private score: number = 0;
    private speed: number = 300;        // 現在の移動速度 (px/s)
    private isAlive: boolean = true;
    private spawnTimer: Phaser.Time.TimerEvent;
    private bg: Phaser.GameObjects.TileSprite;

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

        const W = this.scale.width;
        const H = this.scale.height;
        const GROUND_Y = H - 66;

        // --- 背景（tileSprite でループスクロール）---
        const bgScale = H / 768;
        this.bg = this.add.tileSprite(W/2, H/2, W, H,'bg').setDepth(0).setTileScale(bgScale, bgScale);


        // --- 地面（見た目・スクロールする）---
        this.ground = this.add.tileSprite(W/2, H - 34, W, 68,"ground-tex")
                    .setDepth(5);

        // --- 地面コライダー（透明・プレイヤーが乗る床）---
        const groundHitBox = this.physics.add.staticImage(W/2, GROUND_Y, "ground-hitbox-tex")
                                .setDisplaySize(W,4)
                                .setAlpha(0)
                                .refreshBody();

        // --- プレイヤー ---
        // sprite を使用（Image ではアニメーション不可）
        // setDisplaySize: 表示サイズ、setBodySize: 当たり判定（表示より小さくして寛容に）
        this.player = this.physics.add.sprite(150, H - 128, "player")
                    .setDepth(20)
                    .setDisplaySize(200,200)
                    .setBodySize(100,100);
        this.player.setCollideWorldBounds(true);

        // --- コライダー設定 ---
        this.physics.add.collider(this.player, groundHitBox);

        this.player.anims.play("run");

        // --- 障害物グループ（最大10個を使い回す）---
        this.obstacles = this.physics.add.group({
            classType: Physics.Arcade.Image,
            maxSize: 10
        });

        this.physics.add.collider(this.player, this.obstacles, ()=> {
            this.onPlayerHitObstacle();
        });

        // --- スコアUI（右上）---
        this.scoreText = this.add.text(W - 44, 20, "SCORE:0",{
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

        // 地面をスクロール
        this.ground.tilePositionX += this.speed * delta / 1000;


        // 背景を地面より遅くスクロール（0.2倍でパラレックス効果）
        this.bg.tilePositionX += this.speed * delta / 1000 * 0.2;

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

        // 着地したら走りアニメに戻す
        const body = this.player.body as Physics.Arcade.Body;
        if(body.blocked.down) {
            if(this.player.anims.currentAnim?.key !== "run") {
                this.player.anims.play("run", true);
            }
        }
    }

    // ジャンプ（接地中のみ・シングルジャンプ）
    private jump(): void {
        if(!this.isAlive) return;

        const body = this.player.body as Physics.Arcade.Body;
        if(!body.blocked.down) return;  // 空中では不可
        body.setVelocityY(-500);      // ← ジャンプ力（絶対値を小さくすると低くなる）
        this.player.anims.play('jump'); 
    }

    // 障害物をスポーン
    private spawnObstacle(): void {
        if(!this.isAlive) return;

        // 3種類のサイズをランダムに選択
        const variants = [
            {w:100, h:100},   
            {w:70, h:70},                          
            {w:120, h:120}
        ];
        const v = variants[PhaserMath.Between(0,2)];

        // Y: 地面(702) から画像の中心を計算。+v.h*0.4 で地面に接するよう微調整
        const GROUND_Y = this.scale.height - 66;
        const obs = this.obstacles.get(this.scale.width + 100, GROUND_Y - v.h/2 + v.h * 0.4, "obstacle") as Physics.Arcade.Image;
        if(!obs) return;

        obs.setActive(true).setVisible(true);
        // depth 10: 地面(5)より前、プレイヤー(20)より後ろ
        obs.setDisplaySize(v.w,v.h).setDepth(10);
        obs.setImmovable(true);
        (obs.body as Physics.Arcade.Body).allowGravity = false;
        (obs.body as Physics.Arcade.Body).setVelocityX(-this.speed);

        // 当たり判定を表示サイズの80%に縮小して寛容にする
        obs.body!.setSize(v.w - v.w * 0.2, v.h - v.h * 0.2);

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

}

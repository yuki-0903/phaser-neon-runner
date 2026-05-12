import { Scene, Physics, Math as PhaserMath } from 'phaser';
import { EventBus } from '../EventBus';

const DEMO_SPEED = 350;
const GROUND_OFFSET = 66;
const JUMP_VY = -500;

export class MainMenu extends Scene
{
    private demoPlayer: Phaser.Physics.Arcade.Sprite;
    private demoObstacles: Phaser.Physics.Arcade.Group;
    private spawnTimer: Phaser.Time.TimerEvent;
    private bg: Phaser.GameObjects.TileSprite;
    private ground: Phaser.GameObjects.TileSprite;

    constructor ()
    {
        super('MainMenu');
    }

    create ()
    {
        const isPortrait = this.scale.width < this.scale.height;
        const W = isPortrait ? this.scale.height : this.scale.width;
        const H = isPortrait ? this.scale.width : this.scale.height;
        const GROUND_Y = H - GROUND_OFFSET;

        // 背景（スクロール用に保持）
        const bgScale = H / 768;
        this.bg = this.add.tileSprite(W/2, H/2, W, H, 'bg').setTileScale(bgScale, bgScale);

        // 地面（見た目・スクロール用に保持）
        this.ground = this.add.tileSprite(W/2, H - 34, W, 68, 'ground-tex');

        // 地面コライダー
        const groundHitBox = this.physics.add.staticImage(W/2, GROUND_Y, 'ground-hitbox-tex')
            .setDisplaySize(W, 4)
            .setAlpha(0)
            .refreshBody();

        // デモキャラ
        this.demoPlayer = this.physics.add.sprite(150, H - 128, 'player')
            .setDisplaySize(200, 200)
            .setBodySize(100, 100)
            .setDepth(20);
        this.demoPlayer.setCollideWorldBounds(true);
        this.demoPlayer.anims.play('run');

        // ジャンプアニメ完了後に走りアニメへ戻す
        this.demoPlayer.on('animationcomplete', (anim: Phaser.Animations.Animation) => {
            if (anim.key === 'jump') {
                this.demoPlayer.anims.play('run', true);
            }
        });

        // 障害物グループ（プレイヤーとの衝突なし・デモなので通り抜ける）
        this.demoObstacles = this.physics.add.group({
            classType: Physics.Arcade.Image,
            maxSize: 5
        });

        this.physics.add.collider(this.demoPlayer, groundHitBox);

        // 障害物スポーン開始
        this.spawnTimer = this.time.delayedCall(1800, this.spawnObstacle, [], this);

        // タイトル
        const titleText = this.add.text(W/2, -120, 'Fluffy Runner', {
            fontFamily: 'Tsukimi Rounded',
            fontSize: 80,
            color: '#ffffff',
            stroke: '#F9D3AD',
            strokeThickness: 10,
            shadow: {
                offsetX: 0,
                offsetY: 6,
                color: '#c9a882',
                blur: 0,
                fill: true
            }
        }).setOrigin(0.5).setDepth(30);

        this.tweens.add({
            targets: titleText,
            y: H * 0.26,
            duration: 800,
            ease: 'Bounce.Out'
        });

        const startText = this.add.text(W/2, H * 0.585, 'PRESS SPACE OR TAP TO PLAY', {
            fontFamily: 'Tsukimi Rounded',
            fontSize: 24,
            color: '#e0f0ff'
        }).setOrigin(0.5).setDepth(30);

        this.tweens.add({
            targets: startText,
            alpha: 0,
            duration: 600,
            yoyo: true,
            repeat: -1
        });

        const best = localStorage.getItem('runner-highscore');
        if (best) {
            this.add.text(W/2, H * 0.65, `BEST: ${best}`, {
                fontFamily: 'Tsukimi Rounded',
                fontSize: 20,
                color: '#ffd700'
            }).setOrigin(0.5).setDepth(30);
        }

        const startGame = () => {
            this.spawnTimer.remove();
            this.cameras.main.fadeOut(500, 0, 0, 0);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                this.scene.start('Game');
            });
        };

        this.input.keyboard!.once('keydown-SPACE', startGame);
        this.input.once('pointerdown', startGame);

        EventBus.emit('current-scene-ready', this);
    }

    update(_time: number, delta: number): void
    {
        // 背景・地面スクロール
        this.bg.tilePositionX += DEMO_SPEED * delta / 1000 * 0.2;
        this.ground.tilePositionX += DEMO_SPEED * delta / 1000;

        if (!this.demoPlayer?.active) return;

        // 画面外の障害物を回収
        this.demoObstacles.getChildren().forEach((obj) => {
            const obs = obj as Physics.Arcade.Image;
            if (obs.active && obs.x < -100) {
                this.demoObstacles.killAndHide(obs);
            }
        });

        // 接地中に最も近い障害物が260px以内なら自動ジャンプ
        const body = this.demoPlayer.body as Physics.Arcade.Body;
        if (body.blocked.down) {
            let nearest = Infinity;
            this.demoObstacles.getChildren().forEach((obj) => {
                const obs = obj as Physics.Arcade.Image;
                if (obs.active && obs.x > this.demoPlayer.x) {
                    nearest = Math.min(nearest, obs.x - this.demoPlayer.x);
                }
            });

            if (nearest < 260) {
                body.setVelocityY(JUMP_VY);
                this.demoPlayer.anims.play('jump');
            }
        }
    }

    private spawnObstacle(): void
    {
        const isPortrait = this.scale.width < this.scale.height;
        const W = isPortrait ? this.scale.height : this.scale.width;
        const H = isPortrait ? this.scale.width : this.scale.height;
        const GROUND_Y = H - GROUND_OFFSET;
        const size = 100;

        const obs = this.demoObstacles.get(W + 100, GROUND_Y - size / 2 + size * 0.4, 'obstacle') as Physics.Arcade.Image;
        if (!obs) return;

        obs.setActive(true).setVisible(true);
        obs.setDisplaySize(size, size).setDepth(10);
        obs.setImmovable(true);
        (obs.body as Physics.Arcade.Body).allowGravity = false;
        (obs.body as Physics.Arcade.Body).setVelocityX(-DEMO_SPEED);
        obs.body!.setSize(size * 0.8, size * 0.8);

        this.spawnTimer = this.time.delayedCall(
            PhaserMath.Between(1800, 2600),
            this.spawnObstacle, [], this
        );
    }
}

import { Scene } from 'phaser';

export class Boot extends Scene
{
    constructor ()
    {
        super('Boot');
    }

    create ()
    {
        document.fonts.load('700 16px "Tsukimi Rounded"').then(() => {
            this.scene.start('Preloader');
        });
    }
}

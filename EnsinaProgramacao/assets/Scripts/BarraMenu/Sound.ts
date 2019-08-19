const { ccclass, property } = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {


    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    private ativado = true;

    start() {
        let audio = cc.find("Canvas").getComponent(cc.AudioSource);

        this.node.on(cc.Node.EventType.MOUSE_DOWN, () => {
            let animation = this.getComponent(cc.Animation);

            if (this.ativado) {
                animation.stop();
                animation.play("speakerOff");
                this.ativado = false;
                audio.mute = true;
            }else{
                animation.stop();
                animation.play("speakerOn");
                this.ativado = true;
                audio.mute = false;
            }
        });
    }

    // update (dt) {}
}

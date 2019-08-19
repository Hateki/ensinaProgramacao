const { ccclass, property } = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start() {
        this.node.on(cc.Node.EventType.MOUSE_ENTER, () => {
            let animation = this.getComponent(cc.Animation);

            animation.stop();
            animation.play("desligarHover");
        });

        this.node.on(cc.Node.EventType.MOUSE_LEAVE, () => {
            let animation = this.getComponent(cc.Animation);

            animation.stop();
            animation.play("desligarNormal");
        });
    }

    // update (dt) {}
}

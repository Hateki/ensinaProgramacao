const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    @property(cc.Node)
    menuNode: cc.Node = null;

    private ativado = false;

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start () {

        this.node.on(cc.Node.EventType.MOUSE_DOWN, () => {
            let animation = this.menuNode.getComponent(cc.Animation);

            if (this.ativado) {
                animation.stop();
                animation.play("MenuSome");
                this.ativado = false;
            }else{
                animation.stop();
                animation.play("MenuAparece");
                this.ativado = true;
            }
        });
    }

    // update (dt) {}
}

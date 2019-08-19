const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {


    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start () {
        this.node.on(cc.Node.EventType.MOUSE_DOWN, () => {
            cc.director.loadScene("Loading");
        });
    }

    // update (dt) {}
}

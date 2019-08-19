const { ccclass, property } = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    @property(cc.Node)
    videoNode: cc.Node = null;

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        let video = this.videoNode.getComponent(cc.VideoPlayer);

        this.node.on(cc.Node.EventType.MOUSE_DOWN, (e: cc.Event.EventTouch) => {
            video.play();
        });

    }

    // update (dt) {}
}

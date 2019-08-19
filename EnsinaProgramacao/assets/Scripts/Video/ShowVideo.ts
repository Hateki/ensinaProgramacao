const { ccclass, property } = cc._decorator;

@ccclass
export default class ShowVideo extends cc.Component {

    @property(cc.Node)
    videoNode: cc.Node = null;

    @property(cc.Node)
    tutorial: cc.Node = null;

    private static mostrando = false;


    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        let video = this.videoNode.getComponent(cc.VideoPlayer);

        this.node.on(cc.Node.EventType.MOUSE_DOWN, (e: cc.Event.EventTouch) => {
            if (!ShowVideo.mostrando) {
                this.tutorial.active = true;
                video.play();
                ShowVideo.mostrando = true;
            }else{
                video.stop();
                this.tutorial.active = false;
                ShowVideo.mostrando = false;
            }
        });
    }
}

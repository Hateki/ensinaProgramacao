import ValoresImportantes from "../Game/ValoresImportantes";
import MontaLista from "./MontaLista";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Comecar extends cc.Component {

    @property(MontaLista)
    montaLista: MontaLista = null;

    private importantes: ValoresImportantes;


    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        
    }

    start() {
        this.importantes = cc.find("ValoresImportantes").getComponent(ValoresImportantes);
        cc.director.preloadScene("Loading");

        this.node.on(cc.Node.EventType.MOUSE_ENTER, () => {
            let animation = this.getComponent(cc.Animation);

            animation.stop();
            animation.play("comecarHover");

        });

        this.node.on(cc.Node.EventType.MOUSE_LEAVE, () => {
            let animation = this.getComponent(cc.Animation);

            animation.stop();
            animation.play("comecarNormal");
        });

        this.node.on(cc.Node.EventType.MOUSE_DOWN, () => {
            let animation = this.getComponent(cc.Animation);

            animation.stop();
            animation.play("comecarClick");

            cc.director.loadScene("Loading");
        });

        this.node.on(cc.Node.EventType.MOUSE_UP, () => {
            let animation = this.getComponent(cc.Animation);

            animation.stop();
            animation.play("comecarHover");
        });
    }
}

import Finalizar from "../Finalizar/Finalizar";

const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    @property(cc.Node)
    nodeFinalizar: cc.Node = null;


    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start () {
        let finalizar = this.nodeFinalizar.getComponent(Finalizar);

        this.node.on(cc.Node.EventType.MOUSE_DOWN, () => {
            finalizar.acabarTempo("Você desistiu? Como assim???", false);
        });
    }

    // update (dt) {}
}

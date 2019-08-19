import BlocoGame from "../Game/BlocoGame";

const { ccclass, property } = cc._decorator;

/**
 * Script responsável por lidar com a colisão de um bloco de código
 * e um espaço para se colocar código.
 */
@ccclass
export default class ColisaoCodigo extends cc.Component {

    private fumaca: cc.Node = cc.find("Canvas/Fumaca");

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        let manager = cc.director.getCollisionManager();
        manager.enabled = true;
        //manager.enabledDebugDraw = true;
    }

    // MANIPULADORES DE COLISÕES 

    onCollisionEnter(other: cc.BoxCollider, self: cc.BoxCollider) {
        let animation = self.node.parent.getComponent(cc.Animation);
        let bloco = other.node as BlocoGame;
        

        animation.play('HoverTrechoCodigo');
        self.node.opacity = 255;

        //Coloca uma referência no bloco de qual espaço para código ele está colidindo.
        bloco.caixaColisora = self.node;
    }

    onCollisionStay(other: cc.BoxCollider, self: cc.BoxCollider) {
        let animation = self.node.parent.getComponent(cc.Animation);
        let bloco = other.node as BlocoGame;

        //Coloca uma referência no bloco de qual espaço para código ele está colidindo.
        bloco.caixaColisora = self.node;
    }

    onCollisionExit(other: cc.BoxCollider, self: cc.BoxCollider) {
        let animation = self.node.parent.getComponent(cc.Animation);
        let bloco = other.node as BlocoGame;

        animation.stop();
        animation.play();
        self.node.opacity = 100;

        //Retira a referência caso a colisão acabe;
        bloco.caixaColisora = null;
    }
}

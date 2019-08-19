import BlocoGame from "../Game/BlocoGame";

const { ccclass, property } = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    // LIFE-CYCLE CALLBACKS:

    onLoad(){
        let collider = this.node.getComponent(cc.BoxCollider);
        collider.offset.x = this.node.width * 0.5;
        collider.offset.y -= this.node.height * 0.52;
    }

    onCollisionEnter(other: cc.BoxCollider, self: cc.BoxCollider) {
        let animation = self.node.getComponent(cc.Animation);
        let bloco = other.node as BlocoGame;

        //animation.play("animacaoRepensar");
        
        
        //Coloca uma referência no bloco de qual espaço para código ele está colidindo.
        bloco.caixaColisora = self.node;
    }

    onCollisionExit(other: cc.BoxCollider, self: cc.BoxCollider) {
        let animation = self.node.getComponent(cc.Animation);
        let bloco = other.node as BlocoGame;

        //animation.stop("animacaoRepensar");

        //Retira a referência caso a colisão acabe;
        bloco.caixaColisora = null;
    }
}

const {ccclass, property} = cc._decorator;
/**
 * Script Responsável por ajustar o tamanho
 * das imagens de acordo com o tamanho de um node pai.
 */
@ccclass
export default class BaseadoNoTamanho extends cc.Component {

    @property(cc.Node)
    pai: cc.Node = null;

    // LIFE-CYCLE CALLBACKS:

    start () {
        this.node.width = this.pai.width;
        this.node.height = this.pai.height;
    }
}

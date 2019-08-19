const {ccclass, property} = cc._decorator;
/**
 * Script Responsável por ajustar o tamanho
 * das imagens de acordo com a escala de um node pai.
 */
@ccclass
export default class BaseadoNaEscala extends cc.Component {

    @property(cc.Node)
    pai: cc.Node = null;

    escalaFilhoX = 0;
    escalaFilhoY = 0;

    // LIFE-CYCLE CALLBACKS:

    start () {
        //Calcula a escala resultante do filho e aplica
        this.escalaFilhoX = this.node.width  / this.pai.width;
        this.node.scale = this.escalaFilhoX;
    }
}

import Desafio from "./Desafio";

const {ccclass, property} = cc._decorator;

@ccclass
export default class ValoresImportantes extends cc.Component {

    public letraScore: number;
    public numeroScore: number;
    public mensagemResultado:string;
    public proximaCena = "SelecionarDesafio";
    public desafioEscolhido: Desafio = null;
    public saldoJogador = 0;
    public listaDesafios: Desafio[] = null;
    public medioAberto: boolean = false;
    public dificilAberto: boolean = false;

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start () {
        cc.game.addPersistRootNode(this.node);
    }

    // update (dt) {}
}

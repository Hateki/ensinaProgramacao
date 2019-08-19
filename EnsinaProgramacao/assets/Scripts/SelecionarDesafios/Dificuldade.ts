import ValoresImportantes from "../Game/ValoresImportantes";
import MontaLista from "./MontaLista";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Dificuldade extends cc.Component {

    @property(cc.Label)
    labelSaldo: cc.Label = null;

    @property(cc.Node)
    listaDesafios: cc.Node = null;

    private importantes: ValoresImportantes;

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        let cadeado = this.node.getChildByName("Padlock");
        let textoCadeado = this.node.getChildByName("Valor").getComponent(cc.Label);
        let textoDificuldade = this.node.getChildByName("textoDificuldade")
            .getComponent(cc.Label);

        this.importantes = cc.find("ValoresImportantes").getComponent(ValoresImportantes);


        this.node.on(cc.Node.EventType.MOUSE_ENTER, (e: cc.Event.EventMouse) => {
            cadeado.getComponent(cc.Animation).play("cadeadoHover");
        });

        this.node.on(cc.Node.EventType.MOUSE_LEAVE, (e: cc.Event.EventMouse) => {
            cadeado.getComponent(cc.Animation).play("cadeado");
        });

        this.node.on(cc.Node.EventType.MOUSE_DOWN, (e: cc.Event.EventMouse) => {
            let stringBloqueio = textoCadeado.string.replace("$", "");
            let valorBloqueio = parseInt(stringBloqueio);

            if (valorBloqueio <= this.importantes.saldoJogador * 100) {
                let montaLista = this.listaDesafios.getComponent(MontaLista);

                this.importantes.saldoJogador = this.importantes.saldoJogador - (valorBloqueio / 100);
                this.labelSaldo.string = "$" + this.importantes.saldoJogador;

                if (textoDificuldade.string == "Médio:"){
                    this.importantes.medioAberto = true;
                }else{
                    this.importantes.dificilAberto = true;
                }

                montaLista.iniciaLista();
            } else {
                alert("Você não tem saldo suficiente para liberar essa dificuldade.");
            }
        });
    }

    // update (dt) {}
}

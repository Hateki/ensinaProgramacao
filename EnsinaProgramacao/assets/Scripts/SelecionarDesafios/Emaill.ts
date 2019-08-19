import Desafio from "../Game/Desafio";
import ValoresImportantes from "../Game/ValoresImportantes";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Email extends cc.Component {

    @property(cc.Node)
    nomeDesafio: cc.Node = null;

    @property(cc.Node)
    descricaoDesafio: cc.Node = null;

    @property(cc.Node)
    tempoDesafio: cc.Node = null;

    public ativado = false;
    private importantes: ValoresImportantes;
    public desafio: Desafio = null;

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this.importantes = cc.find("ValoresImportantes").getComponent(ValoresImportantes);

        this.node.on(cc.Node.EventType.MOUSE_ENTER, () => {
            let animation = this.getComponent(cc.Animation);

            animation.stop();
            animation.play("desafioHover");
        });

        this.node.on(cc.Node.EventType.MOUSE_LEAVE, () => {
            let animation = this.getComponent(cc.Animation);

            if (!this.ativado) {
                animation.stop();
                animation.play("desafioNormal");
            }
        });

        this.node.on(cc.Node.EventType.MOUSE_DOWN, () => {
            let animation = this.getComponent(cc.Animation);
            let textoNome = this.nomeDesafio.getComponent(cc.Label);
            let textoTempo = this.tempoDesafio.getComponent(cc.Label);
            let textoDescricao = this.descricaoDesafio.getComponent(cc.Label);

            this.node.parent.children.forEach(child => {
                let animationChild = child.getComponent(cc.Animation);
                let email = child.getComponent(Email);

                try {
                    email.ativado = false;
                    animationChild.stop();
                    animationChild.play("desafioNormal");
                } catch (error) {

                }
            });

            animation.stop();
            animation.play("desafioHover");
            textoNome.string = this.desafio.nome;
            textoDescricao.string = this.desafio.descricao;
            textoTempo.string = this.desafio.tempoInicial + " - " + this.desafio.tempo;
            this.ativado = true;
            this.importantes.desafioEscolhido = this.desafio;
        });
    }

    start() {
        this.nomeDesafio = cc.find("Canvas/Main Camera/Monitor/Detalhes/Nome Desafio");
        this.tempoDesafio = cc.find("Canvas/Main Camera/Monitor/Detalhes/Tempo/TextoTempo");
        this.descricaoDesafio = cc.find("Canvas/Main Camera/Monitor/Detalhes/Descricao/TextoDescricao");
    }
}

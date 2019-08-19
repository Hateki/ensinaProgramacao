const { ccclass, property } = cc._decorator;
import Cliente from "../Web/Cliente";
import Logica from "../Game/Logica";

@ccclass
export default class Info extends cc.Component {

    @property(cc.Node)
    balaoPensamento: cc.Node = null
    @property(cc.Node)
    balaoFala: cc.Node = null
    @property(cc.Node)
    call: cc.Node = null
    @property(cc.Node)
    fimCall: cc.Node = null
    @property(cc.Label)
    textoFala: cc.Label = null
    @property(cc.Node)
    chefe: cc.Node = null
    @property(cc.Node)
    guru: cc.Node = null


    private infoAtivado = false;
    private esconderCall = false;
    private canvas: cc.Node;

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        let animationCall = this.call.getComponent(cc.Animation);
        let animationPensamento = this.balaoPensamento.getComponent(cc.Animation);

        this.canvas = cc.find("Canvas");

        this.call.active = false;
        animationCall.on('stop', () => {

            if (this.esconderCall) {
                this.call.active = false;
                this.esconderCall = false;
                this.balaoFala.active = false;
            } else {
                this.balaoFala.active = true;
            }
        });

        animationPensamento.on('finished', (event) => {
            if (animationPensamento.currentClip.name == 'ColocarBalaoPens') {
                animationPensamento.play('AnimacaoPensamento');
                this.retiraFilhos(true);
            }
        })

        if (cc.sys.os == cc.sys.OS_ANDROID) {
            //Se hover um evento de toque
            this.node.on(cc.Node.EventType.TOUCH_START, (e: cc.Event.EventTouch) =>
                (this.infoAtivado) ? this.retiraInfo(e) : this.mostraInfo(e));

            this.fimCall.on(cc.Node.EventType.TOUCH_START, (e: cc.Event.EventTouch) =>
                this.retiraInfo(e));
        } else {
            //Se hover um evento de toque
            this.node.on(cc.Node.EventType.MOUSE_DOWN, (e: cc.Event.EventMouse) =>
                (this.infoAtivado) ? this.retiraInfo(e) : this.mostraInfo(e));

            this.fimCall.on(cc.Node.EventType.TOUCH_START, (e: cc.Event.EventTouch) =>
                this.retiraInfo(e));
        }
    }

    start(){
        this.mostraInfo(null);
    }

    private mostraInfo(event: cc.Event) {
        let animationCall = this.call.getComponent(cc.Animation);
        let animationPensamento = this.balaoPensamento.getComponent(cc.Animation);
        let animationFala = this.balaoFala.getComponent(cc.Animation);
        let logica = this.canvas.getComponent(Logica);

        this.textoFala.string = logica.desafioCena.descricao;

        if(event == null){
            this.chefe.active = true;
            this.guru.active = false;
        }else if (event.currentTarget.name == "Info") {
            this.chefe.active = true;
            this.guru.active = false;
        } else {
            this.chefe.active = false;
            this.guru.active = true;
        }


        //animationInfo.play('infoHover');
        this.call.active = true;
        this.infoAtivado = true;
        animationCall.play('callAbrindo');
        animationPensamento.stop();
        this.retiraFilhos(false);
        animationPensamento.play('ExBalao');
        animationFala.play('colocaBalaoFala');
        this.textoFala.enableWrapText = true;
    }

    public mostraResultado(textoFala: string) {
        let animationCall = this.call.getComponent(cc.Animation);
        let animationPensamento = this.balaoPensamento.getComponent(cc.Animation);
        let animationFala = this.balaoFala.getComponent(cc.Animation);

        this.textoFala.string = textoFala;

        this.chefe.active = true;
        this.guru.active = false;

        this.call.active = true;
        this.infoAtivado = true;
        animationCall.play('callAbrindo');
        animationPensamento.stop();
        this.retiraFilhos(false);
        animationPensamento.play('ExBalao');
        animationFala.play('colocaBalaoFala');
        this.textoFala.enableWrapText = true;
    }

    private retiraInfo(event: cc.Event) {
        let animationCall = this.call.getComponent(cc.Animation);
        let animationFala = this.balaoFala.getComponent(cc.Animation);
        let animationPensamento = this.balaoPensamento.getComponent(cc.Animation);

        //animationInfo.stop();
        //animationInfo.play('info');
        this.infoAtivado = false;
        this.esconderCall = true;
        animationCall.play('callFechando');
        animationFala.play('retiraBalaoFala');
        animationPensamento.play('ColocarBalaoPens');
    }

    private retiraFilhos(ativo) {
        this.balaoPensamento.children.forEach(element => {
            element.active = ativo;
        });
    }
}

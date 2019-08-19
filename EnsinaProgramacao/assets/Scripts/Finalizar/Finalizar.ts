import Logica from "../Game/Logica";
import Cliente from "../Web/Cliente";
import BlocoGame from "../Game/BlocoGame";
import BlocoServer from "../Game/BlocoServer";
import Info from "../BarraMenu/Info";
import CalculaScore from "../Game/CalculaScore";
import Desafio from "../Game/Desafio";
import ValoresImportantes from "../Game/ValoresImportantes";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Finalizar extends cc.Component {

    @property(cc.Node)
    info: cc.Node = null;
    @property(cc.Label)
    relogio: cc.Label = null;

    private logica: Logica;
    private animacaoFin: cc.Animation;
    private cliente: Cliente;
    private contErros = 0;
    private importantes:ValoresImportantes;

    // LIFE-CYCLE CALLBACKS:

    onLoad() {

    }

    start() {

        this.cliente = cc.find("Web").getComponent(Cliente);
        this.animacaoFin = this.node.getComponent(cc.Animation);
        this.logica = cc.find("Canvas").getComponent(Logica);
        this.importantes = cc.find("ValoresImportantes").
        getComponent("ValoresImportantes");

        if (cc.sys.os == cc.sys.OS_ANDROID) {
            //Se hover um evento de toque
            this.node.on(cc.Node.EventType.TOUCH_START, (e: cc.Event.EventTouch) =>
                this.finalizarDesafio());
            //Se o toque tiver acabado
            this.node.on(cc.Node.EventType.TOUCH_END, (e: cc.Event.EventTouch) =>
                this.mudarAnimacao("FinalizarStay"));
        } else {
            //Se hover um evento de toque
            this.node.on(cc.Node.EventType.MOUSE_ENTER, (e: cc.Event.EventMouse) =>
                this.mudarAnimacao("FinalizarHover"));
            //Se o toque tiver acabado
            this.node.on(cc.Node.EventType.MOUSE_LEAVE, (e: cc.Event.EventMouse) =>
                this.mudarAnimacao("FinalizarStay"));

            //Se hover um evento de toque
            this.node.on(cc.Node.EventType.MOUSE_DOWN, (e: cc.Event.EventMouse) =>
                this.finalizarDesafio());
            //Se o toque tiver acabado
            this.node.on(cc.Node.EventType.MOUSE_UP, (e: cc.Event.EventMouse) =>
                this.mudarAnimacao("FinalizarHover"));
        }
    }

    update(dt) {
        this.acabarTempo(this.logica.desafioCena.mensagemFimTempo, true);
    }

    public acabarTempo(mensagem, contarTempo){
        if (this.relogio.string == this.logica.desafioCena.tempo || !contarTempo) {
            let calcula = this.node.getComponent(CalculaScore);
            this.relogio.string = "";
            calcula.calcularScore(this.contErros, this.logica.desafioCena);
            this.importantes.mensagemResultado = mensagem;
            cc.director.loadScene("Score");
        }
    }


    private finalizarDesafio() {
        let respostaJogador;
        let mensagem;

        this.logica.desafioCena.opcoes = this.limpaBlocos(
            this.logica.desafioCena.opcoes);
        this.logica.desafioCena.solucao = this.limpaBlocos(
            this.logica.desafioCena.solucao);

        respostaJogador = JSON.stringify(this.logica.desafioCena);
        mensagem = this.cliente.criaJson("Resultado Jogador",
            respostaJogador);

        this.mudarAnimacao("FilnalizarClick");

        this.comunicaServidor(mensagem, this.logica.desafioCena);

    }

    private limpaBlocos(listaBlocos: BlocoGame[]) {
        let novaLista = new Array();

        listaBlocos.forEach(blocoGame => {
            let bloco = new BlocoServer(blocoGame.id,
                blocoGame.valor, blocoGame.tipo);

            if (blocoGame.blocosFilhos != null) {
                bloco.blocosFilhos = this.limpaBlocos(blocoGame.blocosFilhos);
            } else {
                bloco.blocosFilhos = new Array();
            }

            novaLista.push(bloco);
        });

        return novaLista;
    }


    private mudarAnimacao(nomeAnimacao) {
        this.animacaoFin.stop();
        this.animacaoFin.play(nomeAnimacao);
    }

    private comunicaServidor(mensagem, desafio: Desafio) {
        let calcula = this.node.getComponent(CalculaScore);

        this.cliente.mandarMensagem(JSON.stringify(mensagem), (resposta) => {
            let infoComponent = this.info.getComponent("Info");
            let mensagemChefe;

            if (resposta.mensagem == "True") {
                this.importantes.mensagemResultado = resposta.mensagemResultado;
                calcula.calcularScore(this.contErros, desafio);
                cc.director.loadScene("Score");
            } else {
                mensagemChefe = resposta.mensagemResultado;
                infoComponent.mostraResultado(mensagemChefe);
                this.contErros++;
            }
        });
    }
}

import Logica from "../Game/Logica";
import BlocoGame from "../Game/BlocoGame";

const { ccclass, property } = cc._decorator;

/**
 * Responsável por movimentar o bloco de código na tela e
 * lidar com os eventos resultantes desse movimento.
 */
@ccclass
export default class MovimentoCodigo extends cc.Component {

    RETIRAR_ESPACO = true;
    COLOCAR_ESPACO = false;

    /**
     * Cópia do bloco que está sendo movimentado pelo usuário.
     * Usado para caso não ocorra nenhuma colisão.
     */
    private blocoReserva: BlocoGame = null;

    private monitor: cc.Node = cc.find("Canvas/Main Camera/Monitor");
    private canvas: cc.Node = cc.find("Canvas");

    // LIFE-CYCLE CALLBACKS:

    onLoad() {

        let bloco: BlocoGame;

        //Se houver um evento de movimento de toque, o node alvo será movimentado junto
        this.node.on(cc.Node.EventType.TOUCH_MOVE, (e: cc.Event.EventTouch) =>
            this.movimentaNode(e));

        if (cc.sys.os == cc.sys.OS_ANDROID) {
            //Se hover um evento de toque
            this.node.on(cc.Node.EventType.TOUCH_START, (e: cc.Event.EventTouch) =>
                this.preparaBlocoParaMovimento(e));
            //Se o toque tiver acabado
            this.node.on(cc.Node.EventType.TOUCH_END, (e: cc.Event.EventTouch) =>
                this.lidaComFimDoToque(e));
        } else {
            //Se hover um evento de toque
            this.node.on(cc.Node.EventType.MOUSE_DOWN, (e: cc.Event.EventMouse) =>
                this.preparaBlocoParaMovimento(e));
            //Se o toque tiver acabado
            this.node.on(cc.Node.EventType.MOUSE_UP, (e: cc.Event.EventMouse) =>
                this.lidaComFimDoToque(e));
        }
    }

    // MÉTODOS DA CLASSE

    /**
     * Movimenta um node de acordo com a posição do
     * evento(ação do mouse ou toque) na tela.
     * @param e Evento ocorrido.
     */
    private movimentaNode(e: cc.Event) {
        let movimentacaoX, movimentacaoY;
        let novoEvento;

        if (cc.sys.os == cc.sys.OS_ANDROID) {
            novoEvento = e as cc.Event.EventTouch;
        } else {
            novoEvento = e as cc.Event.EventMouse;
        }

        movimentacaoX = novoEvento.getLocationX() - novoEvento.getPreviousLocation().x;
        movimentacaoY = novoEvento.getLocationY() - novoEvento.getPreviousLocation().y;

        this.node.x += movimentacaoX;
        this.node.y += movimentacaoY;

        e.bubbles;
    }

    /**
     * Prepara o bloco para ser movimentado, para isso um bloco reserva é criado
     * para se manter a posição original do bloco. Então, o parente do bloco movimentado
     * é mudado para que ele possa se movimentar por toda a tela.
     * @param e Evento para se lidar.
     */
    private preparaBlocoParaMovimento(e: cc.Event) {
        let bloco = this.node as BlocoGame;
        let posicaoNova: cc.Vec2;

        //Copia o bloco para manter sua posição
        this.substituiBloco(bloco);

        bloco.preparaBlocoParaMovimento();
        this.lidaEspacosVazios(bloco, this.blocoReserva.parent, this.RETIRAR_ESPACO);

        //Reposiona o bloco de acordo com as coordenadas globais dele
        bloco.parent = this.monitor;
        posicaoNova = this.blocoReserva.parent.convertToWorldSpaceAR(this.blocoReserva.getPosition());
        posicaoNova = this.monitor.convertToNodeSpaceAR(posicaoNova);
        bloco.setPosition(posicaoNova);

        e.bubbles = false;
        e.stopPropagation();
    }

    /**
     * Substitui o bloco movido com a sua replica dentro da
     * lista de blocos em que o bloco movido pertencia.
     * @param bloco 
     */
    private substituiBloco(bloco: BlocoGame) {
        let logica = this.canvas.getComponent(Logica);
        let pai;
        let posicao;

        this.blocoReserva = BlocoGame.copiarBloco(bloco);
        pai = bloco.parent;

        if (pai instanceof BlocoGame) {
            pai = bloco.parent as BlocoGame;
            posicao = pai.blocosFilhos.indexOf(bloco);
            pai.blocosFilhos[posicao] = this.blocoReserva;
            this.blocoReserva.zIndex = posicao;
        }
    }

    /**
     * Lida com espaços vazios que ficam no código quando um bloco é movimentado. 
     * Retira esses espaços vazios levando em conta os blocos irmãos e os blocos
     * filhos.
     * @param bloco Bloco que foi movido;
     * @param parente Parente do Bloco que foi movido;
     * @param retira True se é para retirar os espaços vazios e false se é para
     * colocar os espaços novamente.
     */
    private lidaEspacosVazios(bloco: BlocoGame, parente: cc.Node, retira: boolean) {
        let logica = this.canvas.getComponent(Logica);
        let listaBlocos: BlocoGame[];
        let numeroLinhas = 0;
        let valorY = 0;

        if (parente instanceof BlocoGame) {
            listaBlocos = parente.blocosFilhos;
            bloco = BlocoGame.procuraBlocoPorID(listaBlocos, bloco);
        } else {
            listaBlocos = logica.desafioCena.solucao;
        }

        bloco.calculaLinhasMontavel();

        if (bloco.tipo == bloco.TIPO_COMPOSTO) {
            if(bloco.verificaPosicaoLista(listaBlocos)){
                numeroLinhas = 4;
            }else{
                numeroLinhas = 3;
            }
        } else {
            if(bloco.verificaPosicaoLista(listaBlocos)){
                numeroLinhas = 2;
            }else{
                numeroLinhas = 0;
            }
        }

        valorY = (bloco.totalLinhas + numeroLinhas) * logica.TAMANHO_FONTE;
        this.lidaComEspacosIrmaos(listaBlocos, bloco, retira, valorY);
        this.lidaComEspacoPai(parente, valorY, retira);
    }

    /**
     * Reposiciona os irmãos do bloco movido para que eles preecham o espaço
     * vazio deixado pelo bloco.
     * @param listaBlocos lista de blocos que vai ser reposicionada;
     * @param bloco Bloco que foi movido;
     * @param retira True se é para retirar os espaços vazios e false se é para
     * colocar os espaços novamente;
     * @param valorY O valor que é para se reposicionar os blocos.
     */
    private lidaComEspacosIrmaos(listaBlocos: BlocoGame[], bloco: BlocoGame, retira: boolean, valorY: number) {
        let blocoEncotrado = false;

        for (let index = 0; index < listaBlocos.length; index++) {
            const element = listaBlocos[index];
            const posicaoBlocoSeguite = index + 1;

            if (blocoEncotrado) {
                if (retira) {
                    element.y += valorY;
                } else {
                    element.y -= valorY;
                }
            }

            if (bloco != null && element.id == bloco.id && posicaoBlocoSeguite < listaBlocos.length) {
                blocoEncotrado = true;
            }
        }
    }

    /**
     * Reposiciona o pai do bloco movido para que ele preecha o espaço
     * vazio deixado pelo bloco.
     * @param pai Pai para se reposicionar;
     * @param valor valor que o pai tem que respeitar para se posicionar;
     * @param retira True se é para retirar os espaços vazios e false se é para
     * colocar os espaços novamente.
     */
    private lidaComEspacoPai(pai: cc.Node, valor: number, retira: boolean) {
        let blocoPai: BlocoGame;
        let logica = this.canvas.getComponent(Logica);

        if (pai instanceof BlocoGame) {
            blocoPai = pai as BlocoGame;
            if (retira) {
                blocoPai.getChildByName("chaveFechamento").y += valor - logica.TAMANHO_FONTE;
                if (blocoPai.getChildByName("EspacoCodigoInferior") != null) {
                    blocoPai.getChildByName("EspacoCodigoInferior").y += valor - logica.TAMANHO_FONTE;
                }

            } else {
                blocoPai.getChildByName("chaveFechamento").y -= valor - logica.TAMANHO_FONTE;
                if (blocoPai.getChildByName("EspacoCodigoInferior") != null) {
                    blocoPai.getChildByName("EspacoCodigoInferior").y -= valor - logica.TAMANHO_FONTE;
                }
            }
        }

        if (blocoPai != null && blocoPai.parent instanceof BlocoGame) {
            this.lidaComEspacoPai(blocoPai.parent, valor, retira);
            this.lidaComEspacosIrmaos(blocoPai.parent.blocosFilhos, blocoPai, retira, valor);
        } else {
            this.lidaComEspacosIrmaos(logica.desafioCena.solucao, blocoPai, retira, valor);
        }
    }

    /**
     * Lida com o fim do toque do usuário, se não houver nenhuma colisão
     * com um espaço para se colocar código o bloco retorna a posição original.
     * Se houver uma colisão as listas de blocos são reestruturadas.
     * @param e Evento ocorrido.
     */
    private lidaComFimDoToque(e: cc.Event) {
        let bloco = this.node as BlocoGame;
        let logica: Logica;
        let colidiuRepensar = false;

        if (e.target.caixaColisora != null) {
            logica = this.canvas.getComponent(Logica);
            colidiuRepensar = e.target.caixaColisora.name == "CaixaOpcoes";

            if (colidiuRepensar) {
                if (this.verificaRepensar(e.target)) {
                    logica.repensarCodigo(bloco);
                    e.target.destroy();
                } else {
                    this.voltaBlocoPosOriginal(bloco, e);
                }
            } else {
                bloco = bloco.caixaColisora.parent.parent as BlocoGame;
                logica.reestruturaBlocos(bloco, e.target);
                e.target.destroy();
            }
        } else {
            this.voltaBlocoPosOriginal(bloco, e);
        }
    }

    /**
     * Volta um bloco movido para a sua posição original.
     * @param bloco bloco que foi movido;
     * @param e evento gerado.
     */
    private voltaBlocoPosOriginal(bloco: BlocoGame, e: cc.Event) {
        this.lidaEspacosVazios(bloco, this.blocoReserva.parent, this.COLOCAR_ESPACO);
        bloco.destroy();
        this.blocoReserva.active = true;
        e.bubbles = false;
    }

    /**
     * Verifica se o bloco usado para ativar a função repensar é um bloco que
     * já está na caixa de Opções.
     * @param bloco bloco para se verificar.
     * @returns true se o bloco não está na caixa de opções.
     */
    private verificaRepensar(bloco: BlocoGame) {
        let logica = this.canvas.getComponent(Logica);

        for (let index = 0; index < logica.desafioCena.opcoes.length; index++) {
            const element = logica.desafioCena.opcoes[index];
            if (element.id == bloco.id) {
                return false;
            }
        }
        return true;
    }

}

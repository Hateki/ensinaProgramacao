const { ccclass, property } = cc._decorator;

/**
 * Responsável por lidar com os eventos de "scroll" do
 * usuário. 
 */
@ccclass
export default class Flecha extends cc.Component {

    /**
     * Direção em que a flecha está apontada
     */
    @property
    apontadaParaCima: boolean = false;

    /**
     * Caixa em que o scroll será feito
     */
    @property(cc.ScrollView)
    scrollCaixaSolucao: cc.ScrollView = null;

    /**
     * Se o tipo da coordenada for uma largura
     */
    private TIPO_LARGURA = false;

    /**
     * Se o tipo da coordenada for uma altura
     */
    private TIPO_ALTURA = true;

    /**
     * Identifica se usuário está segurando a flecha.
     */
    private segurando = false;

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        if (cc.sys.os == cc.sys.OS_ANDROID) {
            this.node.on(cc.Node.EventType.TOUCH_START, (e: cc.Event.EventTouch) => {
                this.segurando = true;
            });
            this.node.on(cc.Node.EventType.TOUCH_END, (e: cc.Event.EventTouch) => {
                this.segurando = false;
            });
        } else {
            this.node.on(cc.Node.EventType.MOUSE_DOWN, (e: cc.Event.EventMouse) => {
                this.segurando = true;
            });
            this.node.on(cc.Node.EventType.MOUSE_UP, (e: cc.Event.EventMouse) => {
                this.segurando = false;
            });
        }
    }

    update(dt) {
        if (this.segurando) {
            this.moverConteudo();
        }
    }

    // MÉTODOS DA CLASSE

    /**
     * Move o conteudo da caixa de acordo com a direção da flecha
     * apertada
     */
    private moverConteudo() {
        let vetor = new cc.Vec2;
        let y: number;

        y = this.pegarCoordenadas(this.scrollCaixaSolucao.getContentPosition(), this.TIPO_ALTURA);
        vetor.x = 40;
        vetor.y = y;

        if (this.apontadaParaCima) {
            vetor.y -= 30;
        } else if (vetor.y <= this.scrollCaixaSolucao.content.height * 0.7) {
            vetor.y += 30;
        }

        this.scrollCaixaSolucao.vertical = true;
        this.scrollCaixaSolucao.setContentPosition(vetor);
        this.scrollCaixaSolucao.vertical = false;
    }

    /**
     * Pega o valor das coordenadas de uma posição disponibilizada,
     * de acordo com o tipo de coordenada disponibilizada. 
     * @param {Position} posicao Posição para se pegar as coordenadas.
     * @param {boolean} tipoCoordenada tipo de coordenada para se pegar sendo
     * elas largura e altura.
     * @returns {Number} A coordenada encontrada.
     */
    private pegarCoordenadas(posicao: Position, tipoCoordenada: boolean) {
        let coordenadas: string = "" + posicao;
        let altura: string = "";
        let largura: string = "";
        let larguraCompleta = false;

        for (let index = 0; index < coordenadas.length; index++) {
            const elemento = coordenadas.charAt(index);

            if (elemento == ",") {
                larguraCompleta = true;
            } else if (larguraCompleta) {
                altura += this.identificaNumero(elemento);
            } else {
                largura += this.identificaNumero(elemento);
            }
        }

        if (tipoCoordenada == this.TIPO_LARGURA) {
            return Number(largura);
        } else {
            return Number(altura);
        }
    }

    /**
     * Identifica se a string disponibilizada é um número ou faz parte de um.
     * @param elemento Elemento para se Identificar.
     */
    private identificaNumero(elemento: string) {
        if (elemento == ".") {
            return elemento;
        } else if (!isNaN(Number(elemento)) && elemento != " ") {
            return elemento;
        }
        return "";
    }
}

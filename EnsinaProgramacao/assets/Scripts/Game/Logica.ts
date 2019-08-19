import SpriteCustom from "../CustomComponents/SpriteCustom";
import BlocoGame from "./BlocoGame";
import Desafio from "./Desafio";
import Cliente from "../Web/Cliente";
import ValoresImportantes from "./ValoresImportantes";
import Relogio from "../BarraMenu/Relogio";

const { ccclass, property } = cc._decorator;
/**
 * Classe responsável por realizar as lógicas principais do jogo.
 */
@ccclass
export default class Logica extends cc.Component {
    
    //CONSTANTES

    /**
     * Tamanho da distância horizontal utilizada na identação do
     * código.
     */
    readonly DISTANCIA_TAB = 40;
    /**
     * Tamanho da fonte dos blocos de código utilizados no jogo.
     */
    readonly TAMANHO_FONTE = 25;
    /**
     * Identifica que o conjunto de blocos é montável.
     */
    private readonly MONTAVEL = true;
    /**
     * Identifica que o conjunto de blocos não é montável.
     */
    private readonly NAO_MONTAVEL = false;
    /**
     * Indentifica que o alvo da reestruturação é a caixa de Opções.
     */
    readonly CAIXA_OPCOES = true;
    /**
     * Indentifica que o alvo da reestruturação é a caixa de Soluções.
     */
    readonly CAIXA_SOLUCAO = false;
    /**
     * Indica que o espaço para código está posicionado em cima do bloco.
     */
    private readonly POSICAO_SUPERIOR = 0;
    /**
     * Indica que o espaço para código está posicionado em baixo do bloco.
     */
    private readonly POSICAO_INFERIOR = 1;
    /**
     * Indica que o espaço para código está posicionado dentro de um bloco
     * composto vazio;
     */
    private readonly POSICAO_INTERNA = 2;

    //ATRIBUTOS

    /**
     * Posição y inicial para se começar a imprimir os blocos de código.
     */
    private yListaCodigoInicial = 0;
    /**
     * Desafio que foi disponibilizado para o usuário resolver nessa cena.
     */
    desafioCena: Desafio = null;

    /**
     * Node que contrala o acesso ao servidor
     */
    private web: cc.Node;

    /**
     * Cliente para se acessar o servidor
     */
    private cliente: Cliente;

    /**
     * Valores importantes para todas as cenas
     */
    private importantes: ValoresImportantes;

    //PROPRIEDADES

    /**
     * Caixa em que estarão as opções de código do usuário.
     */
    @property(cc.Node)
    caixaOpcoes: cc.Node = null;

    /**
     * Caixa em que estará a solução do desafio feita pelo usuário.
     */
    @property(cc.Node)
    caixaSolucao: cc.Node = null;

    /**
     * Prefab do espaço em o usuário pode colocar um bloco de código
     */
    @property(cc.Prefab)
    espacoCodigo: cc.Prefab = null;

    /**
     * Limite de tempo do desafio
     */
    @property(cc.Label)
    limiteTempo: cc.Label = null;

    /**
     * Tempo inicial do desafio
     */
    @property(cc.Node)
    tempoInicial:cc.Node = null;

    // LIFE-CYCLE CALLBACKS:

    start() {
        //let desafio: Desafio = this.geraDesafioTeste();
        let desafio: Desafio = new Desafio();
        let relogio = this.tempoInicial.getComponent(Relogio);

        cc.director.preloadScene("Score");

        this.web = cc.director.getScene().getChildByName('Web');
        this.cliente = this.web.getComponent(Cliente);
        this.importantes = cc.find("ValoresImportantes").getComponent(ValoresImportantes);

        desafio.criarDesafio(JSON.stringify(this.importantes.desafioEscolhido));
        this.shuffle(desafio.opcoes);
        this.desafioCena = this.copiarDesafio(desafio);
        relogio.pegaValores(desafio.tempoInicial);
        this.limiteTempo.string = desafio.tempo;

        this.imprimeBlocos(desafio.solucao, this.caixaSolucao);
        this.imprimeBlocos(desafio.opcoes, this.caixaOpcoes);
    }

    //MÉTODOS

    /**
     * Imprime os blocos dos desafios disponibilizados.
     * @param {BlocoGame[]} blocos Blocos para serem imprimidos
     * @param {cc.Node} caixa Node em que os blocos serão imprimidos.
     */
    private imprimeBlocos(blocos: BlocoGame[], caixa: cc.Node) {
        let bloco;
        let montavel = this.NAO_MONTAVEL;

        caixa.setAnchorPoint(0, 1);

        if (caixa.name == "CaixaSolucao") {
            montavel = this.MONTAVEL;

            if (blocos == null || blocos.length == 0) {
                this.criaEspacoCodigoVazio(caixa);
            }
        }else{
            this.yListaCodigoInicial = 35;
        }

        for (var i = 0; i < blocos.length; i++) {
            bloco = blocos[i];
            this.criarTrechoCodigo(bloco, caixa, 0, montavel);
        }
        //Ajusta o tamanho da caixa de acordo com o número de blocos impressos.
        this.caixaSolucao.height = 10000;
        this.yListaCodigoInicial = 0;
    }

    private criaEspacoCodigoVazio(caixaCodigos: cc.Node) {
        let espacoCodigoNode = cc.instantiate(this.espacoCodigo);
        let espacoCodigoCaixa = espacoCodigoNode.getChildByName("EspacoCodigoCaixa");
        let collider = null;

        espacoCodigoNode.setContentSize(20, this.TAMANHO_FONTE);
        espacoCodigoNode.x = 0;
        espacoCodigoNode.y = -100;

        espacoCodigoCaixa.setContentSize(20,
            this.TAMANHO_FONTE * 0.5);
        espacoCodigoCaixa.x = 0;
        espacoCodigoCaixa.y = 0;
        espacoCodigoCaixa.group = "EspacoCodigo";

        espacoCodigoCaixa.setAnchorPoint(0, 1);

        collider = espacoCodigoCaixa.getComponent(cc.BoxCollider);
        collider.size = espacoCodigoCaixa.getContentSize();

        caixaCodigos.addChild(espacoCodigoNode);
    }

    /**
     * Imprime na tela um bloco e seus respectivos filhos.
     * @param {BlocoGame} bloco Bloco para ser imprimido
     * @param {cc.Node} parente Parente do bloco a ser imprimido
     * @param {number} xInicial A posição xInicial do bloco a ser imprimido
     * @param {boolean} montavel Se o bloco será montável ou não.
     */
    private criarTrechoCodigo(bloco: BlocoGame, parente: cc.Node, xInicial: number, montavel: boolean) {
        let yListaCodigoInicialTemp;

        this.yListaCodigoInicial -= this.TAMANHO_FONTE;
        bloco.setAnchorPoint(0, 1);

        bloco.parent = parente;

        if (bloco.tipo == bloco.TIPO_COMPOSTO) {
            bloco.color = new cc.Color(0, 0, 255);
            //Se o bloco tem filhos
            if (bloco.blocosFilhos != null && bloco.blocosFilhos.length > 0) {

                bloco.parent = parente;
                this.montaBlocoComposto(bloco, xInicial, montavel);

                yListaCodigoInicialTemp = this.yListaCodigoInicial;
                this.yListaCodigoInicial = - 0.5 * this.TAMANHO_FONTE;

                for (var i = 0; i < bloco.blocosFilhos.length; i++) {
                    this.criarTrechoCodigo(bloco.blocosFilhos[i], bloco, this.DISTANCIA_TAB, montavel);
                }
                yListaCodigoInicialTemp -= (bloco.totalLinhas + 2) * this.TAMANHO_FONTE;
                this.yListaCodigoInicial = yListaCodigoInicialTemp;
            } else {
                bloco.parent = parente;
                this.montaBlocoComposto(bloco, xInicial, montavel);
                if (montavel) {
                    this.yListaCodigoInicial -= (bloco.totalLinhas + 2) * this.TAMANHO_FONTE;
                } else {
                    this.yListaCodigoInicial -= (bloco.totalLinhas) * this.TAMANHO_FONTE;
                }
            }
        } else {
            bloco.parent = parente;
            this.montaBlocoSimples(bloco, xInicial, montavel);
        }
        return bloco;
    }

    /**
     * Monta um bloco composto considerando a quantidade de filhos existentes para se
     * determinar o tamanho total do bloco.
     * @param bloco Bloco para se montar.
     * @param xInicial Posição x inicial do bloco
     * @param montavel Se o bloco é montável ou não.
     */
    private montaBlocoComposto(bloco: BlocoGame, xInicial: number, montavel: boolean) {
        let tamanhoBloco, collider, chaveFechamento;
        let listaVerificacao = (bloco.parent instanceof BlocoGame) ?
            bloco.parent.blocosFilhos : this.desafioCena.solucao;

        if (montavel) {
            this.yListaCodigoInicial -= this.TAMANHO_FONTE;
        }

        bloco.addComponent("MovimentoCodigo");

        bloco.addComponent(cc.RichText);
        let label = bloco.getComponent(cc.RichText);

        label.fontSize = this.TAMANHO_FONTE;

        if (montavel) {
            label.string = "<color=#00249c>" + bloco.valor + "{" + "</color>";
            bloco.group = "Solucoes";
        } else {
            label.string = "<color=#00249c>" + bloco.valor + "{}" + "</color>";
            bloco.group = "Opcoes";
        }

        label.fontSize = this.TAMANHO_FONTE;

        bloco.x = xInicial;
        bloco.y = this.yListaCodigoInicial;

        if (montavel) {
            bloco.calculaLinhasMontavel();
            tamanhoBloco = (bloco.totalLinhas + 1) * this.TAMANHO_FONTE;
            this.montaEspacosCodigo(bloco, this.POSICAO_SUPERIOR, tamanhoBloco);

            if (bloco.verificaPosicaoLista(listaVerificacao)) {
                this.montaEspacosCodigo(bloco, this.POSICAO_INFERIOR, tamanhoBloco);
            } else {
                this.yListaCodigoInicial += this.TAMANHO_FONTE;
            }

            if (bloco.blocosFilhos == null || bloco.blocosFilhos.length == 0) {
                this.montaEspacosCodigo(bloco, this.POSICAO_INTERNA, tamanhoBloco);
            }
            chaveFechamento = this.fechaChaves(0, tamanhoBloco);
            chaveFechamento.parent = bloco;
        } else {
            bloco.calculaLinhas();
            tamanhoBloco = (bloco.totalLinhas) * this.TAMANHO_FONTE;
        }

        bloco.addComponent(cc.BoxCollider);
        collider = bloco.getComponent(cc.BoxCollider);

        collider.size.width = label.node.width;
        collider.size.height = this.TAMANHO_FONTE;
        collider.offset.x = label.node.width / 2;
        collider.offset.y = -label.node.height / 2;

        return bloco;
    }

    /**
     * Monta a chave de fechamento de um bloco composto, considerando o tamanho
     * do node pai junto com os filhos.
     * @param xInicial Posição x inicial da chave.
     * @param tamanhoBloco Tamanho do bloco composto dono da chave.
     */
    private fechaChaves(xInicial: number, tamanhoBloco: number) {
        let trechoCriado: cc.Node = new cc.Node("chaveFechamento");
        trechoCriado.setAnchorPoint(0, 1);

        trechoCriado.addComponent(cc.RichText);
        let label = trechoCriado.getComponent(cc.RichText);

        label.string = "<color=#00249c>" + "}" + "</color>";

        label.fontSize = this.TAMANHO_FONTE;

        trechoCriado.y = -tamanhoBloco + (0.5 * this.TAMANHO_FONTE);

        trechoCriado.x = xInicial;

        return trechoCriado;
    }

    /**
     * Monta um bloco simples.
     * @param bloco Bloco para ser montado.
     * @param xInicial Posição x inicial do bloco.
     * @param montavel Se o bloco é montável ou não.
     */
    private montaBlocoSimples(bloco: BlocoGame, xInicial: number, montavel: boolean) {
        let label, collider;
        let listaVerificacao = (bloco.parent instanceof BlocoGame) ?
            bloco.parent.blocosFilhos : this.desafioCena.solucao;

        if (montavel) {
            this.yListaCodigoInicial -= this.TAMANHO_FONTE;
        }

        bloco.addComponent("MovimentoCodigo");

        bloco.addComponent(cc.RichText);
        label = bloco.getComponent(cc.RichText);
        label.string = "<color=#000000>" + bloco.valor + "</color>";
        label.fontSize = this.TAMANHO_FONTE;

        bloco.x = xInicial;
        bloco.y = this.yListaCodigoInicial;

        bloco.addComponent(cc.BoxCollider);
        collider = bloco.getComponent(cc.BoxCollider);

        collider.size.width = label.node.width;
        collider.size.height = this.TAMANHO_FONTE;
        collider.offset.x = label.node.width / 2;
        collider.offset.y = -label.node.height / 2;

        if (montavel) {
            this.montaEspacosCodigo(bloco, this.POSICAO_SUPERIOR, 0);

            if (bloco.verificaPosicaoLista(listaVerificacao)) {
                this.montaEspacosCodigo(bloco, this.POSICAO_INFERIOR, 0);
                this.yListaCodigoInicial -= 2 * this.TAMANHO_FONTE;
            }
            bloco.group = "Solucoes";
        } else {
            bloco.group = "Opcoes";
        }
    }

    /**
     * Monta um espaço para que códigos possam ser colocados.
     * @param bloco Bloco a que esse espaço de código pertence.
     * @param posicao Posição em que o espaço está em relação
     * ao bloco
     */
    private montaEspacosCodigo(bloco: BlocoGame, posicao: number, tamanhoBloco: number) {
        let espacoCodigoNode = cc.instantiate(this.espacoCodigo);
        let espacoCodigoCaixa = espacoCodigoNode.getChildByName("EspacoCodigoCaixa");
        let fumaca = espacoCodigoNode.getChildByName("Fumaca");

        espacoCodigoNode.setContentSize(bloco.getContentSize());
        this.posicionaEspacoCodigo(espacoCodigoCaixa, bloco, posicao);
        this.posicionaFumaca(fumaca, bloco, posicao);

        if (bloco.tipo == bloco.TIPO_COMPOSTO) {
            if (posicao == this.POSICAO_INFERIOR) {
                espacoCodigoCaixa.y = -tamanhoBloco - (2 * this.TAMANHO_FONTE);
                espacoCodigoNode.name = "EspacoCodigoInferior";
            } else if (posicao == this.POSICAO_INTERNA) {
                espacoCodigoCaixa.y = -2.9 * this.TAMANHO_FONTE;
                espacoCodigoNode.name = "EspacoCodigoInterno";
            } else {
                espacoCodigoNode.name = "EspacoCodigoSuperior";
            }
        } else if (posicao == this.POSICAO_INFERIOR) {
            espacoCodigoNode.name = "EspacoCodigoInferior";
        } else {
            espacoCodigoNode.name = "EspacoCodigoSuperior";
        }

        bloco.addChild(espacoCodigoNode);
    }

    /**
     * Posiciona a animação de fumaça em relação a um espaço
     * para se colocar um bloco.
     * @param fumaca fumaça para ser posicionada.
     * @param bloco bloco que contém esta fumaça.
     * @param posicao posição desta fumaça em relação ao bloco.
     */
    private posicionaFumaca(fumaca: cc.Node, bloco: BlocoGame, posicao) {
        let sprite = fumaca.getComponent(cc.Sprite) as SpriteCustom;

        fumaca.x = 0;
        fumaca.y = 0;
        if (posicao == this.POSICAO_INFERIOR) {
            fumaca.y -= 2.5 * this.TAMANHO_FONTE;
        }
        fumaca.scaleX = 1.5 * (bloco.getContentSize().width / sprite.largura);
        fumaca.scaleY = 1.5 * (bloco.getContentSize().height / sprite.altura);
        fumaca.setAnchorPoint(0, 1);
    }

    /**
     * Posiciona o espaço de código em relação ao bloco ao qual ele pertence.
     * @param espaco espaço para ser posicionado.
     * @param bloco bloco que contém este espaço.
     * @param posicao posição deste espaço em relação ao bloco.
     */
    private posicionaEspacoCodigo(espaco: cc.Node, bloco: BlocoGame, posicao) {
        let sprite = espaco.getComponent(cc.Sprite) as SpriteCustom;
        let collider = null;

        espaco.setContentSize(20,
            bloco.getContentSize().height * 0.5);
        espaco.x = 0;
        espaco.y = 0;
        espaco.group = "EspacoCodigo";
        if (posicao == this.POSICAO_INFERIOR) {
            espaco.y -= 2.5 * this.TAMANHO_FONTE;
        } else {
            espaco.y -= 0.5 * this.TAMANHO_FONTE;
        }
        espaco.setAnchorPoint(0, 1);

        collider = espaco.getComponent(cc.BoxCollider);
        collider.size = espaco.getContentSize();
        collider.offset.x = bloco.getContentSize().width / 7;
        collider.offset.y = -bloco.getContentSize().height / 3.5;
    }

    /**
     * Reestrutura as listas de blocos considerando que houve uma transferência
     * de um bloco de uma lista para outra.
     * bloco(Caixa da Solução ou Caixa de Opções).
     * @param blocoAlvo Bloco em que ocorreu a colisão.
     * @param blocoMovido Bloco que foi movido de uma lista para outra.
     */
    reestruturaBlocos(blocoAlvo: BlocoGame, blocoMovido: BlocoGame) {
        let novaLista: BlocoGame[];

        if (blocoAlvo instanceof BlocoGame) {
            novaLista = this.reposionaBloco(this.desafioCena.solucao, blocoAlvo, blocoMovido);
            this.desafioCena.solucao = novaLista;
        }else{
            this.desafioCena.solucao.push(blocoMovido);
            this.desafioCena.solucao = this.copiarListaBlocos(this.desafioCena.solucao);
        }

        //Se o bloco movido vem da caixa de opções, atualize, também, a caixa de opções.
        if (BlocoGame.procuraBlocoPorID(this.desafioCena.opcoes, blocoMovido) != null) {
            BlocoGame.retiraBlocoCompleto(this.desafioCena.opcoes, blocoMovido);
            this.desafioCena.opcoes = this.copiarListaBlocos(this.desafioCena.opcoes);
            this.caixaOpcoes.removeAllChildren(true);
            this.imprimeBlocos(this.desafioCena.opcoes, this.caixaOpcoes);
        }

        this.caixaSolucao.removeAllChildren(true);
        this.imprimeBlocos(this.desafioCena.solucao, this.caixaSolucao);
    }

    /**
     * Reposiciona um bloco de uma lista para outra.
     * @param listaBlocos Lista de blocos para se colocar o novo bloco;
     * @param alvo Bloco em que ocorreu a colisão;
     * @param blocoMovido Bloco para se colocar na lista;
     * @returns Lista de blocos atualizada.
     */
    private reposionaBloco(listaBlocos: BlocoGame[], alvo: BlocoGame, blocoMovido: BlocoGame) {
        let novaLista: BlocoGame[] = new Array();
        let pai;

        for (let index = 0; index < listaBlocos.length; index++) {
            const elemento = listaBlocos[index];

            if (elemento.id != blocoMovido.id) {
                novaLista.push(elemento);
            }

            if (elemento.id == alvo.id) {
                this.retiraBlocoDoPai(elemento.blocosFilhos, blocoMovido);
                this.lidaComCaixaColidida(blocoMovido, index, novaLista, elemento);
            } else if (elemento.blocosFilhos != null && elemento.blocosFilhos.length != 0) {
                elemento.blocosFilhos = this.reposionaBloco(elemento.blocosFilhos, alvo, blocoMovido);
            }
        }

        return this.copiarListaBlocos(novaLista);
    }

    /**
     * Verifica qual caixa de colisão foi acionada pela bloco movido pelo o usuário
     * e reposiciona e adiciona o bloco movido para a lista disponibilizada.
     * @param blocoMovido Bloco que foi movido
     * @param posicao Posição para se colocar o bloco movido
     * @param listaBlocos Lista de blocos para se colocar o bloco movido
     * @param blocoAlvo Bloco que contêm as caixas colisoras
     */
    private lidaComCaixaColidida(blocoMovido: BlocoGame, posicao: number, listaBlocos: BlocoGame[], blocoAlvo: BlocoGame) {
        if (blocoMovido.caixaColisora.parent.name == "EspacoCodigoSuperior")
            listaBlocos.splice(posicao, 0, blocoMovido);
        else if (blocoMovido.caixaColisora.parent.name == "EspacoCodigoInferior") {
            listaBlocos.splice(posicao + 1, 0, blocoMovido);
        }
        else if (blocoMovido.caixaColisora.parent.name == "EspacoCodigoInterno") {
            if (blocoAlvo.blocosFilhos == null) {
                blocoAlvo.blocosFilhos = new Array();
            }
            blocoAlvo.blocosFilhos.push(blocoMovido);
        }
        blocoMovido.caixaColisora = null;
    }

    /**
     * Retira o bloco disponibilizado de um pai específico.
     * @param blocos pai para se retirar o bloco especificado.
     * @param bloco bloco para se retirar.
     */
    private retiraBlocoDoPai(blocos: BlocoGame[], bloco: BlocoGame) {
        let posicaoBlocoMovido;

        if (blocos != null) {
            for (let index = 0; index < blocos.length; index++) {
                const element = blocos[index];
                if (element.id == bloco.id) {
                    posicaoBlocoMovido = blocos.indexOf(element, 0);
                    blocos.splice(posicaoBlocoMovido, 1);
                    break;
                } else {
                    this.retiraBlocoDoPai(element.blocosFilhos, bloco);
                }
            }
        }
    }

    /**
     * Pega um bloco escolhido pelo usuário, desmonta ele e adiciona a caixa de opções
     * que o usuário tem para utilizar.
     * @param bloco Bloco para ser transferido para a caixa de opções.
     */
    public repensarCodigo(bloco: BlocoGame) {
        let novasOpcoes = new Array();

        //Pega os blocos que já estavam nas opções e adiciona na nova lista
        this.caixaOpcoes.children.forEach(element => {
            if (element instanceof BlocoGame) {
                novasOpcoes.push(this.geraBloco(element.id, element.tipo,
                    element.valor, element.blocosFilhos));
            }
        });

        novasOpcoes = novasOpcoes.concat(this.desmontarBloco(bloco));

        //Retira o bloco da lista de solução.
        BlocoGame.retiraBlocoCompleto(this.desafioCena.solucao, bloco);

        this.caixaOpcoes.removeAllChildren(true);
        this.caixaSolucao.removeAllChildren(true);

        this.desafioCena.solucao = this.copiarListaBlocos(this.desafioCena.solucao);
        this.desafioCena.opcoes = novasOpcoes;
        this.imprimeBlocos(this.desafioCena.opcoes, this.caixaOpcoes);
        this.imprimeBlocos(this.desafioCena.solucao, this.caixaSolucao);
    }

    /**
     * Desmonta um bloco retirando seus filhos e retornando uma lista com todos os blocos
     * encontrados.
     * @param bloco Bloco para se desmontar.
     * @returns Lista com o bloco desmontado e seus filhos encontrados.
     */
    private desmontarBloco(bloco: BlocoGame) {
        let novaLista = new Array();

        if (bloco.blocosFilhos != null) {
            bloco.blocosFilhos.forEach(element => {
                if (element.blocosFilhos != null) {
                    novaLista = novaLista.concat(this.desmontarBloco(element));
                } else {
                    novaLista.push(this.geraBloco(element.id, element.tipo,
                        element.valor, element.blocosFilhos));
                }
            });
        }

        bloco.blocosFilhos = new Array();
        novaLista.push(this.geraBloco(bloco.id, bloco.tipo, bloco.valor, bloco.blocosFilhos));

        return novaLista;
    }

    /**
     * Copia um desafio.
     * @param desafio desafio a ser copiado.
     * @returns Uma copia do desafio.
     */
    private copiarDesafio(desafio: Desafio) {
        let copiaDesafio = new Desafio();
        let solucao: BlocoGame[];
        let opcoes: BlocoGame[];

        solucao = this.copiarListaBlocos(desafio.solucao);
        opcoes = this.copiarListaBlocos(desafio.opcoes);

        copiaDesafio.id = desafio.id;
        copiaDesafio.nome = desafio.nome;
        copiaDesafio.opcoes = opcoes;
        copiaDesafio.solucao = solucao;
        copiaDesafio.descricao = desafio.descricao;
        copiaDesafio.tempoInicial = desafio.tempoInicial;
        copiaDesafio.tempo = desafio.tempo;
        copiaDesafio.dificuldade = desafio.dificuldade;
        copiaDesafio.mensagemFimTempo = desafio.mensagemFimTempo;

        return copiaDesafio;
    }

    /**
     * Copia uma lista de blocos.
     * @param listaBlocos Lista de blocos a ser copiada.
     * @returns Cópia da lista de blocos.
     */
    private copiarListaBlocos(listaBlocos: BlocoGame[]) {
        let novaLista: BlocoGame[] = new Array();

        for (let index = 0; index < listaBlocos.length; index++) {
            const elemento = listaBlocos[index];

            novaLista[index] = this.geraBloco(elemento.id,
                elemento.tipo, elemento.valor, null);

            if (elemento.blocosFilhos != null) {
                novaLista[index].blocosFilhos = this.copiarListaBlocos(elemento.blocosFilhos);
            }
        }

        return novaLista;
    }

    /**
     * Gera um bloco
     * @param id id do bloco a ser gerado
     * @param tipo tipo do bloco a ser gerado
     * @param valor valor do bloco a ser gerado
     * @param blocosFilhos lista de blocos Filhos
     * do bloco a ser gerado
     */
    private geraBloco(id, tipo, valor, blocosFilhos) {
        let bloco: BlocoGame = new BlocoGame(id, valor, tipo);
        bloco.blocosFilhos = blocosFilhos;
        return bloco;
    }

    private shuffle(array) {
        var currentIndex = array.length, temporaryValue, randomIndex;
      
        // While there remain elements to shuffle...
        while (0 !== currentIndex) {
      
          // Pick a remaining element...
          randomIndex = Math.floor(Math.random() * currentIndex);
          currentIndex -= 1;
      
          // And swap it with the current element.
          temporaryValue = array[currentIndex];
          array[currentIndex] = array[randomIndex];
          array[randomIndex] = temporaryValue;
        }
      
        return array;
      }
}

export { Logica };

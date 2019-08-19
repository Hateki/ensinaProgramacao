import Bloco from "./Bloco";

const { ccclass, property } = cc._decorator;

/**
 * Classe responsável por representar um bloco de código
 * que o jogador pode manipular.
 */
@ccclass
export default class BlocoGame extends cc.Node implements Bloco {
    id: number;
    valor: string;
    tipo: number;
    blocosFilhos: BlocoGame[];
    caixaColisora: cc.Node;
    totalLinhas = 0;

    TIPO_COMPOSTO = 2;
    TIPO_SIMPLES = 1;

    constructor(id: number, valor: string, tipo: number) {
        super("" + id);
        this.id = id;
        this.valor = valor;
        this.tipo = tipo;
        this.caixaColisora = null;
    }

    /**
     * Calcula a quantidade de linhas que um bloco composto tem contanto com 
     * os seus filhos.
     * @param bloco bloco para se calcular a quantidade de linhas.
     */
    calculaLinhas() {
        let totalLinhas = 0;
        for (var i = 0; this.blocosFilhos != null && i < this.blocosFilhos.length; i++) {
            let bloco = this.blocosFilhos[i];
            totalLinhas++;
            if (bloco.tipo == this.TIPO_COMPOSTO) {
                totalLinhas++;
                totalLinhas += bloco.calculaLinhas();
            }
        }
        this.totalLinhas = totalLinhas;
        return totalLinhas;
    }

    /**
    * Calcula a quantidade de linhas que um bloco composto tem contanto com 
    * os seus filhos e os espaços de montagem de bloco.
    * @param bloco bloco para se calcular a quantidade de linhas.
    */
    calculaLinhasMontavel() {
        let totalLinhas = 0;

        //Se esse bloco composto estiver vazio
        if (this.blocosFilhos == null || this.blocosFilhos.length == 0) {
            totalLinhas += 2;
            this.totalLinhas = totalLinhas;
            return totalLinhas;
        }

        for (var i = 0; this.blocosFilhos != null && i < this.blocosFilhos.length; i++) {
            let elemento = this.blocosFilhos[i];
            totalLinhas += 3;

            if(!elemento.verificaPosicaoLista(this.blocosFilhos)){
                if(elemento.tipo == this.TIPO_COMPOSTO){
                    totalLinhas -= 1;
                }else{
                    totalLinhas -= 2;
                } 
            }

            if (elemento.tipo == this.TIPO_COMPOSTO) {
                if (elemento.blocosFilhos == null || elemento.blocosFilhos.length == 0) {
                    totalLinhas += 3;
                } else {
                    totalLinhas++;
                    totalLinhas += elemento.calculaLinhasMontavel();
                }
            } else {
                totalLinhas++;
            }
        }
        this.totalLinhas = totalLinhas;
        return totalLinhas;
    }

    public verificaPosicaoLista(listaBlocos:BlocoGame[]){

        for (let index = 0; index < listaBlocos.length; index++) {
            const element = listaBlocos[index];
            
            if(this.id == element.id){
                return (index == listaBlocos.length - 1);
            }
        }

        return true;
    }

    /**
     * Prepara um bloco para ser movimentado pelo usuário, retira seus
     * espaços para se colocar blocos e os filhos de blocos compostos.
     */
    preparaBlocoParaMovimento() {
        let chaveFechamento;

        this.retiraFilho("EspacoCodigoInferior");
        this.retiraFilho("EspacoCodigoSuperior");
        this.retiraFilho("EspacoCodigoInterno");

        chaveFechamento = this.getChildByName("chaveFechamento");
        if (chaveFechamento != null) {
            chaveFechamento.active = false;
            this.getComponent(cc.RichText).string = "<color=#00249c>" + this.valor + "{...}" + "</color>";
        }

        if (this.blocosFilhos != null && this.blocosFilhos.length != 0) {
            this.blocosFilhos.forEach(element => {
                element.active = false;
            });
        }
    }

    /**
     * Retira um filho de um bloco baseado no nome
     * @param nome Nome do filho para se retirar
     */
    private retiraFilho(nome: string) {
        let espacoBloco = this.getChildByName(nome);
        if (espacoBloco != null) {
            espacoBloco.destroy();
        }
    }

    /**
     * Copia uma lista de blocos.
     * @param listaBlocos Lista de blocos a ser copiada.
     * @returns Cópia da lista de blocos.
     */
    static copiarListaBlocos(listaBlocos: BlocoGame[]) {
        let novaLista: BlocoGame[] = new Array();

        listaBlocos.forEach(element => {
            novaLista.push(this.copiarBloco(element));
        });

        return novaLista;
    }

    /**
     * Copia um bloco.
     * @param bloco Bloco para se copiar
     */
    static copiarBloco(bloco: BlocoGame) {
        let copia: BlocoGame = cc.instantiate(bloco);

        copia.valor = bloco.valor;
        copia.id = bloco.id;
        copia.tipo = bloco.tipo;
        copia.active = false;
        bloco.parent.addChild(copia,bloco.parent.children.indexOf(bloco));
        
        copia.blocosFilhos = bloco.blocosFilhos;

        if (bloco.blocosFilhos != null) {
            this.associaBlocos(copia);
        } else {
            copia.blocosFilhos = null;
        }
        return copia;
    }

    /**
     * Associa os filhos(Nodes) de um bloco com a sua lista de
     * blocos filhos para garantir que as referências sejam as
     * mesmas.
     * @param bloco Bloco para se associar
     */
    static associaBlocos(bloco: BlocoGame) {
        let novaLista: BlocoGame[] = new Array();

        if (bloco.blocosFilhos != null && bloco.children != null && bloco.children.length != 0) {
            for (let index = 0; index < bloco.children.length; index++) {
                const element = bloco.children[index];

                if (element instanceof BlocoGame) {
                    novaLista.push(element);
                }
            }
            this.transferePropriedades(bloco.blocosFilhos, novaLista);
        }

        if (novaLista.length != 0) {
            bloco.blocosFilhos = novaLista;
        }
        return novaLista;
    }

    /**
     * Transfere as propriedades de uma lista de blocos para outra.
     * @param listaBase Lista de bloco para se pegar as propriedades.
     * @param listaAlvo Lista de bloco para se tranferir as propriedades
     */
    private static transferePropriedades(listaBase: BlocoGame[], listaAlvo: BlocoGame[]) {
        for (let index = 0; index < listaBase.length; index++) {
            const blocoAntigo = listaBase[index];
            let blocoNovo = this.procuraBlocoPorNome(listaAlvo, blocoAntigo);

            blocoNovo.valor = blocoAntigo.valor;
            blocoNovo.id = blocoAntigo.id;
            blocoNovo.tipo = blocoAntigo.tipo;
            blocoNovo.blocosFilhos = blocoAntigo.blocosFilhos;

            this.associaBlocos(blocoNovo);
        }
    }

    /**
     * Procura um bloco dentro de uma lista que tenha o mesmo nome
     * do bloco disponibilizado.
     * @param listaBlocos Lista para se procurar.
     * @param bloco bloco para se procurar dentro da lista.
     * @returns Bloco encontarado
     */
    private static procuraBlocoPorNome(listaBlocos: BlocoGame[], bloco) {
        let blocoAchado;
        for (let j = 0; j < listaBlocos.length; j++) {
            const elemento = listaBlocos[j];

            if (elemento.name == bloco.name) {
                blocoAchado = elemento;
                return blocoAchado;
            }
        }
    }

    /**
     * Procura um bloco em uma lista a partir do seu ID
     * @param listaBlocos lista de blocos para se procurar;
     * @param bloco bloco pra se procurar.
     */
    public static procuraBlocoPorID(listaBlocos: BlocoGame[], bloco) {
        let blocoAchado;
        for (let j = 0; j < listaBlocos.length; j++) {
            const elemento = listaBlocos[j];

            if (elemento.id == bloco.id) {
                blocoAchado = elemento;
                return blocoAchado;
            }
        }
    }

    /**
     * Retira um bloco de uma lista se o bloco estiver nessa lista ou se
     * o bloco estiver dentro da lista de filhos dos blocos que estão
     * dentro da lista disponibilizada.
     * @param listaBlocos lista de blocos para se procurar o bloco; 
     * @param bloco bloco para se procurar.
     */
    public static retiraBlocoCompleto(listaBlocos: BlocoGame[], bloco){
        let blocoAchado;
        for (let j = 0; j < listaBlocos.length; j++) {
            const elemento = listaBlocos[j];

            if (elemento.id == bloco.id) {
                blocoAchado = elemento;
                listaBlocos.splice(j,1);
                return blocoAchado;
            }else if(elemento.blocosFilhos != null){
                blocoAchado = this.retiraBlocoCompleto(elemento.blocosFilhos,bloco);
                if(blocoAchado != null){
                    return blocoAchado;
                }
            }
        }
        return null;
    }
}

export { BlocoGame }

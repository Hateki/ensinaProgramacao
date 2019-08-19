import BlocoGame from "./BlocoGame";
const {ccclass, property} = cc._decorator;

/**
 * Classe responsável por representar o desafio que o jogador
 * tem que resolver.
 */
@ccclass
export default class Desafio {
    id: number;
    nome: string;
    descricao:string;
    opcoes: BlocoGame[];
    solucao: BlocoGame[];
    tempoInicial: string;
    tempo: string;
    dificuldade: string;
    mensagemFimTempo:string;
    completado:boolean;

    public criarDesafio(stringJson:string){
        let desafioJson = JSON.parse(stringJson);

        this.id = desafioJson.id;
        this.nome = desafioJson.nome;
        this.descricao = desafioJson.descricao;
        this.opcoes = this.preecheBlocosFilhos(desafioJson.opcoes);
        this.solucao = this.preecheBlocosFilhos(desafioJson.solucao);
        this.tempoInicial = desafioJson.tempoInicial;
        this.tempo = desafioJson.tempo;
        this.dificuldade = desafioJson.dificuldade;
        this.mensagemFimTempo = desafioJson.mensagemFimTempo;
        this.completado = false;
    }

    private preecheBlocosFilhos(blocosFilhos){
        let blocosFinais:BlocoGame[] = new Array();

        blocosFilhos.forEach(bloco => {
            let blocoCriado = new BlocoGame(bloco.id,bloco.valor,bloco.tipo);
            if(bloco.blocosFilhos != null && bloco.blocosFilhos.length != 0){
                this.preecheBlocosFilhos(bloco.blocosFilhos);
            }else if(blocoCriado.tipo == 2){
                blocoCriado.blocosFilhos = new Array();
            }
            blocosFinais.push(blocoCriado);
        });
        
        return blocosFinais;
    }
}

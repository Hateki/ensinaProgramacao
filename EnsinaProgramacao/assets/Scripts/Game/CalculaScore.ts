import Desafio from "./Desafio";
import ValoresImportantes from "./ValoresImportantes";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CalculaScore extends cc.Component {

    @property(cc.Label)
    label: cc.Label = null;

    private score;
    private importantes: ValoresImportantes;


    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start() {
        this.importantes = cc.find("ValoresImportantes").
            getComponent("ValoresImportantes");
    }

    // update (dt) {}

    public calcularScore(contErros: number, desafio: Desafio) {
        let tempoDisponivel;
        let tempoDeSobra;
        let scoreNumerico = 50;
        let tempoAcabou = false;

        if (this.label.string != null && this.label.string != "") {
            tempoDisponivel = this.calculaTempo(desafio.tempoInicial, desafio.tempo);
            tempoDeSobra = this.calculaTempo(this.label.string, desafio.tempo);
        } else {
            tempoDisponivel = 100;
            tempoDeSobra = 0;
            tempoAcabou = true;
        }

        if (tempoDeSobra >= 0.75 * tempoDisponivel) {
            this.score = Pontuacao.A;
        } else if (tempoDeSobra >= 0.50 * tempoDisponivel) {
            this.score = Pontuacao.B;
        } else if (tempoDeSobra >= 0.25 * tempoDisponivel) {
            this.score = Pontuacao.C;
        } else {
            this.score = Pontuacao.D;
        }

        scoreNumerico = (tempoDeSobra / tempoDisponivel) * scoreNumerico;

        for (let index = 0; index < contErros; index++) {
            if (this.score == Pontuacao.D) {
                break;
            }
            this.score -= 1;
            if (scoreNumerico - (0.25 * scoreNumerico) > 0) {
                scoreNumerico -= scoreNumerico - (0.25 * scoreNumerico);
            }
        }


        if (!tempoAcabou) {
            this.importantes.numeroScore = scoreNumerico;
            this.importantes.letraScore = this.score;
        } else {
            this.importantes.numeroScore = -1;
            this.importantes.letraScore = this.score;
        }
    }

    private calculaTempo(tempoInicial: string, tempoFinal: string) {
        let valorInicial = this.retiraTempo(tempoInicial);
        let valorFinal = this.retiraTempo(tempoFinal);

        return valorFinal - valorInicial;
    }

    private retiraTempo(tempo: string) {
        let stringHora = tempo[0] + tempo[1];
        let stringMinuto = tempo[3] + tempo[4];
        let valorHora = parseInt(stringHora);
        let valorMinuto = parseInt(stringMinuto);

        valorHora = valorHora * 60;

        return valorHora + valorMinuto;
    }
}

enum Pontuacao {
    D, C, B, A
}

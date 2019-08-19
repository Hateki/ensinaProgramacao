import ValoresImportantes from "../Game/ValoresImportantes";
import Desafio from "../Game/Desafio";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Score extends cc.Component {

    @property(cc.Label)
    letra: cc.Label = null;

    @property(cc.Label)
    numero: cc.Label = null;

    @property(cc.Label)
    fala: cc.Label = null;

    @property(cc.Node)
    botaoProxima: cc.Node = null;

    @property(cc.Node)
    carregando: cc.Node = null;

    public carregou = false;
    private importantes: ValoresImportantes;


    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this.importantes = cc.find("ValoresImportantes").getComponent(ValoresImportantes);
        this.importantes.proximaCena = "SelecionarDesafio";
        cc.director.preloadScene("Loading", () => {
            this.carregou = true;
        });
    }

    start() {
        let importantes = cc.find("ValoresImportantes").
            getComponent(ValoresImportantes);
        let desafio;

        switch (importantes.letraScore) {
            case Pontuacao.A:
                this.letra.string = "A"
                break;
            case Pontuacao.B:
                this.letra.string = "B"
                break;
            case Pontuacao.C:
                this.letra.string = "C"
                break;
            default:
                this.letra.string = "D"
                break;
        }

        if (importantes.numeroScore == -1) {
            this.numero.string = "$0";
        } else {
            this.numero.string = "$" + Math.ceil(importantes.numeroScore) * 100;
            this.importantes.saldoJogador += Math.ceil(importantes.numeroScore);
            desafio = this.acharDesafio(importantes.listaDesafios,
                importantes.desafioEscolhido);
            
            desafio.completado = true;
        }
        this.fala.string = importantes.mensagemResultado;
    }

    update(dt) {
        if (this.carregou) {
            this.botaoProxima.active = true;
            this.carregando.active = false;
        }
    }

    private acharDesafio(listaDesafios: Desafio[], desafio) {
        for (let index = 0; index < listaDesafios.length; index++) {
            const desafioLista = listaDesafios[index];

            if (desafio.id == desafioLista.id) {
                return desafioLista;
            }
        }
        return null;
    }
}

enum Pontuacao {
    D, C, B, A
}

import Cliente from "../Web/Cliente";
import ValoresImportantes from "../Game/ValoresImportantes";


const { ccclass, property } = cc._decorator;

@ccclass
export default class Loading extends cc.Component {

    @property(cc.Label)
    label: cc.Label = null;

    private web: cc.Node;

    private url;
    private dicas = null;
    private pronto = false;
    private cliente:Cliente;
    private importantes: ValoresImportantes;

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        
    }

    start() {
        let loading = this;
        this.url = cc.url.raw('resources/Dicas.json');

        this.importantes = cc.find("ValoresImportantes").getComponent(ValoresImportantes);
        cc.director.preloadScene(this.importantes.proximaCena);
        this.schedule(this.mudaDica, 5, cc.macro.REPEAT_FOREVER);

        this.web = cc.find("Web");
        this.cliente = this.web.getComponent(Cliente);
        this.cliente.nomeDesafio = "CalculaVelocidade";

        cc.loader.load(loading.url, (erro, data) => {
            loading.dicas = [
                "Cuidado para não deixar o chefe nervoso",
                "Se precisar de ajuda chame o Guru",
                "Tente completar o desafio rapidamente para ganhar mais pontos"
            ]
            this.mudaDica();
        });
    }

    update(dt) {
        this.terminaLoad();
    }

    terminaLoad() {
        if (this.cliente.conectou && !this.pronto) {
            cc.director.loadScene(this.importantes.proximaCena);
            this.importantes.proximaCena = "Programacao";
            this.pronto = true;
        }
    }

    mudaDica() {
        var nAleatorio;
        var min;
        var max;

        if (this.dicas != null) {
            min = Math.ceil(0);
            max = Math.floor(this.dicas.length - 1);
            nAleatorio = Math.floor(Math.random() * (max - min + 1)) + min;

            this.label.string = this.dicas[nAleatorio];
        }
    }
}
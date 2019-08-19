import Desafio from "../Game/Desafio";
import Cliente from "../Web/Cliente";
import Email from "./Emaill";
import ValoresImportantes from "../Game/ValoresImportantes";

const { ccclass, property } = cc._decorator;

@ccclass
export default class MontaLista extends cc.Component {

    @property(cc.Node)
    primeiroDesafio: cc.Node = null;

    @property(cc.Prefab)
    emailPrefab: cc.Prefab = null;

    @property(cc.Label)
    labelSaldo: cc.Label = null;

    @property(cc.Prefab)
    dificuldade: cc.Prefab = null;

    @property(cc.Node)
    dificuldadeMedio: cc.Node = null;

    @property(cc.Node)
    dificuldadeDificil: cc.Node = null;

    private cliente: Cliente;
    private importantes: ValoresImportantes;
    public desafios: Desafio[];

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this.iniciaLista();
    }

    start() {

    }

    // update (dt) {}

    public iniciaLista() {
        let mensagem;

        this.cliente = cc.find("Web").getComponent(Cliente);
        mensagem = this.cliente.criaJson("Lista Desafios", "");
        this.importantes = cc.find("ValoresImportantes").getComponent(ValoresImportantes);
        this.labelSaldo.string = "Saldo = $" + this.importantes.saldoJogador * 100;

        if (this.importantes.listaDesafios == null) {
            this.cliente.mandarMensagem(JSON.stringify(mensagem), (resposta) => {
                this.desafios = this.criaListaDesafios(resposta);
                this.importantes.listaDesafios = this.desafios;
                this.iniciaDesafios(this.desafios);
            });
        } else {
            this.iniciaDesafios(this.importantes.listaDesafios);
        }
    }


    private iniciaDesafios(listaDesafios: Desafio[]) {
        let listaFacil = this.criaListaDificuldade(listaDesafios, "facil");
        let listaMedio = this.criaListaDificuldade(listaDesafios, "medio");
        let listaDificil = this.criaListaDificuldade(listaDesafios, "dificil");
        let altura = this.primeiroDesafio.y;

        altura = this.organizaListas(listaFacil, altura, true);

        if (this.importantes.medioAberto) {
            this.dificuldadeMedio.active = false;
            altura = this.criarDificuldade(altura, "Médio", "");
            altura = this.organizaListas(listaMedio, altura, false);
            this.dificuldadeDificil.active = true;

            if (this.importantes.dificilAberto) {
                this.dificuldadeDificil.active = false;
                altura = this.criarDificuldade(altura, "Difícil", "");
                altura = this.organizaListas(listaDificil, altura, false);
            }else{
                altura = this.criarDificuldade(altura, "Difícil", "Bloqueado");
            }
        } else {
            altura = this.criarDificuldade(altura, "Médio", "Bloqueado");
        }

        this.node.height = Math.abs(altura) + 25;
    }

    private organizaListas(listaDesafios, altura, primeiraLista) {
        let posicao = altura
            - this.primeiroDesafio.height;

        listaDesafios.sort(this.comparaNomes);

        for (let index = 0; index < listaDesafios.length; index++) {
            const desafio = listaDesafios[index];
            let email;
            let texto;
            let animacao;
            let ok;

            if (index == 0 && primeiraLista) {
                texto = this.primeiroDesafio.getChildByName("Nome Desafio").getComponent(cc.Label);
                texto.string = desafio.nome;
                email = this.primeiroDesafio.getComponent(Email);
                animacao = this.primeiroDesafio.getComponent(cc.Animation);
                animacao.stop();
                animacao.play("desafioHover");
                this.preecheDetalhesDesafio(email, desafio);
                email.desafio = desafio;
                email.ativado = true;
                this.importantes.desafioEscolhido = desafio;
                ok = this.primeiroDesafio.getChildByName("Ok");

                if (desafio.completado) {
                    ok.active = true;
                }
            } else {
                let emailComponent;

                email = cc.instantiate(this.emailPrefab);
                texto = email.getChildByName("Nome Desafio").getComponent(cc.Label);
                emailComponent = email.getComponent(Email);
                email.y = posicao;
                email.x = this.primeiroDesafio.x;
                this.node.addChild(email);
                posicao -= email.height;
                altura -= email.height;
                texto.string = desafio.nome;
                emailComponent.desafio = desafio;
                ok = email.getChildByName("Ok");

                if (desafio.completado) {
                    ok.active = true;
                }
            }
        }

        return altura;
    }

    private criarDificuldade(altura, dificuldade, tipo) {
        let prefabDificuldade;
        let textoDificuldade;
        let labelDificuldade;

        if (tipo == "Bloqueado") {
            if(this.importantes.medioAberto){
                prefabDificuldade = this.dificuldadeDificil;
            }else{
                prefabDificuldade = this.dificuldadeMedio;
            }
        } else {
            prefabDificuldade = cc.instantiate(this.dificuldade);
            this.node.addChild(prefabDificuldade);
        }

        textoDificuldade = prefabDificuldade.getChildByName("textoDificuldade");
        labelDificuldade = textoDificuldade.getComponent(cc.Label);

        altura -= prefabDificuldade.height;
        prefabDificuldade.y = altura;
        labelDificuldade.string = dificuldade + ":";

        return altura;
    }

    private comparaNomes(desafioA, desafioB) {
        var nameA = desafioA.nome.toLowerCase(), nameB = desafioB.nome.toLowerCase();
        if (nameA < nameB) //sort string ascending
            return -1;
        if (nameA > nameB)
            return 1;
        return 0; //default return value (no sorting)
    }

    private preecheDetalhesDesafio(email: Email, desafio: Desafio) {
        email.nomeDesafio.getComponent(cc.Label).string =
            desafio.nome;

        email.tempoDesafio.getComponent(cc.Label).string =
            desafio.tempoInicial + " - " + desafio.tempo;

        email.descricaoDesafio.getComponent(cc.Label).string =
            desafio.descricao;
    }

    private criaListaDesafios(listaDesafios) {
        let novaLista = new Array();

        listaDesafios.forEach(element => {
            let desafio = new Desafio();

            desafio.criarDesafio(JSON.stringify(element));
            novaLista.push(desafio);
        });

        return novaLista;
    }

    private criaListaDificuldade(listaDesafios: Desafio[], dificuldade: string) {
        let novaLista = new Array();

        for (let index = 0; index < listaDesafios.length; index++) {
            const desafio = listaDesafios[index];

            if (desafio.dificuldade == dificuldade) {
                novaLista.push(desafio);
            }
        }

        return novaLista;
    }
}

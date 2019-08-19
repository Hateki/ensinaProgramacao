
const { ccclass, property } = cc._decorator;

@ccclass
export default class Cliente extends cc.Component {

    private ws;
    private naoCarregou = true;
    private callBackServidor;
    public conectou = false;
    public nomeDesafio = "";
    public stringJson = "";

    onLoad() {

        if (this.naoCarregou) {
            let cliente = this;

            cc.game.addPersistRootNode(this.node);

            this.ws = new WebSocket("wss://tcc-ensinaprogramacaoserver.herokuapp.com");

            this.ws.onopen = function (event) {
                console.log("Send Text WS was opened.");
                cliente.conectou = true;
            };

            this.ws.onmessage = (event) => {
                console.log("response text msg: " + event.data);
                this.stringJson = event.data;

                try {
                    this.callBackServidor(JSON.parse(this.stringJson));
                } catch (error) {
                    
                }
            };

            this.ws.onerror = function (event) {
                console.log("Send Text fired an error");
                console.log("Messagem" + event.returnValue);
            };

            this.ws.onclose = function (event) {
                console.log("WebSocket instance closed.");
            };

            this.naoCarregou = false;
        }
    }

    public mandarMensagem(mensagem: string, callback: (resposta) => any) {
        if (this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(mensagem);
            this.callBackServidor = callback;
        }
        else {
            console.log("WebSocket instance wasn't ready...");
        }
    }

    public criaJson(tipoMensagem: string, mensagem: string) {
        if (tipoMensagem == "Resultado Jogador") {
            return {
                "tipoMensagem": tipoMensagem,
                "nomeDesafio": this.nomeDesafio,
                "mensagem": mensagem
            }
        } else {
            return {
                "tipoMensagem": tipoMensagem,
                "mensagem": mensagem
            }
        }
    }

}



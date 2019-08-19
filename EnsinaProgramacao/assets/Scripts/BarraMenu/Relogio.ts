const {ccclass, property} = cc._decorator;

@ccclass
export default class Relogio extends cc.Component {

    private minutos = 0;
    private horas = 0;

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.schedule(this.aumentaTempo,1,cc.macro.REPEAT_FOREVER);
    }

    private aumentaTempo(){
        let relogio = this.getComponent(cc.Label);
        
        if(this.minutos == 59){
            if(this.horas == 23){
                this.horas = 0;
            }else{
                this.horas++;
            }
            this.minutos = 0;
        }else{
            this.minutos++;
        }
    
        if(this.minutos < 10 && this.horas < 10){
            relogio.string = "0"+ this.horas+":0"+this.minutos;
        }else if(this.minutos < 10){
            relogio.string = this.horas+":0"+this.minutos;
        }else if(this.horas < 10){
            relogio.string = "0"+ this.horas+":"+this.minutos;
        }else{
            relogio.string = this.horas+":"+this.minutos;
        }
        
    }

    public pegaValores(valorString:string){
        let passouMinutos = false;
        let horas = "";
        let minutos = "";
        
        for (let index = 0; index < valorString.length; index++) {
            const element = valorString[index];
            
            if(element == ":"){
                passouMinutos = true;
            }else if(passouMinutos){
                minutos += element;
            }else{
                horas += element;
            }
        }

        this.horas = parseInt(horas);
        this.minutos = parseInt(minutos);
    }

    //start () {}

    // update (dt) {}
}

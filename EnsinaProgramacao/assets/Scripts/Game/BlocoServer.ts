import Bloco from "./Bloco";

const { ccclass, property } = cc._decorator;

/**
 * Classe responsável por representar um bloco de código
 * que o jogador pode manipular.
 */
@ccclass
export default class BlocoServer implements Bloco{
    id: number;
    valor: string;
    tipo: number;
    blocosFilhos: BlocoServer[];

    constructor(id: number, valor: string, tipo: number) {
        this.id = id;
        this.valor = valor;
        this.tipo = tipo;
    }

   
}

export { BlocoServer }
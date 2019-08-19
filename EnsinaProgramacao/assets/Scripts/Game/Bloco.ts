/**
 * Classe responsável por representar um bloco de código
 * que o jogador pode manipular.
 */

export default interface Bloco{
    id: number;
    valor: string;
    tipo: number;
    blocosFilhos: Bloco[];
   
}

export { Bloco }
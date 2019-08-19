const {ccclass, property} = cc._decorator;

/**
 * Classe de sprite customizada para ter as propriedades
 * de lagura e altura.
 */
@ccclass
export default class SpriteCustom extends cc.Sprite {

    @property
    largura: number = 0;

    @property
    altura: number = 0;
}
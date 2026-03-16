import { Enum } from "cc";

export enum ReelSymbolTypeEnum {
    A = 1,
    J = 2,
    Q = 3,
    K = 4,
    P3 = 7,
    P4 = 8,
    Wild = 9,
    Jackpot = 10, // P2
    Scatter = 11,
    Power = 12,    // P1
}
Enum(ReelSymbolTypeEnum);

export enum GameState {
    BaseGame = 1,
    FreeGame = 2,
    BuyBonus = 3,
    PromoGame = 4
}

export const FeatureSocketEvent = {
    BUY_FREESPIN: 'buyfreespin'
}
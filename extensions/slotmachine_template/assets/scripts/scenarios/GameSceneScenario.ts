import { _decorator, Component, Node, tween } from 'cc';
import { scenario, ScenarioBlock } from 'db://cocoeywa/scripts/blocks/ScenarioBlock';
import { IGameData } from '../types/GameDataType';
import { IGameView } from '../types/GameViewType';
import { SlotMachineState } from '../constants/GameState';
import { resolve } from 'path';
import { GameInfoResponseType, GameInfoResultType } from '../types/ServiceDataType';
import { GameState } from '../constants/GameSetting';
const { ccclass, property } = _decorator;

@ccclass('GameSceneScenario')
export class GameSceneScenario extends ScenarioBlock<IGameData, IGameView> {
    
    @scenario.data
    stake:number = 0

    @scenario.data
    gameState:number = GameState.BaseGame

    @scenario.data
    freeSpins:number = 0


    // @scenario.state(SlotMachineState.GET_GAME_INFO)
    // protected setupGameSate(){
    //     const gameInfo:GameInfoResponseType = this.data.gameInfo;
    //     if(gameInfo){
    //         const result:GameInfoResultType = gameInfo.result;
    //         if(result && result.pending){
    //             this.freeSpins = result.pending?.freeSpins;
    //             this.gameState = result.pending?.gameState;
    //             // this.stake = result.pending?.stake;

    //             if(this.gameState == GameState.FreeGame){
    //                 this.stake = 0;
    //                 this.intent(SlotMachineState.SPIN_CLICK);
    //             }
    //         }
    //     }
        
    // }

    @scenario.state(SlotMachineState.SPIN_CLICK)
    protected spinClick(){
        // Chuyen sang state request
        this.spinningRound(SlotMachineState.REQUEST_BET);
    }

    @scenario.state(SlotMachineState.BUY_BONUS_CLICK)
    protected buyBonusClick(){
        // show bonus popup
        this.intent(SlotMachineState.SHOW_BONUS_POPUP);// khong co bo qua
        // request bonus and spin        
        this.spinningRound(SlotMachineState.REQUEST_BONUS);

    }

    protected spinningRound(requestState:string){
        this.intent(SlotMachineState.SPINNING, requestState);
        this.intent(SlotMachineState.STOP_SPINNING);
        // 
        this.intent(SlotMachineState.SHOW_RESULT);
        // 
        
        this.intent(SlotMachineState.READY_TO_PLAY);
    }

    protected start(): void {
        const gameInfo:GameInfoResponseType = this.data.gameInfo;
        if(gameInfo){
            const result:GameInfoResultType = gameInfo.result;
            if(result && result.pending){
                this.freeSpins = result.pending?.freeSpins;
                this.gameState = result.pending?.gameState;
                // this.stake = result.pending?.stake;
                switch(this.gameState){
                    case GameState.FreeGame:
                    case GameState.BuyBonus:
                        this.stake = 0;
                        scenario.play(SlotMachineState.SPIN_CLICK);
                        break;
                }
            }
        }
    }
    
}



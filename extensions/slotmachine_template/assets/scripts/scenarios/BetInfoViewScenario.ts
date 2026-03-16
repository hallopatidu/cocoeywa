import { _decorator, Component, Node } from 'cc';
import { IGameView } from '../types/GameViewType';
import { IGameData } from '../types/GameDataType';
import { scenario, ScenarioBlock } from 'db://cocoeywa/scripts/blocks/ScenarioBlock';
import { SlotMachineState } from '../constants/GameState';
import { BetResponseResultType, BetResponseType, GameInfoResponseType, GameInfoResultType } from '../types/ServiceDataType';
const { ccclass, property } = _decorator;

@ccclass('BetInfoViewScenario')
export class BetInfoViewScenario extends ScenarioBlock<IGameData, IGameView> {
    
    @scenario.state(SlotMachineState.SPIN_CLICK)
    protected prepareSpinning(){
        this.data.winAmount = 0;
        this.intent(this.view.BetInfoView.updateLabels)
    }

    @scenario.state(SlotMachineState.CHANGE_BET)
    protected onChangeBetState(){
        this.intent(this.view.BetInfoView.updateLabels)
    }
    
    @scenario.state(SlotMachineState.READY_TO_PLAY)
    protected updateBetInfo(){
        const betResponse:BetResponseType = this.data.betResponse;
        const result:BetResponseResultType = betResponse.result;
        this.data.balance = result.balance;
        this.data.winAmount = result.accumulatedWinAmount;
        this.data.stake = result.stake;
        this.intent(this.view.BetInfoView.updateLabels)
    }

}



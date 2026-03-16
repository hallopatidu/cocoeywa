import { _decorator, Component, Node } from 'cc';
import { scenario, ScenarioBlock } from 'db://cocoeywa/scripts/blocks/ScenarioBlock';
import { IGameData } from '../types/GameDataType';
import { IGameView } from '../types/GameViewType';
import { SlotMachineState } from '../constants/GameState';
const { ccclass, property } = _decorator;

@ccclass('ControlViewScenario')
export class ControlViewScenario extends ScenarioBlock<IGameData, IGameView> {
    
    @scenario.state(SlotMachineState.SPIN_CLICK)
    spinningState(){
        this.intent(this.view.ControlView.showStopState);
    }
    
    @scenario.state({key:SlotMachineState.READY_TO_PLAY})
    readyToSpinState(){
        this.intent(this.view.ControlView.showReadyState);
    }




}



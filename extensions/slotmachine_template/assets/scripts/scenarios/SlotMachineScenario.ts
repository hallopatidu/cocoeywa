import { _decorator, Component, log, Node } from 'cc';
import { scenario, ScenarioBlock } from 'db://cocoeywa/scripts/blocks/ScenarioBlock';
import { IGameData } from '../types/GameDataType';
import { IGameView } from '../types/GameViewType';
import { SlotMachineState } from '../constants/GameState';
import { BetResponseResultType, BetResponseType, GameInfoResponseType, SpinViewResult } from '../types/ServiceDataType';
import { ReelSymbolTypeEnum } from '../constants/GameSetting';
const { ccclass, property } = _decorator;

@ccclass('SlotMachineScenario')
export class SlotMachineScenario extends ScenarioBlock<IGameData, IGameView> {
    
    @scenario.state(SlotMachineState.SPINNING)
    protected startSpinning(){
        log('token :: ' , this.view.SlotMachineView.startSpinning);
        this.intent(this.view.SlotMachineView.startSpinning);
    }
    
    @scenario.state(SlotMachineState.STOP_SPINNING)
    protected stopSpinning(){
        const betResponse:BetResponseType = this.data.betResponse;
        const result:BetResponseResultType = betResponse.result;
        const viewResult:SpinViewResult = result.result;
        // viewResult.rawViews;
        // viewResult.views;
        // Tinh tam thoi.
        if(!viewResult.views?.length){
            return;
        }
        const symbolTypes:number[] = viewResult.views[0].value;
        const undefinedIndex:number = symbolTypes.findIndex((value:number)=>value == -1)
        let randomNumOfScatters:number = (undefinedIndex !== -1) ? Math.floor(Math.random()*5) + 2 : -1;// from 2 to 4
        let matrix:number[] = [];
        viewResult.views.forEach((item:{id:number, value:number[]}, index)=>{
            if(randomNumOfScatters > 0){
                item.value
                const symbolTypes:number[] = item.value;
                const random:number = Math.floor(Math.random()*symbolTypes.length);
                item.value[random] = ReelSymbolTypeEnum.Scatter;
                randomNumOfScatters--;
            }        
            matrix = matrix.concat(item.value);
        })
        this.data.SlotMachineView.SlotMachineView.slotMachineMatrix = matrix;
        this.intent(this.view.SlotMachineView.stopSpinning);
    }

    @scenario.state(SlotMachineState.SUDDEN_STOP_SPINNING)
    protected suddenStop(){
        this.intent(this.view.SlotMachineView.suddenStopSpinning);
    }



}



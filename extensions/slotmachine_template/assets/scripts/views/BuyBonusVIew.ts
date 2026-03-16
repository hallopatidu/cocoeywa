import { _decorator, Component, Node } from 'cc';
import { scenario } from 'db://cocoeywa/scripts/blocks/ScenarioBlock';
import { SlotMachineState } from '../constants/GameState';
const { ccclass, property } = _decorator;

@ccclass('BuyBonusVIew')
export class BuyBonusVIew extends Component {
    
    onClickBuyBonus(){
        scenario.play(SlotMachineState.BUY_BONUS_CLICK)
    }

}



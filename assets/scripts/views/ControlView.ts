import { _decorator, Button, Component, Node } from 'cc';
import { scenario } from 'db://cocoeywa/scripts/blocks/ScenarioBlock';
import { SlotMachineState } from '../constants/GameState';
import { GameInfoResponseType, GameInfoResultType } from '../types/ServiceDataType';
const { ccclass, property } = _decorator;

@ccclass('ControlView')
export class ControlView extends Component {

    // ---------- Traserval to Data Model --------
    @scenario.data
    gameInfo:GameInfoResponseType = undefined;

    @scenario.data    
    balance:number = 1

    @scenario.data    
    stake:number = 1;

    @scenario.data
    winAmount:number = 1;

    @scenario.data
    isAutoPlay:boolean = false

    // ------------------

    @property({
        type:Button,
        group:'Spin Button'
    })
    normalButton:Button = null
    @property({
        type:Button,
        group:'Spin Button'
    })
    stopButton:Button = null
    @property({
        type:Button,
        group:'Spin Button'
    })
    freespinButton:Button = null;

    @property({
        type:Button,
        group:'Bet Button'
    })
    minusButton:Button = null;

    @property({
        type:Button,
        group:'Bet Button'
    })
    plusButton:Button = null;
    
    @property({
        type:Button,
        group:'Feature Button'
    })
    turboButton:Button = null;

    @property({
        type:Button,
        group:'Feature Button'
    })
    autoButton:Button = null;

    private _denominations:number[] = null;
    private _betAmount:number = 0

    @scenario.action
    protected async showReadyState(){
        this.normalButton.node.active = true;
        this.stopButton.node.active = false;
        this.freespinButton.node.active = false
        // 
        this.normalButton.interactable = true
        this.stopButton.interactable = false
        this.freespinButton.interactable = false
        // 
        this.updateBetButtonState();
    }
    
    @scenario.action
    protected async showStopState(){
        this.normalButton.node.active = false;
        this.stopButton.node.active = true;
        this.freespinButton.node.active = false
        // 
        this.normalButton.interactable = false
        this.stopButton.interactable = true
        this.freespinButton.interactable = false
        // 
        this.minusButton.interactable = false
        this.plusButton.interactable = false
        
    }
    
    @scenario.action
    protected async showFreeSpinState(){
        this.normalButton.node.active = false;
        this.stopButton.node.active = false;
        this.freespinButton.node.active = true
        // 
        this.normalButton.interactable = false
        this.stopButton.interactable = false
        this.freespinButton.interactable = true
        // 
        this.minusButton.interactable = false
        this.plusButton.interactable = false
    }

    protected start(): void {
        const gameInfo:GameInfoResponseType = this.gameInfo;
        if(gameInfo){
            const result:GameInfoResultType = gameInfo.result;
            if(result){
                this.balance = result.balance;
                const defaultBetLevel:number = result.settings.defaultBetLevel;
                this._denominations = result.settings.denominations.slice();
                this.stake = this._betAmount = this._denominations[defaultBetLevel];
                this.winAmount = 0;
            }
        }
        
    }

    protected onClickSpinButton(){
        scenario.play(SlotMachineState.SPIN_CLICK)
    }
    
    protected onClickStopButton(){
        scenario.play(SlotMachineState.SUDDEN_STOP_SPINNING)
    }

    protected onClickMinusButton(){
        const nextIndex:number = this.getNextStakeIndex(this._betAmount, -1);
        this.stake = this._betAmount = this._denominations[nextIndex];
        this.updateBetButtonState();
    }
    
    protected onClickPlusButton(){        
        const nextIndex:number = this.getNextStakeIndex(this._betAmount, 1);
        this.stake = this._betAmount = this._denominations[nextIndex];
        this.updateBetButtonState();
    }


    // ---------
    private updateBetButtonState(stake:number = this._betAmount){
        const maxIndex:number = this._denominations.length - 1;
        const minIndex:number = 0;
        const stakeIndex:number = this._denominations.findIndex((childeStake:number)=> stake === childeStake);
        this.minusButton.interactable = !(stakeIndex == minIndex);
        this.plusButton.interactable = !(stakeIndex == maxIndex);      
        scenario.play(SlotMachineState.CHANGE_BET)  
    }

    private getNextStakeIndex(stake:number, direction:-1|0|1):number{
        const maxIndex:number = this._denominations.length - 1;
        const minIndex:number = 0;
        const curIndex:number = this._denominations.findIndex((childeStake:number)=> stake === childeStake);
        let nextIndex:number = curIndex + direction;
        nextIndex = direction < 0 ? Math.max(nextIndex, minIndex) : Math.min(nextIndex, maxIndex);
        return nextIndex;
    }

}



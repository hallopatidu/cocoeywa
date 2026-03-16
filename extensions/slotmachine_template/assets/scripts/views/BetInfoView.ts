import { _decorator, Component, Label, Node } from 'cc';
import { scenario } from 'db://cocoeywa/scripts/blocks/ScenarioBlock';
import { GameInfoResponseType, GameInfoResultType } from '../types/ServiceDataType';
const { ccclass, property } = _decorator;

@ccclass('BetInfoView')
export class BetInfoView extends Component {

    @scenario.data
    gameInfo:GameInfoResponseType;
    
    @scenario.data
    balance:number = 1

    @scenario.data
    stake:number = 1;

    @scenario.data
    winAmount:number = 1

    @property({type:Label})
    balanceValueLabel:Label = null;
    
    @property({type:Label})
    betValueLabel:Label = null;
    
    @property({type:Label})
    winValueLabel:Label = null;

    protected start(): void {
        const gameInfo:GameInfoResponseType = this.gameInfo;
        if(gameInfo){
            const result:GameInfoResultType = gameInfo.result;
            if(result){
                this.balance = result.balance;
                const defaultBetLevel:number = result.settings.defaultBetLevel;
                this.stake = result.settings.denominations[defaultBetLevel];
                this.winAmount = 0;
                this.updateLabels()
            }
        }
        
    }

    @scenario.action
    protected async updateLabels(){
        this.balanceValueLabel.string = this.balance.toString();
        this.betValueLabel.string = this.stake.toString();
        this.winValueLabel.string = this.winAmount.toString();
    }

}



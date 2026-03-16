import { _decorator, log } from 'cc';
import { scenario, ScenarioBlock } from 'db://cocoeywa/scripts/blocks/ScenarioBlock';
import { IGameData } from '../types/GameDataType';
import { IGameView } from '../types/GameViewType';
import { SlotMachineState } from '../constants/GameState';
import { BetRequestPayload, BetResponseResultType, FeaturePayloadType, FreeSpinPackageType, GameInfoResponseType, GameInfoResultType } from '../types/ServiceDataType';
import { FEATURE_SOCKET_EVENT } from '../constants/GameServiceEvent';


const { ccclass, property } = _decorator;

@ccclass('NetworkScenario')
export class NetworkScenario extends ScenarioBlock<IGameData, IGameView> {

    @scenario.state(SlotMachineState.REQUEST_BET)
    protected requestBet(){
        // Chuan bi payload
        const gameInfo:GameInfoResponseType = this.data.gameInfo;
        if(!gameInfo) throw new Error('Khong co game info !');
        const result:GameInfoResultType = gameInfo.result;
        if(!this.data.stake){
            const defaultBetLevel:number = result.settings.defaultBetLevel;
            this.data.stake = result.settings.denominations[defaultBetLevel];
        }
        const stake:number = this.data.stake;
        this.data.betRequestPayLoad = {
            info:{
                stake:stake,
                // betLines:
            },
            time: (new Date()).getTime()
        } as BetRequestPayload
        // 
        log('BET WITH STAKE ' , stake)
        // Gui request len signalR
        this.intent(this.view.GameServiceNetwork.requestBet);
    }
    
    @scenario.state(SlotMachineState.BUY_BONUS_CLICK)
    protected requestBuyBonus(){
        // Chuan bi payload
        const gameInfo:GameInfoResponseType = this.data.gameInfo;
        if(!gameInfo) throw new Error('Khong co game info !');
        const result:GameInfoResultType = gameInfo.result;
        if(!this.data.stake){
            const defaultBetLevel:number = result.settings.defaultBetLevel;
            this.data.stake = result.settings.denominations[defaultBetLevel];
        }
        // result.betlines
        // const denomination:number[] = result.settings.denominations;
        const freespinPackage:FreeSpinPackageType = result.freeSpinPackages[0]
        const bonusStake:number = this.data.stake;//*freespinPackage.price;
        this.data.featurePayLoad = {
            event:FEATURE_SOCKET_EVENT.BUY_FREESPIN,
            info:{
                stake:bonusStake,
                packageName:freespinPackage.name,
                tryLuckySpin: false
                // betLines:
            }
        } as FeaturePayloadType
        // 
        log('BUY BONUS WITH STAKE ' , bonusStake, ' -package name: ', freespinPackage.name)
        // Gui request len signalR
        this.intent(this.view.GameServiceNetwork.requestFeature);
    }
    

}



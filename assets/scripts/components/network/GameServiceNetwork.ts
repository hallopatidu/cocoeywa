import { _decorator, Component, director, error, js, log, Node, NodeEventType, warn } from 'cc';
import { SignalRNetwork } from './SignalRNetwork';
import { scenario } from 'db://cocoeywa/scripts/blocks/ScenarioBlock';
import { utils } from 'db://cocoeywa/scripts/definition/cocoeywa.utils';
import { BetRequestPayload, BetResponseType, FeaturePayloadType, FeatureResponseType, GameInfoResponseType } from '../../types/ServiceDataType';
import { SlotMachineState } from '../../constants/GameState';


// import { GameInfoServiceType } from './types/ServiceDataType';

const { ccclass, property } = _decorator;

const SOCKET_EVENT = {
  //sys event---------
  CONNECTION: "connection",
  CONNECT: "connect",
  DISCONNECT: "disconnect",
  RECONNECTED: "reconnected",
  CONNECT_ERROR: "connect_error",
  RECONNECTING: "reconnecting",
  ONCLOSE: "onclose",

  UPDATE_COIN: 'updatecoin',
  GAME_INFO: 'gameinfo',
  LOGIN: 'login',
  BET: 'bet',
  START_PROMO: 'startPromo',
  CASH_OUT: 'cashout',
  BALANCE: 'balance',
  PING: 'ping',
  PONG: 'pong',
};

@ccclass('GameServiceNetwork')
export class GameServiceNetwork extends Component {

    @property(SignalRNetwork)
    signalR:SignalRNetwork = null;    

    // Data store in Scene Root Node.
    @scenario.data
    protected gameInfo:GameInfoResponseType = Object.create(null);
    
    @scenario.data
    protected betRequestPayLoad:BetRequestPayload;

    @scenario.data
    protected betResponse:BetResponseType;

    @scenario.data
    protected featurePayLoad:FeaturePayloadType;

    @scenario.data
    protected featureResponse:FeatureResponseType

    protected onLoad(): void {        
        director.addPersistRootNode(this.node);
        log('Call from onLoad !!!!!!')
    }

    protected onDestroy(): void {
        director.removePersistRootNode(this.node);        
        this.signalR = null;
    }

    protected start(): void {
        // 
        scenario.play(SlotMachineState.INIT_GAME);
    }

    

    // protected update(dt: number): void {
    //     if(this.gameInfo){
    //         log('----------Iam existed !-----------')
    //     }
    // }
    
    // ------------------------ ACTION ------------------------

    /**
     * 
     * @returns 
     */    
    @scenario.action
    protected async joinGameServer(){
        log('--------- join game server --------')
        await this.signalR?.connect();
        const response = await this.signalR.asyncInvoke(SOCKET_EVENT.GAME_INFO);
        if(!response) return;
        if(response instanceof Error){
            error('Timeout ' + response)
        }else{
            const gameInfo:GameInfoResponseType = JSON.parse(response as string);
            log('Signal response : ' + response);
            log(utils.generateTypes(JSON.parse(response as string), 'GameInfoServiceType'))
            this.gameInfo = gameInfo;            
        }        
    }

    @scenario.action
    protected async requestBet(){
        if(this.betRequestPayLoad){
            const response:string = await this.signalR.asyncInvoke<string>(SOCKET_EVENT.BET, this.betRequestPayLoad);
            this.betResponse = JSON.parse(response)
        }

    }
    
    @scenario.action
    protected async requestFeature(){
        //NetworkEvent.BUY_FREESPIN
        if(this.featurePayLoad && this.featurePayLoad.event){
            const payload:FeaturePayloadType = this.featurePayLoad;
            const event:string = payload.event;
            delete payload.event;
            const response:string = await this.signalR.asyncInvoke<string>(event, payload);
            this.betResponse= JSON.parse(response);
        }
    }
    
}



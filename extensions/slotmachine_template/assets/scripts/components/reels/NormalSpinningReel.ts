import { _decorator, CCInteger, Component, log, Node, Tween, tween, UITransform } from 'cc';
import { ReelLayout } from './ReelLayout';
import { ReelLayoutState } from './constants/ReelConstants';
import { ReelSymbol } from '../symbols/ReelSymbol';
import { ReelSymbolTypeEnum } from '../../constants/GameSetting';
import { resolve } from 'path';
const { ccclass, property, requireComponent, executeInEditMode } = _decorator;

@ccclass('NormalSpinningReel')
@requireComponent(ReelLayout)
@executeInEditMode(true)
export class NormalSpinningReel extends Component {
    
    @property
    maxSpeed:number = 1300;

    @property
    acceleration:number = 400;

    @property
    delayTime:number = 0.2 //second

    @property
    accelerationTime:number = 0.5 //second

    
    private _reelLayout: ReelLayout;
    protected get reelLayout(): ReelLayout {
        if(!this._reelLayout){
            this._reelLayout = this.getComponent(ReelLayout);
        }
        return this._reelLayout;
    }

    public currentSpeed: number = 0;

    private _isStopped:boolean = false;
    private _isSuddenStopped:boolean = false;
    private _countSymbol:number = 0;
    private symbolTypesInView:number[];
    private _waitToFinish:Function = null

    // -----------------
    protected onLoad(): void {
        this.node.on(ReelLayout.Event.RESET_SYMBOL, this.onResetSymbol.bind(this));
    }

    protected onDestroy(): void {
        this.node.off(ReelLayout.Event.RESET_SYMBOL);
    }

    protected update(dt: number): void {
        // const state:ReelLayoutState = this.reelLayout.getState();
        // if(state === ReelLayoutState.STOP){        
        // }
        this.reelLayout.offset += this.currentSpeed * dt;
    }
    

    // protected start(): void {
    //     setTimeout(()=> this.play(), 1000)        
    //     setTimeout(()=> this.stop([ReelSymbolTypeEnum.P4, ReelSymbolTypeEnum.K, ReelSymbolTypeEnum.J]), 8000)
    // }

    async play(){
        if(this._waitToFinish) {
            return;
        }
        if(this.getState() !== ReelLayoutState.READY){
            return;
        }
        // 
        await new Promise((resolve:Function)=>{
            tween<NormalSpinningReel>(this)
            .call(()=>{
                this.reelLayout.setState(ReelLayoutState.START);
            }) 
            .delay(this.reelLayout.reelId*this.delayTime)
            .call(()=>{
                this.reelLayout.setState(ReelLayoutState.ACCELERATION);
            }) 
            .to(this.accelerationTime, {currentSpeed: this.maxSpeed})
            .call((target:NormalSpinningReel)=>{
                target.setState(ReelLayoutState.SPINNING);
                resolve();
            })        
            .start();
        })
        
    }

    async stop(symbolTypes?:number[]){
        if(this._waitToFinish) {
            return
        }
        if(symbolTypes && symbolTypes.length){
            this.input(symbolTypes);
        }
        if(this.getState() === ReelLayoutState.SPINNING){
            this._isStopped = true
        }else{
            return;
        }
        await new Promise((resolve:Function)=>{
            this._waitToFinish = resolve;
        })
        this.setState(ReelLayoutState.READY);
    }

    async suddenStop(symbolTypes?:number[]){
        if(this.getState() > ReelLayoutState.START){
            this._isSuddenStopped = true;
            await this.stop(symbolTypes);
            this._isSuddenStopped = false;
        }
    }

    input(symbolTypes:number[]){
        if(symbolTypes.length >= (this.reelLayout.activedChildrenLength - 1)){    // -1 do co 1 symbol fake
            // Tam thoi khi chua co scatters state
            // const undefinedIndex:number = symbolTypes.findIndex((value:number)=>value == -1)
            // if(undefinedIndex !== -1){
            //     symbolTypes[random] = ReelSymbolTypeEnum.Scatter;
            // }
            // 
            this.symbolTypesInView = symbolTypes;
        }
    }

    getState():ReelLayoutState{
        return this.reelLayout.getState()
    }

    // -----------------  ----------------- 

    protected setState(state:ReelLayoutState){
        this.reelLayout.setState(state);        
    }

    

    /**
     * Mỗi lần symbol quay lên đầu là một lần check chuyển state
     * @param symbolNode 
     */
    protected onResetSymbol(symbolNode:Node){
        if(this._isStopped){
            const state:ReelLayoutState = this.reelLayout.getState();
            switch(state){
                case ReelLayoutState.SPINNING:
                    this.onDecelerationSpinning();                    
                    break;
                case ReelLayoutState.STOP: 
                    break;

                case ReelLayoutState.FINISH:                    
                    const symbol:ReelSymbol = symbolNode.getComponent(ReelSymbol);
                    this.onUpdateEachSymbolResult(symbol);
                    this.checkFinishSpinning();
                    break;

            }
        }
    }

    protected onUpdateEachSymbolResult(symbol:ReelSymbol){  
        const inputType:ReelSymbolTypeEnum = this.symbolTypesInView.pop();
        symbol.input(inputType);
    }

    protected onDecelerationSpinning(){
        this.setState(ReelLayoutState.STOP);
        if(this._isSuddenStopped){
            this.currentSpeed = this.maxSpeed*2;
            this.setState(ReelLayoutState.FINISH);
            return
        }
        const decelerationTween:Tween<NormalSpinningReel> = tween<NormalSpinningReel>(this) 
            .delay(this.reelLayout.reelId*this.delayTime)
            .call(()=>{

            })
            .to(this.accelerationTime, {currentSpeed: this.currentSpeed*0.5},{
                // onUpdate(target:NormalSpinningReel, ratio?:number){
                //     if(this._isSuddenStopped){
                //         decelerationTween.stop();
                //         this.setState(ReelLayoutState.FINISH);
                //     }
                // }
            })
            .call((target:NormalSpinningReel)=>{
                this.setState(ReelLayoutState.FINISH);
            })
            .start()
    }

    protected checkFinishSpinning(){
        const activedChildrenLength: number = this.reelLayout.activedChildrenLength;
        this._countSymbol+=1;
        if(this._countSymbol == activedChildrenLength){
            this.currentSpeed = 0;
            this._countSymbol = 0;
            this._isStopped = false;
            // this.setState(ReelLayoutState.FINISH);
            tween<ReelLayout>(this.reelLayout) 
            .set({offset:0})
            .to(0.1, {offset: -8})
            .to(0.1, {offset: 0})
            .call((target:ReelLayout)=>{
                this.setState(ReelLayoutState.FINISH);
                if(this._waitToFinish){
                    this._waitToFinish();
                    this._waitToFinish = null;
                }
            })
            .start()
        }
    }
}



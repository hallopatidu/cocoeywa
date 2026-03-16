import { _decorator, Component, log, Node, tween } from 'cc';
import { NormalSpinningReel } from '../components/reels/NormalSpinningReel';
import { scenario } from 'db://cocoeywa/scripts/blocks/ScenarioBlock';
import { ReelLayoutState } from '../components/reels/constants/ReelConstants';
import { resolve } from 'path';
import { GameInfoResponseType, GameInfoResultType } from '../types/ServiceDataType';
import { GameState } from '../constants/GameSetting';
const { ccclass, property } = _decorator;

@ccclass('SlotMachineView')
export class SlotMachineView extends Component {

    @scenario.data
    gameInfo:GameInfoResponseType = null;

    @scenario.data
    private slotMachineMatrix: number[] = [];
   

    // --------------------

    @property
    columns:number = 5
    @property
    rows:number = 3

    protected freeSpins:number = 0;
    protected gameState:GameState = GameState.BaseGame;
    protected normalSpinningReels:NormalSpinningReel[] = [];

    protected onLoad(): void {
        this.normalSpinningReels = this.getComponentsInChildren(NormalSpinningReel);
    }

    // protected start(): void {
    //     const gameInfo:GameInfoResponseType = this.gameInfo;
    //     if(gameInfo){
    //         const result:GameInfoResultType = gameInfo.result;
    //         if(result && result.pending){
    //             this.freeSpins = result.pending?.freeSpins;
    //             this.gameState = result.pending?.gameState;
    //             // this.stake = result.pending?.stake;

    //         }
    //     }
    // }

    @scenario.action
    protected async startSpinning(){
        const spinningPromises:Promise<void>[] = []
        this.normalSpinningReels.forEach((reel:NormalSpinningReel)=>{
            spinningPromises.push(reel.play())
        })
        await Promise.all(spinningPromises);
        await this.continueSpinning();
    }

    @scenario.action
    protected async stopSpinning(){
        const numOfCols:number = this.normalSpinningReels.length;
        log('Raw matrix: ' , this.slotMachineMatrix)
        const reelDatas:number[][] = this.splitIntoReelDatas(this.slotMachineMatrix);
        reelDatas.forEach((symbolTypes:number[], index:number)=>{
            const reel:NormalSpinningReel = this.normalSpinningReels[index]
            reel.input(symbolTypes.slice());
        })
        
        let stopPromises:Promise<void>[] = []
        this.normalSpinningReels.forEach((reel:NormalSpinningReel)=>{
            stopPromises.push(reel.stop())
        })
        this._waitForSpinning && this._waitForSpinning();
        await Promise.all(stopPromises);
    }

    @scenario.action
    protected async suddenStopSpinning(){
        const foundId:number = this.normalSpinningReels.findIndex((reel:NormalSpinningReel)=>{
            const reelState:ReelLayoutState = reel.getState();
            return reelState <= ReelLayoutState.ACCELERATION
        })
        if(foundId !== -1){
            return
        }
        let stopPromises:Promise<void>[] = []
        this.normalSpinningReels.forEach((reel:NormalSpinningReel)=>{
            stopPromises.push(reel.suddenStop())
        })
        this._waitForSpinning && this._waitForSpinning();
        await Promise.all(stopPromises);
    }

    // ------------
    private _waitForSpinning:Function = null;
    protected async continueSpinning(){
        await new Promise<void>((resolve:Function)=>{
            if(!this._waitForSpinning){
                this._waitForSpinning = ()=>{
                    this._waitForSpinning = null;
                    resolve();
                }
                tween(this).delay(2).call(()=>resolve()).start();
            }
        })
    }

    /**
     * 
     * @param arr 
     * @returns 
     */
    private splitIntoReelDatas(arr: number[]): number[][] { 
        const numOfElements:number = this.columns*this.rows;
        if (arr.length !== numOfElements) { 
            throw new Error(`Mảng phải có đúng ${numOfElements} phần tử`);
        } 
        const chunkSize = this.rows;
        const result: number[][] = [];
        for (let i = 0; i < arr.length; i += chunkSize) {
            result.push(arr.slice(i, i + chunkSize));
            // this.normalSpinningReels;
        }
        return result; 
    }

}



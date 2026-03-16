import { _decorator, assetManager, Button, Component, director, error, isValid, Label, log, Node, ProgressBar, Scene, SceneAsset, tween, Tween, warn } from 'cc';
import { scenario } from 'db://cocoeywa/scripts/blocks/ScenarioBlock';
import { utils } from 'db://cocoeywa/scripts/definition/cocoeywa.utils';
import { SlotMachineState } from '../constants/GameState';

const { ccclass, property } = _decorator;

@ccclass('GameEntryView')
export class GameEntryView extends Component {
    
    @property
    nextScene:string = 'GameScene'

    @property(ProgressBar)
    progressBar:ProgressBar = null;

    @property(Button)
    startButton:Button = null;

    @property(Label)
    progressLabel:Label = null;

    @property
    startPercent:number = 0.3;
    
    @property
    maxPercent:number = 0.7;

    @property
    autoFinishTime:number = 10;

    protected defaultLabelValue:string;

    protected nextSceneAsset:SceneAsset = null;

    public get progress() {
        return this.progressBar.progress;
    }
    public set progress(value:number) {
        if (this.progressBar && this.progressBar.progress < value) {
            this.progressBar.progress = value;
            this.progressLabel.string = utils.replaceParameters(this.defaultLabelValue, {percent:Math.floor(value*100)})
        }
    }

    private autoRunTween:Tween;

    protected onLoad(): void {
        this.progressBar.progress = 0.3;
        this.defaultLabelValue = this.progressLabel.string;
    }

    // async start() {
    //     if(this.enabled){
    //         const scene:SceneAsset = await this.startLoadingScene();            
    //         log('LOAD SCENE COMPLETES');
    //         await this.showStartButton();
    //         log('JUMP TO NEW SCENE !');
    //         director.runScene(scene);
    //     }else{
    //         warn('Game Entry View is disable !')
    //     }
    // }



    @scenario.action
    protected async startLoadingScene():Promise<SceneAsset>{
        this.nextSceneAsset = await new Promise<SceneAsset>((resolve:Function)=>{
            const bundle = assetManager.bundles.find(bundle => !!bundle.getSceneInfo(this.nextScene));
            if(bundle){
                bundle.loadScene(this.nextScene, {}, (numberOfLoadedAssets:number, totalAssets:number) => {
                    if (totalAssets > 0) {
                        // 
                        this.progress = this.startPercent + (numberOfLoadedAssets / totalAssets)*this.maxPercent;
                    }else{
                        throw new Error('total assets is zero !');
                    }
                }, (error:Error, scene:SceneAsset) => {
                    if (error) {
                        throw new Error(`Scene "${this.nextScene}" loaded fail !`)
                    } else {
                        this.autoFinish(this.autoFinishTime, () => resolve(scene));
                    }
                });
            }else{
                throw new Error(`Scene "${this.nextScene}" do not include in embed bundles !`)
            }
        })
        return this.nextSceneAsset
    }

    @scenario.action
    protected async showStartButton(){
        if(!this.startButton) {
            error('Cannot reference to start button !')
        }
        if( !isValid(this.startButton.node) ){
            error('wait for start button node validate !')
        }
        this.progressBar.node.active = false;
        this.startButton.node.active = true;
        this.startButton.interactable = false;
        await new Promise((resole:Function)=>{
            this.startButton.interactable = true;
            this.startButton?.node.on(Button.EventType.CLICK, ()=>{
                this.startButton?.node.off(Button.EventType.CLICK);
                resole();
            })
        })
        scenario.play(SlotMachineState.JOIN_GAME);
    }
    
    @scenario.action
    protected jumpToNextScene(){
        if(this.nextSceneAsset){
            director.runScene(this.nextSceneAsset);
        }
    }

    // -----------------------------

    /**
     * 
     * @param time 
     * @param callback 
     */
    private autoFinish(time:number, callback:Function) {
        log('--------- auto finish ----------:: ' + this.progress)
        if (this.autoRunTween) this.autoRunTween.stop();
        this.autoRunTween = tween(this);
        this.autoRunTween
        .to(time, { progress: 1 })
        .call(() => {
            this.progress = 1;
            callback && callback();
            this.autoRunTween.stop();
            this.autoRunTween = null;
        })
        .start();
    }



}



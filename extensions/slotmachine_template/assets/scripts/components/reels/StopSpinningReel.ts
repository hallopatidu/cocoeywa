import { _decorator, Component, Node } from 'cc';
import { ReelLayout } from './ReelLayout';
import { ReelLayoutState } from './constants/ReelConstants';
const { ccclass, property } = _decorator;

@ccclass('StopSpinningReel')
export class StopSpinningReel extends Component {

    static readonly Event = {
        STOP_SPINNING:'stopspinningreel_stop_spinning'
    }

    protected _isStopped:boolean = false;
    private _reelLayout: ReelLayout;
    protected get reelLayout(): ReelLayout {
        if(!this._reelLayout){
            this._reelLayout = this.getComponent(ReelLayout);
        }
        return this._reelLayout;
    } 

    protected isValideState():boolean{
        return this.reelLayout.getState() == ReelLayoutState.SPINNING
    }

    protected onLoad(): void {
        this.node.on
    }

    stop(){
        if(this.isValideState()){
            this._isStopped = true
        }else{

        }
    }

    protected update(dt: number): void {
        if(this._isStopped && this.reelLayout.offset == 0){
            // this.reelLayout.currentSpeed = 0
        }
    }

}



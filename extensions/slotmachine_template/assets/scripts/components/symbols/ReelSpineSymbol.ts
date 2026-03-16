import { _decorator, Component, isValid, log, Node, sp, SpriteFrame } from 'cc';
import { ReelSymbolTypeEnum } from '../../constants/GameSetting';
import { ReelLayout } from '../reels/ReelLayout';
import { ReelLayoutState } from '../reels/constants/ReelConstants';
import { ReelSymbol } from './ReelSymbol';
const { ccclass, property , executeInEditMode} = _decorator;

@ccclass('SpineSymbolInfo')
class SpineSymbolInfo {    

    @property({
        type:ReelSymbolTypeEnum,
    })
    enumType:number = ReelSymbolTypeEnum.A;

    @property({type:sp.SkeletonData})
    anim:sp.SkeletonData = null

}

@ccclass('ReelSpineSymbol')
export class ReelSpineSymbol extends Component {

    @property({type:[SpineSymbolInfo]})
    spineAnimInfos:SpineSymbolInfo[] = [];


    private _spine: sp.Skeleton = null;
    protected get spine(): sp.Skeleton {
        if(!this._spine){
            this._spine = this.getComponentInChildren(sp.Skeleton);
        }
        return this._spine;
    }
    
    protected onLoad(): void {
        if(isValid(this.node)){
            this.spine.node.active = false;
            this.node.on(ReelSymbol.Event.HAS_CHANGED_SYMBOL, this.onChangedSymbol.bind(this));
        }
    }


    protected onDestroy(): void {
        this.node.off(ReelSymbol.Event.HAS_CHANGED_SYMBOL)
    }

    /**
     * Mỗi lần symbol quay lên đầu là một lần check chuyển state
     * @param symbolNode 
     */
    protected onChangedSymbol(type:number, isNotEmptySymbol:boolean = true){    
        // log('Type: '+type,' has symbol: ' + isNotEmptySymbol)    
        if(!isNotEmptySymbol){
            const symboltype:string = ReelSymbolTypeEnum[type];
            if(symboltype){
                const symbolInfo:SpineSymbolInfo = this.spineAnimInfos.find((info:SpineSymbolInfo)=>{                
                    return info.enumType === type
                });
                if(symbolInfo){
                    this.spine.node.active = true;
                    this.spine.skeletonData = symbolInfo.anim;
                    this.spine.setAnimation(0, 'default', true);
                }
            }
        }else{
            this.spine.node.active = false;
        }
    }

}



import { _decorator, Component, isValid, log, Sprite, SpriteFrame } from 'cc';
import { ReelSymbolTypeEnum } from '../../constants/GameSetting';
import { GameUtils } from '../../utils/GameUtils';
import { EDITOR } from 'cc/env';
import { ReelLayout } from '../reels/ReelLayout';
import { ReelLayoutState } from '../reels/constants/ReelConstants';
const { ccclass, property, executeInEditMode } = _decorator;
const SymbolTypeList:string[] = GameUtils.getEnumKeys(ReelSymbolTypeEnum);

enum ReelSymbolState {
    IDLE = -1,
    SLOW,
    FAST
}

@ccclass('SpriteFrameInfoItem')
class SpriteFrameInfoItem {
    @property({serializable:true})
    private _enumType: number = ReelSymbolTypeEnum.A;

    @property({
        type: ReelSymbolTypeEnum,
        visible:true
    })
    public get enumType(): number {
        return this._enumType;
    }
    public set enumType(value: number) {
        this._enumType = value;
    }

    @property({type:SpriteFrame, serializable:true})
    normal:SpriteFrame = null;
    @property({type:SpriteFrame, serializable:true})
    blur:SpriteFrame = null;

    public get symbolType(): string {
        return ReelSymbolTypeEnum[this._enumType];
    }

    public get isReady():boolean{
        return !!this.normal && !!this.blur
    }
}

@ccclass('ReelSymbol')
@executeInEditMode(true)
export class ReelSymbol extends Component {

    static readonly Event = {
        HAS_CHANGED_SYMBOL:'reelsymbol_has_changed_sprite_frame'
    }

    @property
    localSymbolIndex:number = 0;

    @property
    type:number = -1;

    private _sprite: Sprite;
    protected get sprite(): Sprite {
        if(!this._sprite){
            this._sprite = this.getComponentInChildren(Sprite);
        }
        return this._sprite;
    }

    @property({group:'Setting'})
    public get geneareteTemplateSymbols(): boolean {
        return false;
    }
    public set geneareteTemplateSymbolInfos(value: boolean) {
        if(EDITOR){
            this.symbolInfos.length = 0;
            SymbolTypeList.forEach((symbolType:string)=>{
                const symbolInfo:SpriteFrameInfoItem = new SpriteFrameInfoItem();
                symbolInfo.enumType = ReelSymbolTypeEnum[symbolType];
                this.symbolInfos.push(symbolInfo);
            })            
        }
    }
    
    @property({type:[SpriteFrameInfoItem], readonly:true, serializable:true})
    symbolInfos:SpriteFrameInfoItem[] = [];


    protected speedState:ReelSymbolState = ReelSymbolState.IDLE;

    protected onLoad(): void {        
        this.randomSymbol();
        if(isValid(this.node)){
            this.node.on(ReelLayout.Event.STATE_CHANGED, this.onReelChangeState.bind(this));
            const index:number = this.node.parent.children.findIndex(node=>node === this.node)
            this.localSymbolIndex = index >= 0 ? index : this.localSymbolIndex;
        }
    }

    protected onDestroy(): void {
        this._sprite = null;
        this.node.off(ReelLayout.Event.STATE_CHANGED);
    }

    /**
     * 
     * @param symbolType 
     * @returns 
     */
    async input(symbolType:ReelSymbolTypeEnum|number):Promise<boolean>{
        // 
        if(symbolType == -1){
            return await this.randomSymbol();
        }
        const symbolInfo:SpriteFrameInfoItem = this.findSymbolInfoByType(symbolType);
        const isNotEmptySymbol:boolean = symbolInfo && symbolInfo.isReady;
        if(isNotEmptySymbol){
            this.type = symbolType;
            this.updateSpriteFrame(this.speedState, symbolInfo);
        }else{
            this.sprite.spriteFrame = null;        
        }        
        this.node.emit(ReelSymbol.Event.HAS_CHANGED_SYMBOL, symbolType, isNotEmptySymbol)
        return isNotEmptySymbol;
    }

    /**
     * 
     * @param state 
     * @param symbolInfo 
     */
    updateSpriteFrame(state:ReelSymbolState = ReelSymbolState.SLOW, symbolInfo?:SpriteFrameInfoItem){        
        const currentSymbolInfo:SpriteFrameInfoItem = symbolInfo ? symbolInfo : this.findSymbolInfoByType(this.type);
        if(!currentSymbolInfo) {
            throw new Error('There is no symbol use this type ' + this.type)
        }
        let spriteFrame:SpriteFrame = null;
        switch(state){
            case ReelSymbolState.FAST:
                spriteFrame = currentSymbolInfo.blur;
                break;
            case ReelSymbolState.SLOW:
            default:
                spriteFrame = currentSymbolInfo.normal;
                break;
        }
        this.sprite.spriteFrame = spriteFrame;
        this.speedState = state == -1 ? ReelSymbolState.SLOW : state;
    }

    // ---------------------------

    /**
     * 
     * @param state 
     */
    protected onReelChangeState(state:ReelLayoutState){
        let speedState:ReelSymbolState
        switch(state){
            case ReelLayoutState.SPINNING:
                speedState = ReelSymbolState.FAST
                break;
            default:
                speedState = ReelSymbolState.SLOW
                break;
        }
        (speedState !== undefined) && this.updateSpriteFrame(speedState);
    }

    // ---------------------------

    /**
     * 
     */
    private async randomSymbol():Promise<boolean>{
        const success:boolean =  await this.input(Math.floor(Math.random()*SymbolTypeList.length));
        if(!success) return await this.randomSymbol();
        return success;
    }


    /**
     * 
     * @param type 
     * @returns 
     */
    protected findSymbolInfoByType(type:ReelSymbolTypeEnum):SpriteFrameInfoItem{        
        const symboltype:string = ReelSymbolTypeEnum[type];
        if(symboltype){
            return this.symbolInfos.find((info:SpriteFrameInfoItem)=>{                
                return info.enumType === type
            });
        }
    }



}



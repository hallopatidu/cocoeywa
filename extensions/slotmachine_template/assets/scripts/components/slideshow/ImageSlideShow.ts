import { _decorator, Component, Label, log, Node, Prefab, Sprite, SpriteFrame, tween, Tween, UIOpacity } from 'cc';
import { BaseSlideShow } from '../abstract/BaseSlideShow';

const { ccclass, property } = _decorator;

@ccclass('SlideInfo')
class SlideInfo {
    @property({type:SpriteFrame, serializable:true})
    spriteFrame:SpriteFrame = null;

    @property
    description:string = "";
}

@ccclass('ImageSlideShow')
export class ImageSlideShow extends BaseSlideShow {

    @property({group:'Setting'})
    transitionTime:number = 1;

    @property({group:'Setting'})
    autoPlay:boolean = true;
    
    @property({
        visible(){return this.isAuto},
        displayName:'|__ Time to show',
        group:'Setting'
    })
    showTime:number = 3;    // seconds

    @property({
        type:[SlideInfo],
        visible(){
            return true;
        },
        group:'Setting'
    })
    slideInfos:SlideInfo[] = [];

    protected cancelFadeIn:Function = null;
    protected cancelFadeOut:Function = null;
    // protected cancelWait:Function = null;

    private _currentTime:number = 0;

    protected start(): void {
        this._currentTime = Date.now();
    }

    protected onDestroy(): void {
        this.autoPlay = false
    }

    stop(){
        if(this.cancelFadeIn){
            this.cancelFadeIn();
        }
        if(this.cancelFadeOut){
            this.cancelFadeOut();
        }
    }

    /**
     * 
     * @param dt 
     */
    protected update(dt: number): void {
        if(this.autoPlay){            
            const nowTime:number = Date.now();
            if( (nowTime - this._currentTime) >= (this.showTime * 1000) ){
                this._currentTime = nowTime;
                const selectedIndex = this.currentIndex + 1;
                const pageLength:number = this.numberOfPages;                
                this.currentIndex = selectedIndex % pageLength;
            }
        }
        super.update(dt);
    }

    protected async render(): Promise<void> {
        // log('ImageSlideShow render page ', this.pageIndex);
        this._currentTime = Date.now();
        this.stop();
        await super.render();
    }

    protected onInitNewItem(itemNode: Node, index: number): void {
        const label:Label = this.getComponentInChildren(Label);
        const sprite:Sprite = itemNode.getComponent(Sprite);
        const slideInfo:SlideInfo = this.slideInfos[index];
        if(slideInfo){
            sprite.spriteFrame = slideInfo.spriteFrame;
            if(label){
                label.string = slideInfo.description;
            }
        }
    }

    /**
     * 
     * @param itemNode 
     */
    onRemoveItem(itemNode:Node){
        // 
    }

    /**
     * 
     * @param itemNode 
     * @param index 
     */
    protected async renderEachItem(itemNode:Node, index:number){
        
        await super.renderEachItem(itemNode, index);
    }
    
    /**
     * 
     * @param itemNode 
     * @param index 
     */
    protected async onItemFadeIn(itemNode:Node, index:number){
        // 
        const uiOpacity:UIOpacity = itemNode.getComponent(UIOpacity) || itemNode.addComponent(UIOpacity);
        await new Promise((resolve:Function , reject:Function)=>{
            if(this.cancelFadeIn){
                this.cancelFadeIn(true);                
            }
            const fadeInTween:Tween<UIOpacity> = tween(uiOpacity);
            this.cancelFadeIn = (isReject:boolean = false)=>{
                fadeInTween.stop();
                uiOpacity.opacity = 255;
                this.cancelFadeIn = null
                isReject ? reject() : resolve();
            }
            fadeInTween
            .set({ opacity: 0 })
            .to(this.transitionTime, { opacity: 255 })
            .call(()=>this.cancelFadeIn && this.cancelFadeIn())
            .start();
        })
        // 
        const label:Label = this.getComponentInChildren(Label);
        const slideInfo:SlideInfo = this.slideInfos[index];
        if(slideInfo && label){            
            label.string = slideInfo.description;            
        }        
    }


    /**
     * 
     * @param itemNode 
     * @param index 
     */
    protected async onItemFadeOut(itemNode:Node, index:number){
        // 
        const uiOpacity:UIOpacity = itemNode.getComponent(UIOpacity) || itemNode.addComponent(UIOpacity);
        await new Promise((resolve:Function, reject:Function)=>{
            if(this.cancelFadeOut){
                this.cancelFadeOut(true);
            }
            const fadeInTween:Tween<UIOpacity> = tween(uiOpacity);
            this.cancelFadeOut = (isReject:boolean = false)=>{
                fadeInTween.stop();
                uiOpacity.opacity = 0;
                this.cancelFadeOut = null
                isReject ? reject() : resolve();
            }
            fadeInTween
            .set({ opacity: 255 })
            .to(this.transitionTime, { opacity: 0 })
            .call(()=>this.cancelFadeOut && this.cancelFadeOut())
            .start();
        })
    }

}



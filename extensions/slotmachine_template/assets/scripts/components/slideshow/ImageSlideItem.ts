import { _decorator, CCBoolean, Component, Node, Sprite, SpriteFrame } from 'cc';
import { EDITOR } from 'cc/env';
const { ccclass, property } = _decorator;



@ccclass('ImageSlideItem')
export class ImageSlideItem extends Component {

    @property({serializable:true})
    slideIndex: number = 0;

    @property({group:'View', displayName:'Display In Editor'})
    public get displayInEditMode(): boolean {
        return false;
    }
    public set displayInEditMode(value: boolean) {
        EDITOR && this.render();
    }

    @property({type:[SpriteFrame]})
    protected spriteFrames:SpriteFrame[] = []

    
    render() {        
        const itemLength:number = this.spriteFrames?.length;
        const sprite:Sprite = this.getComponent(Sprite);
        const selectedIndex:number = (this.slideIndex || 0)%itemLength;
        const slectedSpriteFrame:SpriteFrame = this.spriteFrames[selectedIndex];
        if(slectedSpriteFrame){
            sprite.spriteFrame = slectedSpriteFrame;
        }
    }

    update(deltaTime: number) {
        
    }
}



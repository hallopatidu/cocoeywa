import { _decorator, EventHandler, Node, Toggle } from 'cc';
import { BaseSlideShow } from '../abstract/BaseSlideShow';
const { ccclass, property, executeInEditMode } = _decorator;

@ccclass('IndicatorComponent')
export class IndicatorComponent extends BaseSlideShow {
        
    /**
     * 
     * @param itemNode 
     */
    protected onRemoveItem(itemNode:Node){
        // 
    }

    protected onInitNewItem(itemNode:Node, itemIndex:number){
        // 
    }
    
    protected async onItemFadeIn(itemNode:Node, itemIndex:number){
        const toggle:Toggle = itemNode.getComponent(Toggle) //|| itemNode.addComponent(Toggle);        
        toggle.interactable = false;
        toggle?.setIsCheckedWithoutNotify(true)
    }

    /**
     * 
     * @param itemNode 
     * @param itemIndex 
     */
    protected async onItemFadeOut(itemNode:Node, itemIndex:number){
        const toggle:Toggle = itemNode.getComponent(Toggle) //|| itemNode.addComponent(Toggle);
        toggle.interactable = true;
        toggle?.setIsCheckedWithoutNotify(false)
    }

    /**
     * 
     * @param itemNode 
     * @param index 
     */
    protected async renderEachItem(itemNode:Node, index:number){
        const toggle:Toggle = itemNode.getComponent(Toggle) || itemNode.addComponent(Toggle);
        toggle.interactable = true;
        if(!toggle.checkEvents.length){
            const checkEventHandler = new EventHandler();
            checkEventHandler.target = this.node;
            checkEventHandler.component = 'IndicatorComponent';
            checkEventHandler.handler = 'onItemToggle';
            checkEventHandler.customEventData = `${index}`;
            toggle.checkEvents.push(checkEventHandler);
        }
        await super.renderEachItem(itemNode, index);
    }

    // ----------------------------------------------------

    /**
     * 
     * @param event 
     * @param custormData 
     * @returns 
     */
    onItemToggle(event:ToggleEvent, custormData?:string){
        const selectedIndex:number = custormData ? parseInt(custormData) : 0;
        if(this.currentIndex === selectedIndex) return;
        this.currentIndex = selectedIndex;
    }

}



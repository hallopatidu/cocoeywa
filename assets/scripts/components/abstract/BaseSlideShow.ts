import { _decorator, Component, instantiate, isValid, Layout, log, Node, Prefab } from 'cc';
import { EDITOR } from 'cc/env';
import { data } from 'db://cocoeywa/scripts/blocks/DataBlock';
const { ccclass, property } = _decorator;

@ccclass('BaseSlideShow')
export abstract class BaseSlideShow extends Component {

    // Data store in Prefab Root Node.
    @data.prefab.binding
    protected currentIndex:number = 0;

    @property({
        step: 1,
        min: 1,
        readonly:true
    })
    public get pageIndex(): number {
        return this.currentIndex + 1;
    }
    public set pageIndex(value: number) {
        this.currentIndex = Math.max(0, value - 1)%this.numberOfPages;
    }

    @property({
        step:1,
        min:1
    })
    numberOfPages:number = 2;   // numberOfPages: số trang hiện tại. giá trị > 1

    
    @property({type:Prefab, group:'View'})
    itemTemplate:Prefab = null;

    @property({type:Node, group:'View'})
    layoutNode:Node = null;

    @property({ group:'View', displayName:'Display In Editor', visible:true })
    public get displayInEditMode(): boolean {
        return false;
    }
    public set displayInEditMode(value: boolean) {
        EDITOR && this.render();
    }
    
    protected lastIndex:number = -1;

    protected isReady():boolean{
        return this.lastIndex !== this.currentIndex;
    }

            
    protected onDestroy(): void {
        if(this.layoutNode){
            const items:Node[] = this.layoutNode?.children
            while(items && items.length){
                const lastNode:Node = this.layoutNode.children[0];
                this.onRemoveItem(lastNode);
                this.layoutNode.removeChild(lastNode)
            }
            this.layoutNode = null;
        }
    }

    /**
     * 
     * @returns 
     */
    protected async render(){        
        if(!this.layoutNode) throw new Error('No value exists for IndicatorComponent.layoutNode');
        if(!this.itemTemplate) throw new Error('No value exists for IndicatorComponent.itemTemplate!');
        if(!this.isReady()) return;
        //
        const pageLength:number = this.numberOfPages;
        let curItemLength:number = this.layoutNode.children.length;
        while(curItemLength > pageLength){
            const lastNode:Node = this.layoutNode.children[curItemLength - 1];
            this.onRemoveItem(lastNode);
            lastNode.removeFromParent();
            curItemLength = this.layoutNode.children.length;
        }
        //         
        const effectPromises:Promise<void>[] = [];
        for (let index = 0; index < pageLength; index++) {
            let itemNode:Node = this.layoutNode.children[index];
            const itemIndex:number = index;
            if(!itemNode){
                itemNode = instantiate(this.itemTemplate);
                this.onInitNewItem(itemNode, index);                
            }
            effectPromises.push(this.renderEachItem(itemNode, index));            
            itemNode.parent = this.layoutNode;
        }
        this.lastIndex = this.currentIndex;
        await Promise.all(effectPromises);
        // 
    }

    protected async renderEachItem(itemNode:Node, index:number){
        if(this.currentIndex === index){
            await this.onItemFadeIn(itemNode, index);
        } else {            
            await this.onItemFadeOut(itemNode, index);
        }
        // 
    }

    protected update(dt: number): void {
        if(this.isReady()){            
            this.render();
        }
    }

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
        // 
    }

    protected async onItemFadeOut(itemNode:Node, itemIndex:number){
        // 
    }

}



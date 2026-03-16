import { _decorator, Component, error, EventHandler, isValid, Node, warn } from 'cc';
import { StoreBlock } from './StoreBlock';
import { ViewBlock } from '../blocks/ViewBlock';
import { blocks } from '../definition/cocoeywa.blocks';
import { utils } from '../definition/cocoeywa.utils';


const { ccclass, property } = _decorator;

@ccclass('ExecutorBlock')
export class ExecutorBlock extends StoreBlock {

    @property
    protected progressTimeout:number = 40 // seconds;

    @property({serializable:true})
    private _viewBlock: ViewBlock = null;
    protected get viewBlock(): ViewBlock {
        if(!this._viewBlock && isValid(this.node)){
            this._viewBlock = blocks.findMainBlock(ViewBlock, this.node);
        }
        return this._viewBlock;
    }
    
    // protected actionStacks:Record<string, string[][]> = null;

    // protected onDestroy(): void {
    //     // this.actionStacks = null;
    //     super.onDestroy && super.onDestroy()
    // }

    protected record(actionStacks:string[][], ...actions:string[]){
        actionStacks.push(Array.from(actions))
        // const actionList:string[][] = this.actionStacks[state] ?? [];
        // actionList.push(Array.from(actions));
        // this.actionStacks[state] = actionList
    }

    /**
     * 
     * @param state 
     */
    protected async renderActions(state:string, actionStacks:string[][], abortController?:AbortController){
        if(actionStacks && actionStacks.length){            
            // const stacks:string[][] = (this.actionStacks[state] as string[][]).slice();
            const stacks:string[][] = actionStacks;
            // 
            for (let index = 0; index < stacks.length; index++) {                    
                const tokens:string[] = stacks[index];
                if(tokens && tokens.length){
                    await this.runActionProgress(tokens, abortController);
                }
            }
            // 
            // delete this.actionStacks[state];
            actionStacks.length = 0;
        }else{
            warn('There is no action for playing in state ', state)
        }
    }

    /**
     * 
     * @param tokens 
     * @param abortController 
     */
    protected async runActionProgress(tokens:string[], abortController?:AbortController){
        try{
            const progressPromises:Promise<void>[] = []
            tokens.forEach((token:string)=>{
                progressPromises.push(this.runActionTask(token));
            })
            await Promise.all(progressPromises)
        }catch(err:unknown){
            error('Meet Error when running state !')
        }
    }

    /**
     * 
     * @param token 
     * @param abortController 
     */
    protected async runActionTask(token:string, abortController?:AbortController){
        try{    
            const handler:EventHandler = this.viewBlock.getIntentRef(token);
            if(handler){
                await utils.callWithTimeout(utils.getMethodFromEventHandler(handler), {timeout: this.progressTimeout*1000, abort: abortController});
            }
        }catch(err:unknown){
            error(err)
        }
    }
}



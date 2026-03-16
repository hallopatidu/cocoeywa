import { _decorator, error, EventHandler, log, Node } from 'cc';
import { GameBlock } from '../definition/cocoeywa.blocks';
import { utils } from '../definition/cocoeywa.utils';

const { ccclass, property } = _decorator;

export const LocalRefID:symbol = Symbol('LocalRefID')

@ccclass('ViewAction')
class IntentHandler extends EventHandler {
    priority:number = 0
}

@ccclass('IntentBlock')
export abstract class IntentBlock extends GameBlock {
    private intentMap:Map<string, IntentHandler> = new Map<string, IntentHandler>(); // token / IntentHandler

    protected onLoad(): void {
        super.onLoad && super.onLoad();
        this.intentMap = new Map<string, IntentHandler>();
    }

    protected onDestroy(): void {
        this.intentMap.clear();
        this.intentMap = null
        super.onDestroy && super.onDestroy();
    }

    /**
     * 
     * @param seed 
     * @param args 
     * @returns 
     */
    protected generateToken(seed:number = 0, ...args:string[]):string{
        return utils.generateEmbedToken(args.join('::'), seed);
    }

    /**
     * 
     * @param targetNode 
     * @param className 
     * @param methodName 
     * @param blockTagInfo 
     * @returns 
     */
    protected addIntentRef(targetNode:Node, className:string, methodName:string, priority:number):string{        
        const token:string = this.generateToken(priority + 1, targetNode.getPathInHierarchy(), className, methodName);
        const action = new IntentHandler();
        action.priority = priority;
        action.target = targetNode;
        action.component = className;
        action.handler = methodName;
        if(!this.intentMap.has(token)){
            this.intentMap.set(token, action);
        }else{
            error('Douple tokens: ' + token, ' -path: ' + [targetNode.getPathInHierarchy(), className, methodName].join('::'), ' -seed: ' + (priority + 1))
        }
        return token;
    }

    getIntentRef(token:string):IntentHandler {
        return this.intentMap?.get(token);
    }

    hasIntentRef(token:string):boolean{
        return this.intentMap?.has(token);
    }
    
    protected getIntentPriority(token:string):number {
        return this.getIntentRef(token)?.priority;
    }

    protected removeIntentRef(token:string){
        this.intentMap.has(token) && this.intentMap.delete(token);
    }

    // protected async callIntentRef(token:string){
    //     if(!this.handlerMap.has(token)){
    //         error('Unknow token ' + token);
    //     }
    //     log('call to function ' + this.handlerMap.get(token)._componentName)
    // }

}



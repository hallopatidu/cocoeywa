import { _decorator, Component, Node } from 'cc';
import { IntentBlock } from './IntentBlock';
import { utils } from '../definition/cocoeywa.utils';
const { ccclass, property } = _decorator;


export type ReferenceDataType = {
    [n:string]: ReferenceDataType|string
}

@ccclass('ReferenceBlock')
export class ReferenceBlock extends IntentBlock {
    private referenceMap:Map<string, string> = new Map<string, string>();  // path to token

    protected onLoad(): void {        
        super.onLoad && super.onLoad();
        this.referenceMap = new Map<string, string>();
    }

    protected onDestroy(): void {
        this.referenceMap.clear();        
        this.referenceMap = null;
        super.onDestroy && super.onDestroy();
    }

    protected addTokenPath(path:string, token:string){
        this.referenceMap.set(path, token);
    }

    protected deleteTokenPath(path:string){
        this.referenceMap.delete(path);
    }
    
    getTokenFromPath(path:string):string{
        return this.referenceMap.get(path);
    }
    
    protected isValidPath(path:string):boolean{
        return this.referenceMap.has(path);
    }

    protected tokenPathInfos(){
        return utils.mapToObject(this.referenceMap)
    }

   

}



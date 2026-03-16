import { _decorator, Component, Constructor, director, DirectorEvent, error, EventHandler, Game, game, isValid, js, log, Node, NodeEventType, warn } from 'cc';
import { DataBlock } from './DataBlock';
import { ViewBlock } from './ViewBlock';
import { BlockLevel, blocks, BlockTagInfo, GameBlock, OverrideMethod, OverrideOption } from '../definition/cocoeywa.blocks';
import { LocalRefID } from '../abstract/IntentBlock';
import { utils } from '../definition/cocoeywa.utils';
import { DEV } from 'cc/env';
import { ExecutorBlock } from '../abstract/ExecutorBlock';

const { ccclass, property } = _decorator;
const ScenarioModifier = Symbol('ScenarioModifier');
const ScenarioMainBlock = Symbol('ScenarioMainBlock');

const RegisterScenario = Symbol('Register');
const UnregisterScenario = Symbol('Unregister');
const OnChanged = Symbol('OnChanged');
const Execute = Symbol('Execute');

const ScenarioOverrideOption:OverrideOption = {
    onLoad(target:Component, blockTagInfos:Map<string, BlockTagInfo>){
        let mainBlock:ScenarioBlock = target[ScenarioMainBlock] ??= blocks.getMainBlock(ScenarioBlock, BlockLevel.GLOBAL);
        // For Persist Node
        const persitNode:Node = utils.getPersitParentNode(target?.node);
        if(persitNode){
            persitNode.on(NodeEventType.SCENE_CHANGED_FOR_PERSISTS, ()=>{
                // Ham chi tac dung voi Presit Node
                // Go dang ky khi thay doi scene
                ScenarioOverrideOption.onDestroy(target, blockTagInfos);
                // Tien hanh dang ky lai voi main block moi tren scene moi.
                director.once(DirectorEvent.AFTER_SCENE_LAUNCH, ()=>{
                    mainBlock = target[ScenarioMainBlock] = blocks.getMainBlock(ScenarioBlock);
                    blockTagInfos.forEach((blockTagInfo:BlockTagInfo)=>{
                        const propName:string = blockTagInfo.prop;
                        mainBlock[RegisterScenario](target, propName, blockTagInfo);                                
                    })                    
                })                
            })
        }
        //
        if(target !== mainBlock){
            blockTagInfos.forEach((blockTagInfo:BlockTagInfo, methodName:string)=>{
                mainBlock[RegisterScenario](target, methodName, blockTagInfo);
            })
        }
        
    },
    onDestroy(target:Component, blockTagInfos:Map<string, BlockTagInfo>){
        // const persitNode:Node = utils.getPersitParentNode(target?.node);
        // if(persitNode){
        //     persitNode.off(NodeEventType.SCENE_CHANGED_FOR_PERSISTS);
        // }
        const mainBlock:ScenarioBlock = target[ScenarioMainBlock];
        if(mainBlock && target !== mainBlock){
            blockTagInfos.forEach((blockTagInfo:BlockTagInfo, methodName:string)=>{
                mainBlock[UnregisterScenario](target, methodName, blockTagInfo);
            })
        }
        delete target[ScenarioMainBlock];
    }        
}
type StateOrderType = {
    priority:number,
    handler:EventHandler
}

export const DefaultScenarioState = {
    INIT_GAME:'INIT_GAME',
    GET_GAME_INFO:'GET_GAME_INFO',
    JOIN_GAME:'JOIN_GAME',
    READY_TO_PLAY:'READY_TO_PLAY'
}

export namespace scenario {
    export const state = blocks.generateMethodDecorator(ScenarioModifier, ScenarioOverrideOption, (target:unknown)=>js.isChildClassOf(target.constructor, ScenarioBlock));  // Chỉ cho phép dùng trong ScenarioBlock
    export const action = ViewBlock.Action;

    export const data = DataBlock.Binding;

    export async function play(state:string){
        const mainBlock:ScenarioBlock = blocks.getMainBlock<ScenarioBlock>(ScenarioBlock);
        if(mainBlock){
            await mainBlock.play(state);
        }
    }
    
    export function stop(state:string){
        // TODO
    }

}




/**
 * TODO: sudden stop state / action
 */
@ccclass('ScenarioBlock')
export class ScenarioBlock<IData = unknown, IView = unknown> extends ExecutorBlock {

    @property({serializable:true})
    private _dataBlock: DataBlock<IData> = null;
    private get dataBlock(): DataBlock<IData> {
        if(!this._dataBlock){
            this._dataBlock = blocks.findMainBlock<DataBlock<IData>>(DataBlock, this.node);
            // if(this._dataBlock && this._dataBlock.node){
            //     this._dataBlock.node.once(NodeEventType.NODE_DESTROYED, this.onMainDataBlockDestroy.bind(this))
            // }
        }
        return this._dataBlock;
    }
    
    private _masterScenario:ScenarioBlock = null;
    protected get masterScenario():ScenarioBlock {
        if(!this._masterScenario){
            this._masterScenario = this[ScenarioMainBlock] ?? blocks.getMainBlock(ScenarioBlock, BlockLevel.GLOBAL);
        }
        return this._masterScenario;
    }
    
    protected get data(): IData {
        if(!this._dataProxy){
            // this._dataProxy = this.createProxy(this.dataBlock?.data, []);
            this._dataProxy = this.dataBlock.getProxy<IData>();
        }
        return this._dataProxy as IData;
        // return this.dataBlock?.data as IData;
    }
    
    private _view: IView = null;
    protected get view(): IView {
        if(!this._view){
            // this._view = this.viewBlock.getData<IView>()
            this._view = this.viewBlock.getProxy<IView>()
        }
        return this._view;
    }

    private _stateProgress:Map<string, EventHandler[][]> = null;   // state / play in order
    private get stateProgress():Map<string, EventHandler[][]> {
        if(!this._stateProgress){
            this._stateProgress = new Map<string, EventHandler[][]>(); 
        }
        return this._stateProgress
    }
    
    protected get isMain(): boolean {
        return this === this.masterScenario;
    }

    protected stateStacks:Record<string, AbortController> = null;
    protected _dataProxy:IData = null;

    protected onDestroy(): void {
        this._dataBlock = null;
        this._masterScenario = null;        
        this._view = null;
        this._dataProxy = null;
        this._stateProgress = null;
        super.onDestroy && super.onDestroy();
    }

    // start(): void {
    //     if(this.isMain){
    //         this[Execute](DefaultScenarioState.INIT_GAME);
    //         log(DefaultScenarioState.INIT_GAME)
    //     }
    // }

    [RegisterScenario](component:Component, methodName:string, blockTagInfo:BlockTagInfo) {
        if(!component) return;        
        const targetNode:Node = component.node;
        const className:string = js.getClassName(component);
        const comps:Component[] = targetNode.getComponents(className);
        const stateName:string = blockTagInfo?.key;
        const id:number = component[LocalRefID] ??= (comps.length > 1 ? comps.findIndex((comp:Component)=>comp==component) : -2);
        let methodKey:string = methodName;
        methodKey = id >= 0 ? `${component[LocalRefID]}.${methodKey}` : methodKey;
        const token:string = this.addIntentRef(targetNode, className, methodKey, blockTagInfo.priority);
        this.store.set(stateName, token);
        warn(`Registed ${className} to ScenarioBlock with prop: ${blockTagInfo.prop}`)
        this[OnChanged](stateName);
    }
    
    [UnregisterScenario](component:Component, methodName:string, blockTagInfo:BlockTagInfo) {
        if(!component) return;        
        const targetNode:Node = component.node;
        const className:string = js.getClassName(component);
        const stateName:string = blockTagInfo?.key;
        const priority:number = blockTagInfo?.priority ?? 0;
        let methodKey:string = methodName;
        const id:number = component[LocalRefID];
        if(id === undefined){
            throw new Error("The component doesn't exist !");
        }
        methodKey = id >= 0 ? `${component[LocalRefID]}.${methodKey}` : methodKey;
        const token:string = this.generateToken(priority + 1, targetNode.getPathInHierarchy(), className, methodKey);
        this.store.delete(stateName, token);
        warn(`Unregisted ${className} to ScenarioBlock with prop: ${blockTagInfo}`)
        this[OnChanged](stateName);
    }

    /**
     * 
     * @param stateName 
     */
    [OnChanged](stateName:string){        
        const tokens:string[] = this.store.get(stateName);
        if(tokens && tokens.length){
            const intents:StateOrderType[] = tokens.reduce((intents:StateOrderType[], token:string)=>{
                if(this.hasIntentRef(token)){
                    const handler:StateOrderType = {
                        priority:this.getIntentPriority(token),
                        handler:this.getIntentRef(token)
                    }
                    intents.push(handler);                    
                }
                return intents;
            }, []);
            const progress:EventHandler[][] = intents.sort((a:StateOrderType, b:StateOrderType)=> a.priority - b.priority)
                                            .reduce((steps:EventHandler[][], intent:StateOrderType,) => {
                                                const priority:number = intent.priority;
                                                (steps[priority] ??= []).push(intent.handler);
                                                return steps;
                                            }, []);                                
            this.stateProgress.set(stateName, progress);
        }
    }

    async play(state:string){
        await this[Execute](state);
    }

    async stop(state?:string){

    }

    // ------------------ Chức năng tham chiếu vào data --------------------

    /**
     * Chạy stateProgress - Đã được sắp xếp.
     * Khi đăng kí event. Các state từ các view khác nhau đã được sắp sếp. Cùng priority chạy trước và song song. state có priority nhỏ hơn chạy sau.
     * @param state 
     */
    private async [Execute](state:string){
        if(this.stateProgress.has(state)){
            // const saveIntentMethod:Function = this.intent;
            try{
                if(!this.stateStacks){
                    this.stateStacks = Object.create(null);
                }else if(this.stateStacks[state]){
                    if(DEV){
                        throw new Error(`Just run only one state ${state} in the same time.`)
                    }else{                         
                        return;
                    }
                }
                // 
                const abortController:AbortController = new AbortController();
                this.stateStacks[state] = abortController;
                
                const progress:EventHandler[][] = this.stateProgress.get(state);
                await this.runStateProgress(state, progress, abortController);
                // Chay sync cho state.
                // for (let index = 0; index < progress.length; index++) {
                //     const handlers:EventHandler[] = progress[index];                    
                //     let progressPromises:Promise<void>[] = []
                //     handlers.forEach((handler:EventHandler)=>{
                //         const actionStacks:string[][] = [];
                //         const scenario:ScenarioBlock = utils.getComponentFromEventHandler(handler) as ScenarioBlock;
                //         const saveIntentMethod:(...actions:string[])=>void = scenario.intent.bind(scenario);
                //         const stateMethod:Function = utils.getMethodFromEventHandler(handler);
                //         scenario.intent = this.record.bind(this, actionStacks);
                //         stateMethod && stateMethod.call(scenario);
                //         // restore method
                //         scenario.intent = saveIntentMethod;
                //         progressPromises.push(this.renderActions(state, actionStacks, abortController))
                //     })
                //     // chạy state function trước. sau đó mới render action.
                //     await Promise.all(progressPromises);
                //     log('run state ------------ ', state)
                // }

                // let progressPromises:Promise<void>[] = []
                // progress.forEach((handlers:EventHandler[])=>{

                //     handlers.forEach((handler:EventHandler)=>{
                //         const actionStacks:string[][] = [];
                //         const scenario:ScenarioBlock = utils.getComponentFromEventHandler(handler) as ScenarioBlock;
                //         const saveIntentMethod:(...actions:string[])=>void = scenario.intent.bind(scenario);
                //         const stateMethod:Function = utils.getMethodFromEventHandler(handler);
                //         scenario.intent = this.record.bind(this, actionStacks);
                //         stateMethod && stateMethod.call(scenario);
                //         // restore method
                //         scenario.intent = saveIntentMethod;
                //         progressPromises.push(this.renderActions(state, actionStacks, abortController))
                //     })
                // })                
                // chạy state function trước. sau đó mới render action.
                // await this.renderActions(state);
                // await Promise.all(progressPromises);

            } catch (err:unknown){
                error('Meet Error when running state !' , err)                
            } finally {
                delete this.stateStacks[state];
            }
        }else{
            warn(`this state "${state}" is invalid`)
        }
    }

   
    /**
     * Hàm giao tiếp. Chỉ dùng gội trong một state.
     * Được replace bởi hàm record với state tương ứng.
     * @param actions 
     */
    intent(...actions:string[]){
        if(DEV){
            throw new Error('Do not call intent function outside Scenario. The Action Method is only called via cocoeywa system !')
        }
    };

    // ---------

    /**
     * 
     * @param state 
     * @param stateProgress 
     * @param abortController 
     * @param stateTaskId 
     * @returns 
     */
    protected async runStateProgress(state:string, stateProgress:EventHandler[][], abortController:AbortController, stateTaskId:number = 0):Promise<void>{
        if(stateTaskId >= stateProgress.length){
            return
        }
        this.intent = this.record.bind(this, state);
        let progressPromises:Promise<void>[] = []
        const handlers:EventHandler[] = stateProgress[stateTaskId];
        handlers?.forEach((handler:EventHandler)=>{
            const actionStacks:string[][] = [];
            const scenario:ScenarioBlock = utils.getComponentFromEventHandler(handler) as ScenarioBlock;
            const saveIntentMethod:(...actions:string[])=>void = scenario.intent.bind(scenario);
            const stateMethod:Function = utils.getMethodFromEventHandler(handler);
            scenario.intent = this.record.bind(this, actionStacks);
            stateMethod && stateMethod.call(scenario);
            // restore method
            scenario.intent = saveIntentMethod;
            progressPromises.push(this.renderActions(state, actionStacks, abortController))
        })
        // chạy state function trước. sau đó mới render action.
        await Promise.all(progressPromises);
        await this.runStateProgress(state, stateProgress, abortController, stateTaskId + 1);
    }
    
    /**
     * Nếu truyền vào là token sẽ chạy action còn không sẽ chạy state (với điều kiện state đó đang không chạy.)
     * @param tokenOrState 
     */
    protected async runActionTask(tokenOrState: string): Promise<void> {
        
        // if(utils.isHash(tokenOrState)){
        if(this.viewBlock.hasIntentRef(tokenOrState)){
            await super.runActionTask(tokenOrState);
        }else {
            await this[Execute](tokenOrState);
        }
    }

}



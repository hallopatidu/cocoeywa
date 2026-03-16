import { __private, _decorator, Component, Constructor, EventHandler, js, Node } from 'cc';
import Pipelineify, { IPipelinify, PipeDoneType, PipeJointType, PipeTask } from '../intermediate/Pipelineify';
import { cocoseus } from '../definition/cocoseus';
// import ChainBlock from './ChainBlock';
// import { BlockEvent, IPlayBlock } from './BlockType';
// import { cocoseus } from '../../cocoseus';
// import { NodeBranchActivify } from '../../cocoseus/polyfill/NodeHierarchyActivify';
// import { FunctionUtils } from '../core/utils';
const { ccclass, property } = _decorator;

const RestoreActivedNodeHandler = Symbol();

export enum BlockStatus {
    INIT,
    START,
    END,
}


export interface IPlayBlock extends IPipelinify {
    get totalDuration(): number,
    execute<T = any>(data?: T): Promise<T>
    cancel(): void
}

// export interface IChainTask extends PipeTask {
//     set done(value: PipeDoneType);
//     get done(): PipeDoneType
// }

@ccclass('ChainBlock')
class ChainBlock extends Pipelineify(Component) {

    static BlockEvent = {
        CANCEL: 'block_cancel',
    };

    @property({ serializable: true, visible: false })
    protected _isHeader: boolean = true;

    protected get isHeader(): boolean {
        return this._isHeader; 
    };

    protected set isHeader(value: boolean) {
        this._isHeader = value;
        if (!value) {
            this.hideAllPropertiesOfHeader();
        }
    }

    protected _resolve: PipeDoneType = null;

    // protected _taskMap:Map<number,IPipeTask> = new Map<number,IPipeTask>();

    protected _currentTaskId: number = -1;

    onLoad() {
        this._initChainBlocks()
        this.node?.on(ChainBlock.BlockEvent.CANCEL, () => this.cancel(), this); 
    }

    /**
     * Executes the chain block asynchronously with the provided input data.
     * 
     * This method wraps the execution in a Promise, creating a PipeTask and invoking the async pipeline.
     * The Promise resolves with the result of the pipeline or rejects if an error occurs during execution.
     * 
     * @template T The expected return type of the execution result.
     * @param data - Optional input data to be passed to the pipeline.
     * @returns A Promise that resolves with the result of the pipeline execution.
     */
    async execute<T = any>(data?: T): Promise<T> {
        try {
            return await new Promise((resolve: Function, reject: Function) => {
                const task: PipeTask = PipeTask.create({
                    input: data,
                    onComplete: (err: Error, data: any) => {
                        if (err) {
                            reject(err)
                        } else {
                            resolve(data || true)
                        }
                    }
                }) as PipeTask;
                this.async(task);
            })
        } catch (err) {
            return;
        }
    }


    /**
     * 
     * @param taskId 
     */
    public cancel(): void {
        this.resolve(true);
    }


    /**
     * Attach the execute function of another Chain Block on the same node to the async Func of the first ChainBlock.
     *  
     */
    protected _initChainBlocks(fillerBlockClass:string|typeof ChainBlock = ChainBlock) {
        if (this.node) {
            const chainBlockClass: Constructor<unknown> = typeof fillerBlockClass == 'string' ? js.getClassByName(fillerBlockClass) : fillerBlockClass;
            const components: ChainBlock[] = this.node.getComponents<ChainBlock>(chainBlockClass as unknown as any) as ChainBlock[];  // type: [OrderComponent];
            if (components && components.length > 0) {
                const leader: Component = components[0];
                if (leader == this) {
                    this.isHeader = true;
                    // Attach each component's function call to the Pipeline List.
                    components.forEach((component: ChainBlock) => {
                        if (component !== this && !!component.execute) {
                            component.isHeader = false;
                            // Attach another component's execute function to the Pipeline List.
                            this._initEachBlock<typeof component>(component);
                        } else {
                            // cc.Class.Attr.setClassAttr(component, 'type', 'visible', 'false');
                            // CC_DEV && !component.execute && cc.warn('component ko co ham execute')
                        }
                    });
                }
            }
        }
    }

    /**
     * Init each block, but donot include header
     * @param component 
     */
    protected _initEachBlock<T extends ChainBlock>(component: T) {
        this.add(component.execute.bind(component));
    }


    /**
     * 
     */
    protected hideAllPropertiesOfHeader() {

    }

    /**
     * 
     * @param func 
     * @returns 
     */
    protected add(func: Function, option?: any) {
        const asyncFunc: PipeJointType = this.createPipeJoint(func, option);
        this.append(asyncFunc);
    }

    /**
     * 
     * @param func 
     * @param option 
     * @returns 
     */
    protected createPipeJoint(func: Function, option?: any): PipeJointType {
        return async (task: PipeTask, done: PipeDoneType) => {
            // task.done = done;
            this._resolve = done;
            task.output = task.input;
            try {
                const result: any = func(task.output, option);
                if ((result instanceof Promise) || (typeof result === 'object' && typeof result.then === 'function')) {
                    await result;
                }
                this.resolve();
            } catch (err) {
                this.resolve(err);
            }
        }
    }

    /**
     *    
     * @param stopImmediately 
     */
    protected resolve(stopImmediately: boolean | Error = false): void {
        // if(this._taskMap.size === 0) return null;
        // const task:IPipeTask = this._taskMap?.get(taskId);
        // if(task){
        //     const pipeDone:PipeDone = task.done;
        //     task.done = null;
        //     task.isFinished = true;
        //     pipeDone && pipeDone(stopImmediately);
        // }else{
        //     throw new Error(`Cannot find task with id ${taskId}`);
        // }
        // return task;
        if (this._resolve) {
            const pipeDone: PipeDoneType = this._resolve;
            this._resolve = null;
            pipeDone && pipeDone(stopImmediately);
        }

    }


}



@ccclass('PlayBlock')
export default class PlayBlock extends ChainBlock implements IPlayBlock { 

    static BlockEvent = Object.assign( {
        START: 'block_start',
        END: 'block_end',
    }, ChainBlock.BlockEvent);

    static BlockStatus = {
        INIT:0,
        START:0,
        END:0,
    }

    private [RestoreActivedNodeHandler]: () => void | null;
    protected options: { status: BlockStatus } = { status: BlockStatus.INIT };

    
    protected override _initChainBlocks(): void {
        this.add(this.onStartBlock.bind(this), this.options);
        this.onInit(this.options);
        this.add(this.onEndBlock.bind(this), this.options);
        super._initChainBlocks()
    }

    get totalDuration(): number {
        throw new Error('Method not implemented.');
    }


    protected onInit(options:any):void{

    }

    /**
     * 
     * @param options 
     */
    protected async onStartBlock(options:any){
        this.options.status = BlockStatus.START
        this.node.emit(PlayBlock.BlockEvent.START, options)
        this.activeNodeInHierarchy(this.node)
    }


    /**
     * 
     * @param options 
     */
    protected async onEndBlock(options:any){
        this.options.status = BlockStatus.END
        this.deactiveNodeInHierarchy();
        this.node.emit(PlayBlock.BlockEvent.END)
        
    }

    /**
     * 
     * @param options 
     */
    protected async onCancelBlock(options:any){
        this.deactiveNodeInHierarchy();
    }

    /**
     * 
     * @param eventHandlers 
     * @param options 
     */
    protected async callAllEventHandlers(eventHandlers:EventHandler[], options?:any){
        await Promise.all(eventHandlers.reduce((promises:Promise<any>[], eventHandler:EventHandler)=>{
            promises.push(cocoseus.utils.functions.asyncCall(this._getMethodFromEventHandler(eventHandler)))
            return promises
        }, []));
        // eventHandlers.forEach((eventHandler:EventHandler)=>this._callEventHandler(eventHandler, options));
    }

    /**
     * Search upwards to parent nodes to ensure the animation is displayed.
     * By activating all nodes in the hierarchy of the node.
     * Returns a function that, when called, will restore the original state of the nodes before displaying the animation.
     * @param {*} node 
     * @param {*} deactiveList 
     * @returns {function} Returns a function that, when called, will restore the nodes that were activated.
     */
    protected activeNodeInHierarchy(node:Node, deactiveList?:Node[]):()=>void|null{
        if(node && node.parent){
            deactiveList = deactiveList || [];
            if(node.active == false){
                deactiveList.push(node);
                node.active = true;
            }
            return this.activeNodeInHierarchy(node.parent, deactiveList)
        }else if(deactiveList && deactiveList.length){
            const restoreActivedNodes:Node[] = deactiveList;
            this[RestoreActivedNodeHandler] = ()=>{
                restoreActivedNodes.forEach((node:Node)=>{
                    node.active = false;
                })
                restoreActivedNodes.length = 0;
            }
            return this[RestoreActivedNodeHandler]
        }
        return null
    }
    
    /**
     * 
     */
    protected deactiveNodeInHierarchy(){
        if(this[RestoreActivedNodeHandler]){
            this[RestoreActivedNodeHandler]()
            this[RestoreActivedNodeHandler] = null;
        }
    }

    
    /**
     * 
     * @param eventHandler 
     * @returns 
     */
    protected _getMethodFromEventHandler(eventHandler:EventHandler):Function | null {
        if (eventHandler && eventHandler instanceof EventHandler) {
            const comp:Component|null = this._getComponentFromEventHandler(eventHandler)!;
            if(!comp) {
                return null; 
            }
            const handler:Function = comp![eventHandler.handler];
            if (!handler || typeof (handler) !== 'function') {
                return null; 
            }
            return handler.bind(comp, eventHandler?.customEventData);
        }
    }

    /**
     * 
     * @param eventHandler 
     * @returns 
     */
    protected _getComponentFromEventHandler(eventHandler:EventHandler):Component | null {
        if (eventHandler && eventHandler instanceof EventHandler) {
            const target:Node = eventHandler.target;
            if(!target) {
                return null;
            }
            const compType: Constructor<Component> = js.getClassByName(eventHandler._componentName) as Constructor<Component>;
            if(!compType) {
                return null;
            }
            const comp:Component = target!.getComponent<Component>(compType);
            if(!comp) {
                return null;
            }
            return comp;
        }
        return null;
    }


}






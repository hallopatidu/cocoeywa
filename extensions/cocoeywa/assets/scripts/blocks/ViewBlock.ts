import { _decorator, Component, director, DirectorEvent, EventHandler, js, log, Node, NodeEventType } from 'cc';
import { blocks, BlockTagInfo, GameBlock, OptionType, OverrideOption } from '../definition/cocoeywa.blocks';
import { utils } from '../definition/cocoeywa.utils';
import { DEV } from 'cc/env';
import { LocalRefID } from '../abstract/IntentBlock';
import { ReferenceDataType, ReferenceBlock } from '../abstract/ReferenceBlock';

const { ccclass, property, executeInEditMode } = _decorator;

const ViewModifier = Symbol('ViewModifier');
const ViewMainBlock = Symbol('ViewMainBlock');
const RegisterView = Symbol('Register');
const UnregisterView = Symbol('Unregister');

const OnChanged = Symbol('OnChanged');

export namespace view {
    export function createViewDecorator():Function {
        const ViewOverrideOptions:OverrideOption = {            
            onLoad(target:Component, blockTagInfos:Map<string, BlockTagInfo>){
                let mainBlock:ViewBlock = target[ViewMainBlock] ??= blocks.getMainBlock(ViewBlock);
                // For Persist Node
                const persitNode:Node = utils.getPersitParentNode(target?.node);
                if(persitNode){
                    persitNode.on(NodeEventType.SCENE_CHANGED_FOR_PERSISTS, ()=>{
                        // Ham chi tac dung voi Presit Node
                        // Go dang ky khi thay doi scene
                        ViewOverrideOptions.onDestroy(target, blockTagInfos);
                        // Tien hanh dang ky lai voi main block moi tren scene moi.
                        director.once(DirectorEvent.AFTER_SCENE_LAUNCH, ()=>{
                            mainBlock = target[ViewMainBlock] = blocks.getMainBlock(ViewBlock);
                            blockTagInfos.forEach((blockTagInfo:BlockTagInfo)=>{
                                const propName:string = blockTagInfo.prop;
                                mainBlock[RegisterView](target, propName, blockTagInfo);                                
                            })
                        })                        
                    })
                }
                //                 
                blockTagInfos.forEach((blockTagInfo:BlockTagInfo, methodName:string)=>{
                    mainBlock[RegisterView](target, methodName, blockTagInfo);
                })
            },
            onDestroy(target:Component, blockTagInfos:Map<string, BlockTagInfo>){
                // For Persist Node
                // const persitNode:Node = utils.getPersitParentNode(target?.node);
                // if(persitNode){
                //     target.node.off(NodeEventType.SCENE_CHANGED_FOR_PERSISTS);
                // }
                // 
                const mainBlock:ViewBlock = target[ViewMainBlock] ?? blocks.getMainBlock(ViewBlock);
                blockTagInfos.forEach((blockTagInfo:BlockTagInfo, methodName:string)=>{
                    mainBlock[UnregisterView](target, methodName, blockTagInfo);
                })
                target[ViewMainBlock] = null;
            },
        }
        return blocks.generatePropertyDecorator(ViewModifier, ViewOverrideOptions)
    }
}

@ccclass('ViewBlock')
// @executeInEditMode(true)
export class ViewBlock extends ReferenceBlock {

    static readonly Action:Function = view.createViewDecorator();

    private viewTokenMap:Record<string, string> = Object.create(null);    // map<ViewName, token>
    
    private mergedData:ReferenceDataType = Object.create(null);

    public getData<T>():T{
        return this.mergedData as unknown as T;
    }

    public getProxy<T>():T{
        return this.createProxy(this) as T
    }

    protected onLoad(): void {        
        super.onLoad && super.onLoad();
        this.viewTokenMap = Object.create(null);
        this.mergedData = Object.create(null);
    }

    protected onDestroy(): void {
        this.viewTokenMap = null;
        this.mergedData = null;
        super.onDestroy && super.onDestroy();
    }

    /**
     * 
     * @param component 
     * @param blockTagInfo 
     */
    [RegisterView](component:Component, methodName:string, blockTagInfo:BlockTagInfo) {
        const targetNode:Node = component.node;
        const viewNode:Node = utils.getPrefabRootNode(targetNode);
        const viewName:string = viewNode.name;
        const className:string = js.getClassName(component);
        const comps:Component[] = targetNode.getComponents(className);
        // 
        let methodKey:string = blockTagInfo.key;
        let methodDisplayName:string = methodName;
        const id:number = component[LocalRefID] ??= (comps.length > 1 ? comps.findIndex((comp:Component)=>comp==component) : -2);
        component[LocalRefID] = id.toString();
        methodKey = id >= 0 ? `${component[LocalRefID]}.${methodKey}` : methodKey;
        methodDisplayName = id !== undefined && id >= 0 ? `${component[LocalRefID]}.${methodDisplayName}` : methodDisplayName;
        const viewKey:string = `${viewName}.${methodKey}`
        const refKey:string = `${viewName}.${className}.${methodDisplayName}`;
        // 
        if(this.isValidPath(refKey) && DEV){
            throw new Error('The method is registed');
        }
        // 
        const token:string = this.addIntentRef(targetNode, className, methodKey, blockTagInfo.priority);
        this.viewTokenMap[viewKey] = token;
        this.addTokenPath(refKey, token);
        this[OnChanged](refKey);
    }

    /**
     * 
     * @param component 
     * @param blockTagInfo 
     */
    [UnregisterView](component:Component, methodName:string,  blockTagInfo:BlockTagInfo){
        const targetNode:Node = component.node;
        const viewNode:Node = utils.getPrefabRootNode(targetNode);
        const viewName:string = viewNode.name;
        const className:string = js.getClassName(component);
        // 
        let methodKey:string = blockTagInfo.key;
        let methodDisplayName:string = methodName;
        const id:number = component[LocalRefID];
        if(id === undefined) throw new Error("The component doesn't exist !")
        methodKey = (id !== undefined && id >= 0) ? `${component[LocalRefID]}.${methodKey}` : methodKey;
        methodDisplayName = (id !== undefined && id >= 0) ? `${component[LocalRefID]}.${methodDisplayName}` : methodDisplayName;
        // 
        const viewKey:string = `${viewName}.${methodKey}`;
        const refKey:string = `${viewName}.${className}.${methodDisplayName}`;
        const token:string = this.getTokenFromPath(refKey)
        if(token){            
            this.deleteTokenPath(refKey);
            this.removeIntentRef(token);
            delete this.viewTokenMap[viewKey];
            this[OnChanged](refKey);
        }
    }
    
    [OnChanged](referenceKey:string){
        const componentActionData:ReferenceDataType = utils.unflattenBySeparator(this.tokenPathInfos(),'.');
        this.mergedData = utils.deepMerge(utils.unflattenBySeparator(this.viewTokenMap, '.'), componentActionData)
        if(DEV){
            // log(`View Refs:: \n ${referenceKey}` , this.mergedData);
            
            //// let output:string[] = []
            //// utils.generateInterfaces(this.actions, 'IGameView', output)
            //// log('View Type:: \n' , output);
            //// log('View Type componentActionData:: \n' , utils.generateTypes(componentActionData, 'IGameView'));
            // log('View Type viewTokenMap:: \n' , utils.generateTypes(utils.unflattenBySeparator(this.viewTokenMap, '.'), 'IGameView'));
        }
    }

    /**
     * 
     * @param target 
     * @param path 
     * @returns 
     */
    protected createProxy(target: any, path: string[] = []): string {
        const _this:ViewBlock = this;
        return new Proxy(target, {
            get(obj, prop: string) {
                // Nếu prop là Symbol hoặc không phải string thì trả về mặc định
                if (typeof prop !== "string") {
                    return Reflect.get(obj, prop);
                }

                const newPathArr = [...path, prop];
                const newPath:string = newPathArr.join(".")
                // console.log("Access path:", path);
                const viewToken:string = _this.viewTokenMap[newPath]
                if(viewToken){
                    return viewToken;
                }
                const pathToken:string = _this.getTokenFromPath(newPath);
                if(pathToken){
                    return pathToken;
                }
                return _this.createProxy(target, newPathArr);                
            }
            // set(obj, prop: string, value) {
            //     const newPath = [...path, prop];
            //     if(Object.prototype.hasOwnProperty.call(obj, prop) && utils.isPrimitiveType(obj[prop])){                
            //         obj[prop] = value;
            //     }else{
            //         const token:string = _this.getTokenFromPath(newPath.join("."))
            //         if(_this.hasIntentRef(token)){
            //             const intentHandler:EventHandler = _this.getIntentRef(token);
            //             if(intentHandler){
            //                 const comp: Component | null = utils.getComponentFromEventHandler(intentHandler)!;
            //                 comp[intentHandler.handler] = value
            //             }
            //         }
            //     }
            //     return true;
            // }
        });
    }
    
}

Object.freeze(ViewBlock.prototype); // Không kế thừa ViewBlock

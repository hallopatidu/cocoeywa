import { __private, _decorator, Canvas, Component, Constructor, director, DirectorEvent, isValid, js, log, Node, Scene } from 'cc';
import { DEV } from 'cc/env';
import { utils } from 'db://cocoeywa/scripts/definition/cocoeywa.utils';
const { ccclass, property } = _decorator;

const OnValidMethodName:string = "onValidMethod";


export enum BlockLevel {
    GLOBAL,
    PREFAB,
    NODE
}

export type OptionType = {
    key?:string, 
    priority?:number
}
export type OverrideMethod = (thisComp:Component, blockTagInfo:Map<string, BlockTagInfo>)=>void;
export type ValidMethod = (target:any)=>boolean;

export type BlockTagInfo = {
    prop?:string,
    default?:unknown
} & OptionType

export type OverrideOption = {
    onLoad?:OverrideMethod,
    onDestroy?:OverrideMethod,
    [n:string]:OverrideMethod
}

type PropertyInitianizerDescriptor = {initializer?:Function} & PropertyDescriptor

export type PropertyOption = {
    target:unknown,
    key: string, 
    options:OptionType,    
    descriptor?: PropertyInitianizerDescriptor
}

@ccclass('GameBlock')
export class GameBlock extends Component {
    
}

export namespace blocks {    
    /**
     * 
     * @param blockKey 
     * @param overrideOptions 
     * @returns 
     */
    export function generatePropertyDecorator(blockKey:string|symbol, overrideOptions?:OverrideOption, validate?:ValidMethod){        
        return utils.generateImplicitDecorator((options:unknown, target: any, propertyKey: string, descriptor?: PropertyDescriptor)=>{
            // 
            if(DEV && validate && !validate(target)){
                throw new Error(`This decorator do not use for ${js.getClassName(target.constructor)}`);
            }

            const propertyOption:PropertyOption = {
                target,
                options:parseOptions(options, propertyKey),
                key: propertyKey,
                descriptor
            }
            
            initianizePrototype(blockKey, propertyOption, overrideOptions);            
            // 
        })
    }

    /**
     * 
     * @param blockKey 
     * @returns 
     */
    export function generateMethodDecorator(blockKey:string|symbol, overrideOptions?:OverrideOption, validate?:ValidMethod){
        return utils.generateImplicitDecorator((options:unknown, target: any, methodName: string, descriptor?: PropertyInitianizerDescriptor)=>{
            // 
            if(DEV && validate && !validate(target)){
                throw new Error(`This decorator do not use for ${js.getClassName(target.constructor)}`);
            }

            if(!descriptor.value || typeof descriptor.value !== 'function') {
                throw new Error(`Do not use this decorator for "${methodName}" property`);
            }
            const propertyOption:PropertyOption = {
                target,
                options:parseOptions(options, methodName),
                key:methodName,
                descriptor
            }
            initianizePrototype(blockKey, propertyOption, overrideOptions);
        })
    }

    /**
     * 
     * @param blockClass 
     * @returns 
     */
    export function getMainBlock<T extends Component>(blockClass:Constructor<T>, blockLevel:BlockLevel = BlockLevel.GLOBAL, fromNode?:Node): T {
        switch(blockLevel){
            case BlockLevel.NODE:
                return fromNode ? (fromNode.getComponent(blockClass) ?? fromNode.addComponent(blockClass)): getMainBlock(blockClass, BlockLevel.GLOBAL);

            case BlockLevel.PREFAB:
                if(fromNode && fromNode.parent){
                    const prefabNode:Node = utils.getPrefabRootNode(fromNode.parent);
                    return prefabNode.getComponent(blockClass) ?? prefabNode.addComponent(blockClass);
                }
                return getMainBlock(blockClass, BlockLevel.GLOBAL);

            case BlockLevel.GLOBAL:
                const scene = director.getScene();
                if (!scene) return null;
                
                const canvas = scene.getComponentInChildren(Canvas);
                if (!canvas) return null;

                // // Tim kiem Block tu scene
                // let blocks = scene.getComponentsInChildren(blockClass)?.filter((block:T)=>!utils.isNodeOfPrefab(block.node));
                // if (blocks && blocks[0]) return blocks[0];

                return canvas.node.getComponent(blockClass) ?? canvas.node.addComponent(blockClass);
        }
    }

    /**
     * 
     * @param blockClass 
     * @param fromNode 
     * @returns 
     */
    export function findMainBlock<T extends Component>(blockClass:Constructor<T>, fromNode:Node): T {
        const prefabNode:Node = utils.getPrefabRootNode(fromNode);

        const block:T = prefabNode?.getComponent(blockClass);
        return block ? block : ( !!fromNode.parent ? findMainBlock(blockClass, fromNode.parent) : getMainBlock(blockClass, BlockLevel.GLOBAL) );
    }

    
    
    // ------------------------

    /**
     * 
     * @param blockClass 
     * @returns 
     */
    function getGlobalBlock<T extends Component>(blockClass:Constructor<T>): T{
        const scene = director.getScene();
        if (!scene) return null;

        let block = scene.getComponentInChildren(blockClass);
        if (block) return block;

        const canvas = scene.getComponentInChildren(Canvas);
        if (!canvas) return null;

        return canvas.node.addComponent(blockClass);
    }

    /**
     * 
     * @param blockKey 
     * @param propertyOption 
     * @param overrideOptions 
     */
    function initianizePrototype(blockKey:string|symbol, propertyOption:PropertyOption, overrideOptions?:OverrideOption){
        const target:any = propertyOption.target; 
        const targetKey:string = propertyOption?.key;
        const descriptor:PropertyInitianizerDescriptor = propertyOption?.descriptor;
        const initializer:Function = descriptor?.initializer;
        const options: OptionType = propertyOption.options;
        const ctor:Constructor<Component> = target.constructor;        
        let overrideList:Map<string, BlockTagInfo>|null = getBlockTagInfo(blockKey, ctor);
        if(!overrideList){
            // jsut running one per class.
            // target is a intializer of class. So, we should save 'blockKey' to constructor as a static properties
            overrideList = ctor[blockKey] = new Map<string, BlockTagInfo>();            
            // Nang cap lifecycle
            for (const key in overrideOptions) {
                if (!Object.prototype.hasOwnProperty.call(overrideOptions, key)) continue;                
                const overrideFunction:OverrideMethod = overrideOptions[key];            
                if (typeof overrideFunction === 'function') {
                    target[key] = (function(originalFunction:Function){
                        return function(){                                        
                            originalFunction && originalFunction.call(this);
                            overrideFunction(this, overrideList);  
                        }
                    })(target[key]);
                }
                // 
            }
        }
        // Merge all tagInfo in the same Classes.
        const blockTagInfo:BlockTagInfo = options ?? Object.create(null);
        blockTagInfo.prop = targetKey;
        blockTagInfo.default = initializer?.call(target) ?? (typeof descriptor?.value !== 'function' ? descriptor?.value : null)
        overrideList.set(targetKey, Object.assign( overrideList.get(targetKey)??{} , blockTagInfo));
        // 
    }

    /**
     * Get BlocTagInfo
     * We should save 'blockKey' to constructor as a static properties.
     * @param blockKey 
     * @param ctor 
     * @returns 
     */
    function getBlockTagInfo(blockKey:string|symbol, ctor:Constructor<Component>):Map<string, BlockTagInfo>|null{
        if(ctor[blockKey]){
            return ctor[blockKey] as Map<string, BlockTagInfo>;
        }
        const supCtor:Constructor<Component> = js.getSuper(ctor);        
        return supCtor && utils.isCustomClass(supCtor) ? getBlockTagInfo(blockKey, supCtor) : null;        
    }
    

    /**
     * 
     * @param options 
     * @param defaultKey 
     * @returns 
     */
    function parseOptions(options:unknown, defaultKey:string):OptionType{
        const isString:boolean = !!(options && (typeof options == 'string'));
        const key:string = isString ? options ?? defaultKey : (options as any)?.key ?? defaultKey;
        const priority: number =  isString ? 0 : (options as any)?.priority ?? 0;
        return {key, priority}
    }

}




/**
 * 
 * @param options 
 * @param defaultKey 
 * @returns 
 */
// function parseOptions(options:unknown, defaultKey:string):OptionType{
//     const isString:boolean = !!(options && (typeof options == 'string'));
//     const key:string = isString ? options ?? defaultKey : (options as any)?.key ?? defaultKey;
//     const priority: number =  isString ? 0 : (options as any)?.priority ?? 0;
//     return {key, priority}
// }
import { _decorator, Canvas, Component, director, DirectorEvent, EventHandler, isValid, js, log, Node, NodeEventType, Scene } from 'cc';
import { BlockLevel, blocks, BlockTagInfo, GameBlock, OverrideOption } from '../definition/cocoeywa.blocks';
import { utils } from '../definition/cocoeywa.utils';
import { DEV } from 'cc/env';
import { LocalRefID } from '../abstract/IntentBlock';
import { ReferenceDataType, ReferenceBlock } from '../abstract/ReferenceBlock';
const { ccclass, property } = _decorator;

const DataModifier = Symbol('DataModifier');
const DataMainBlock = Symbol('DataMainBlock');
const RegisterData = Symbol('Register');
const UnregisterData = Symbol('Unregister');
const InitData = Symbol('InitData');
const SetData = Symbol('SetData');
const GetData = Symbol('GetData');

const OnChanged = Symbol('OnChanged');

enum DataMethodType {
    GET,
    SET,
    GET_SET
}

export namespace data {
    
    /**
     * 
     * @param dataMethod 
     * @param blockLevel 
     * @returns 
     */
    export function createDataDecorator<T = unknown>(dataMethod:DataMethodType, blockLevel:BlockLevel = BlockLevel.GLOBAL):Function {
        const DataOverideOptions:OverrideOption = {
            onLoad(target:Component, blockTagInfos:Map<string, BlockTagInfo>){
                let mainBlock:DataBlock<T> = blocks.getMainBlock<DataBlock<T>>(DataBlock, BlockLevel.GLOBAL);              
                let nearestDataBlock:DataBlock<T> = target[DataMainBlock] ??= blocks.getMainBlock(DataBlock, blockLevel, target.node);

                // For Persist Node
                const persitNode:Node = utils.getPersitParentNode(target?.node);
                if(persitNode){
                    persitNode.on(NodeEventType.SCENE_CHANGED_FOR_PERSISTS, ()=>{
                        // Ham chi tac dung voi Presit Node
                        // Go dang ky khi thay doi scene
                        DataOverideOptions.onDestroy(target, blockTagInfos);                        
                        // Tien hanh dang ky lai voi main block moi tren scene moi.
                        director.once(DirectorEvent.AFTER_SCENE_LAUNCH, ()=>{
                            mainBlock = blocks.getMainBlock<DataBlock<T>>(DataBlock, BlockLevel.GLOBAL);
                            blockTagInfos.forEach((blockTagInfo:BlockTagInfo)=>{
                                const propName:string = blockTagInfo.prop;
                                const privateKey:string = DataBlock.getPrivateProperty(propName);
                                nearestDataBlock = target[DataMainBlock] = blocks.getMainBlock<DataBlock<T>>(DataBlock, blockLevel, target.node);
                                const current = target[privateKey] ??= nearestDataBlock[GetData](propName);
                                nearestDataBlock[InitData](propName, current ?? blockTagInfo.default);                               
                                mainBlock[RegisterData](target, propName, blockTagInfo);
                            })
                        })
                        
                    })
                }
                // 
                
                if(nearestDataBlock && nearestDataBlock !== target){
                    // 
                    blockTagInfos.forEach((blockTagInfo:BlockTagInfo)=>{
                        const propKey:string = blockTagInfo.key;
                        const privateKey:string = DataBlock.getPrivateProperty(propKey);
                        const current = target[privateKey] ??= nearestDataBlock[GetData](propKey);                  
                        
                        nearestDataBlock[InitData](propKey, current ?? blockTagInfo.default);
                        // 
                        const desc:PropertyDescriptor = utils.getDeepPropertyDescriptor(target, propKey);
                        if(desc && typeof desc.value == 'function'){
                            throw new Error(`The decorate @game.data just use for properties`)
                        }
                        // 
                        mainBlock && mainBlock[RegisterData](target, propKey, blockTagInfo);
                        // 
                        js.getset(target, 
                            propKey, 
                            function(){ // getter
                                if(dataMethod !== DataMethodType.SET) { 
                                    return nearestDataBlock[GetData](propKey)   
                                }else {  
                                    return desc.get ? desc.get.call(this) : this[privateKey];  
                                }
                            },
                            function (value:any){ // setter
                                this[privateKey] = value;
                                if(dataMethod == DataMethodType.GET) {                                      
                                    desc.set && desc.set?.call(this, value);
                                }else{ 
                                    nearestDataBlock[SetData](propKey, value);
                                } 
                            }, 
                            desc?.enumerable ?? true                            
                        );
                        // 
                    })
                }
            },
            onDestroy(target:Component, blockTagInfos:Map<string, BlockTagInfo>){
                // For Persist Node
                const isPersistRootNode:boolean = director.isPersistRootNode(target.node);
                if(!isPersistRootNode){
                    const mainBlock:DataBlock<T> = blocks.getMainBlock<DataBlock<T>>(DataBlock, BlockLevel.GLOBAL);
                    const nearestDataBlock:DataBlock<T> = target[DataMainBlock];
                    if(nearestDataBlock && nearestDataBlock !== target){
                        blockTagInfos.forEach((blockTagInfo:BlockTagInfo)=>{
                            const propKey:string = blockTagInfo.key;
                            // Voi persit node khong xoa cac thuoc tinh private vi component van con su dung.
                            delete target[DataBlock.getPrivateProperty(propKey)];
                            mainBlock && mainBlock[UnregisterData](target, propKey, blockTagInfo);
                        })
                    }
                    target[DataMainBlock] = undefined;
                }
            }
        }
        
        return blocks.generatePropertyDecorator(DataModifier, DataOverideOptions);
    }

    export const property:Function = createDataDecorator(DataMethodType.GET, BlockLevel.GLOBAL);

    export namespace prefab {
        export const binding:Function = createDataDecorator(DataMethodType.GET_SET, BlockLevel.PREFAB);
    }

    export namespace node {
        export const binding:Function = createDataDecorator(DataMethodType.GET_SET, BlockLevel.NODE);
    }
}



@ccclass('DataBlock')
export class DataBlock<T> extends ReferenceBlock {

    static getPrivateProperty(propName:string):string {
        return `__$${propName}$__`;
    }

    static readonly Getter:Function = data.createDataDecorator(DataMethodType.GET, BlockLevel.GLOBAL);
    static readonly Binding:Function = data.createDataDecorator(DataMethodType.GET_SET, BlockLevel.GLOBAL);

    @property({serializable:true})
    private _mainBlock: DataBlock<T>;



    
    get data(): T {
        if(!this._data){
            this._data = Object.create(null);
        }
        return this._data;
    } 
    // --------------
    private _data: T = null;
    private _mergedData: ReferenceDataType = null;


    protected get mainBlock(): DataBlock<T> {
        if(!this._mainBlock){
            this._mainBlock = this[DataMainBlock] ?? blocks.getMainBlock(DataBlock, BlockLevel.GLOBAL)
        }
        return this._mainBlock;
    }

    get mergedData(): ReferenceDataType {
        return this._mergedData;
    }
    
    getProxy<R>():R{
        return this.createProxy(this.data) as R;
    }
    
    // --------------
    [InitData](key:string, value:any){
        if(this.data[key] === undefined || this.data[key] === null){
            this.data[key] = value;
        }
    }

    [SetData](key:string, value:any){
        this.data[key] = value;
    }
    [GetData](key:string):any{
        return this.data[key];
    }

    protected onLoad(): void {
        this._data = Object.create(null);
        super.onLoad && super.onLoad();
    }

    protected onDestroy(): void {
        this._mainBlock = null;
        this._data = null;
        super.onDestroy && super.onDestroy();
    }

    // start() {
    //     if(DEV && this === this.mainBlock){
    //         if(DEV){
    //             log('Data Refs:: ' , this.data);
    //             log('Type:: \n' , utils.generateInterfaces(this.data, 'IGameData'));
    //         }
    //     }
    // }

    [RegisterData](component:Component, propKey:string, blockTagInfo:BlockTagInfo) {
        const targetNode:Node = component.node;
        const viewNode:Node = utils.getPrefabRootNode(targetNode);
        const viewName:string = viewNode.name;
        const className:string = js.getClassName(component);
        const comps:Component[] = targetNode.getComponents(className);
        // 
        let propertyDisplayName:string = propKey;
        const id:number = component[LocalRefID] ??= (comps.length > 1 ? comps.findIndex((comp:Component)=>comp==component) : -2);
        component[LocalRefID] = id.toString();
        // 
        propertyDisplayName = id !== undefined && id >= 0 ? `${component[LocalRefID]}.${propertyDisplayName}` : propertyDisplayName;        
        const pathKey:string = `${viewName}.${className}.${propertyDisplayName}`;
        // 
        if(this.isValidPath(pathKey) && DEV){
            throw new Error('The method is registed ' + pathKey);
        }
        // 
        const token:string = this.addIntentRef(targetNode, className, propertyDisplayName, blockTagInfo.priority);        
        this.addTokenPath(pathKey, token);
        this[OnChanged](pathKey);
    }

    [UnregisterData](component:Component, propKey:string,  blockTagInfo:BlockTagInfo){
        const targetNode:Node = component.node;
        const viewNode:Node = utils.getPrefabRootNode(targetNode);
        const viewName:string = viewNode.name;
        const className:string = js.getClassName(component);
        // 
        let propertyDisplayName:string = propKey;
        const id:number = component[LocalRefID];
        if(id === undefined) {
            throw new Error("The component doesn't exist !")
        }
        // 
        propertyDisplayName = (id !== undefined && id >= 0) ? `${component[LocalRefID]}.${propertyDisplayName}` : propertyDisplayName;
        // 
        const pathKey:string = `${viewName}.${className}.${propertyDisplayName}`;
        const token:string = this.getTokenFromPath(pathKey)
        if(token){            
            this.deleteTokenPath(pathKey);
            this.removeIntentRef(token);
            this[OnChanged](pathKey);
        }
    }


    [OnChanged](pathKey:string){
        const compData:ReferenceDataType = utils.unflattenBySeparator(this.tokenPathInfos(),'.');
        this._mergedData = utils.deepMerge<ReferenceDataType>(this.data as ReferenceDataType, compData);
        if(DEV){
            // log(`View Refs:: \n ${pathKey}` , this._mergedData);

            //// let output:string[] = []
            //// utils.generateInterfaces(this.actions, 'IGameView', output)
            //// log('View Type:: \n' , output);
            //// log('View Type componentActionData:: \n' , utils.generateTypes(componentActionData, 'IGameView'));

            // log('\n' , utils.generateTypes(this._mergedData, 'IGameData'));
            
        }
    }    

    /**
     * 
     * @param target 
     * @param path 
     * @returns 
     */
    protected createProxy(target: any, path: string[] = []): unknown {
        const _this:DataBlock<T> = this;
        return new Proxy(target, {
            get(obj, prop: string) {
                // Nếu prop là Symbol hoặc không phải string thì trả về mặc định
                if (typeof prop !== "string") {
                    return Reflect.get(obj, prop);
                }

                const newPathArr = [...path, prop];
                // const newPath:string = newPathArr.join(".")
                // console.log("Access path:", path);

                const value = obj[prop];
                // Nếu value là object thì tiếp tục tạo Proxy để theo dõi sâu hơn
                if (value && typeof value === "object") {
                    return js.isEmptyObject(value) ? value : _this.createProxy(value, newPathArr);
                }else if(typeof value === 'string'){
                    const token:string = value;
                    if(_this.hasIntentRef(token)){
                        const intentHandler:EventHandler = _this.getIntentRef(token)
                        if(intentHandler){
                            const comp: Component | null = utils.getComponentFromEventHandler(intentHandler)!;
                            return comp[DataBlock.getPrivateProperty(intentHandler.handler)]
                        }
                    }
                }
                // 
                return value;
            },
            set(obj, prop: string, value) {
                const newPathArr = [...path, prop];
                const newPath:string = newPathArr.join(".")
                // const newPath:string = path.length ? newPathArr.join(".") : prop;
                const pathToken:string = _this.getTokenFromPath(newPath);
                if(pathToken){
                    if(_this.hasIntentRef(pathToken)){
                        const intentHandler:EventHandler = _this.getIntentRef(pathToken);
                        if(intentHandler){
                            const comp: Component | null = utils.getComponentFromEventHandler(intentHandler)!;
                            comp[intentHandler.handler] = value;
                        }
                    }
                }else if(Object.prototype.hasOwnProperty.call(obj, prop)){
                    obj[prop] = value;
                }
                return true

                // if(Object.prototype.hasOwnProperty.call(obj, prop) && utils.isPrimitiveType(obj[prop])){                
                if(Object.prototype.hasOwnProperty.call(obj, prop)){
                    obj[prop] = value;
                }else{
                    const token:string = _this.getTokenFromPath(newPath)
                    if(_this.hasIntentRef(token)){
                        const intentHandler:EventHandler = _this.getIntentRef(token);
                        if(intentHandler){
                            const comp: Component | null = utils.getComponentFromEventHandler(intentHandler)!;
                            comp[intentHandler.handler] = value
                        }
                    }
                }
                return true;
            }
        });
    }

}

Object.freeze(DataBlock.prototype); // Không kế thừa DataBlock

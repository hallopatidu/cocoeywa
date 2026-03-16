import { __private, assetManager, CCClass, cclegacy, Component, director, error, EventHandler, js, JsonAsset, Node, Prefab, Scene, ValueType } from "cc";
import { EDITOR } from "cc/env";
// import { AssetInfo } from "../../../../@cocos/creator-types/editor/packages/asset-db/@types/public";
import { LegacyPropertyDecorator, PrimitiveType, PropertyStash, SimplePropertyType, Trackable, Tracked } from "./cocoeywa.types";
import { CACHE_KEY } from "./cocoeywa.constants";
import { AssetInfo } from "@cocos/creator-types/editor/packages/asset-db/@types/public";


// Luu y : IT STILL BE NOT-REFACTOR CLASS
export namespace utils {

    export namespace editor {
        /**
         * Export tham chiếu giữa các Custom Components trong scene hiện tại.
         * @param scene 
         * @returns 
         */
        export function findReferences(scene:Scene = director.getScene()): Record<string, string[]> {        
            const refs: Record<string, string[]> = {};
            const traverse = (node: Node) => {
                for (const comp of node.components) {
                    if(classes.isCustomClass(comp['constructor'] as (new (...args: any[]) => any))){
                        const from = comp.constructor.name;
                        refs[from] ??= [];                        
                        for (const key of Object.keys(comp)) {                        
                            const val = (comp as any)[key];
                            if (val instanceof Component) {
                                classes.isCustomClass(val.constructor as (new (...args: any[]) => any)) && refs[from].push(val.constructor.name);
                            } else if (Array.isArray(val)) {
                                refs[from].push(...val.filter((v:Component) => v instanceof Component && classes.isCustomClass(val.constructor as (new (...args: any[]) => any)) ).map(v => v.constructor.name));
                            }
                        }
                    }
                }
                node.children.forEach(traverse);
            };

            scene?.children.forEach(traverse);
            // return this.flattenReferences(refs);
            return refs;
        }

        /**
         * 
         * @param fileName 
         * @param folderUrl 
         * @param fileContent 
         */
        export async function updateJSONFile(fileName: string, folderUrl: string, fileContent: any, forceReset: boolean = true) {
            if (!EDITOR) {
                // game.config.effectSettingsPath
                return;
            }
            let saveFilePath: string = `${folderUrl}/${fileName}`;
            let assetInfo: AssetInfo = await Editor.Message.request('asset-db', 'query-asset-info', saveFilePath);
            if (!assetInfo) {
                let savedContent: string
                if (typeof fileContent !== 'string') {
                    savedContent = JSON.stringify(fileContent)
                }
                assetInfo = await Editor.Message.request('asset-db', 'create-asset', saveFilePath, savedContent);

            } else {
                let savedContent: any = fileContent
                if (typeof fileContent == 'string') {
                    savedContent = JSON.parse(fileContent);
                }
                let content: Record<string, any> = await new Promise((resolve: Function) => {
                    assetManager.loadAny({ uuid: assetInfo.uuid }, (err, jsonAsset: JsonAsset) => {
                        if (err) {
                            error("Lỗi load JSON:", err, ' -path: ' + saveFilePath);
                            return;
                        }
                        const data = jsonAsset.json;
                        resolve(data);
                    });
                })
                content = forceReset ? savedContent : Object.assign(content, savedContent);
                assetInfo = await Editor.Message.request('asset-db', 'save-asset', saveFilePath, JSON.stringify(content));

            }
            await Editor.Message.request('asset-db', 'refresh-asset', assetInfo.uuid);
            await Editor.Message.request('scene', 'save-scene');
        }

        /**
         * 
         * @param node 
         * @returns 
         */
        export function getPrefabAssetUUID(node:Node):string{
            if(!node) return null;
            const prefab:Prefab = node && node['_prefab'] ? node['_prefab']['asset'] : null;
            return prefab ? prefab.uuid : null;
        }

        /**
        * 
        * @param node 
        * @returns 
        */
        export function getPrefabAssetName(node:Node):string{
            if(!node) return null;
            const prefab:Prefab = node && node['_prefab'] ? node['_prefab']['asset'] : null;
            return prefab ? prefab.name : null;
        }

        /**
         * 
         * @param node 
         * @returns 
         */
        export function isNodeOfPrefab(node:Node):boolean{
            if(!node) return null;
            return !!node['_prefab'] && !!node['_prefab']['asset']
        }

        /**
         * 
         * @param node 
         * @param filterMethod 
         * @returns 
         */
        export function getCustomComponentsInChildren<T extends Component>(node:Node, filterMethod?:(comp:Component, componentClass:__private.__types_globals__Constructor )=>boolean):T[]{
            const components:Component[] = node.getComponentsInChildren(Component) || [];
            return components.filter((component:Component) => {
                const classConstructor:__private.__types_globals__Constructor = js.getClassByName(js.getClassName(component));
                return classes.isCustomClass(classConstructor) && (filterMethod ? filterMethod(component, classConstructor) : true);
            }) as T[];
        }


        /**
         * 
         * @param targetNode 
         * @returns 
         */
        export function getPrefabRootNode(targetNode:Node):Node{
            if(targetNode && targetNode.parent){
                let investigatedUUID:string = editor.getPrefabAssetUUID(targetNode);
                let parentPrefabUUID:string = editor.getPrefabAssetUUID(targetNode.parent);
                return (investigatedUUID !== parentPrefabUUID) ? (parentPrefabUUID ? this.getPrefabRootNode(targetNode.parent) : targetNode ) : this.getPrefabRootNode(targetNode.parent); 
                // return (!parentPrefabUUID || investigatedUUID !== parentPrefabUUID) ? (parentPrefabUUID ? targetNode.parent : targetNode) : this.getPrefabRootNode(targetNode.parent);            
            }
            return targetNode;
        }

        /**
         * 
         * @param targetNode 
         * @returns 
         */
        export function getPersitParentNode(targetNode:Node):Node{
            if(targetNode){
                return director.isPersistRootNode(targetNode) ? targetNode : getPersitParentNode(targetNode.parent);
            }
            return null
        }

        /**
         * 
         * @param comp 
         * @param data 
         * @param fillter 
         * @returns 
         */
        // export function extractProperties(comp:Component, data?:Record<string, Record<string, SimplePropertyType>> , fillter?:(out:Record<string, Record<string, any>>, key:string, suffix:string, value:unknown)=>void){        
        export function extractProperties(comp:Component, data?:Record<string, Record<string, SimplePropertyType>> , fillter?:(out: Record<string, any>, paths: string[], value: unknown) => void){
            const propObj:Record<string, Record<string, SimplePropertyType>|Array<Record<string, SimplePropertyType>> > = data || Object.create(null);
            const className:string = js.getClassName(comp);
            const classContructor = js.getClassByName(className);
            const attrs = this.getClassAttrs(classContructor);
            const properties:any = strings.unflattenBySeparator(attrs, CCClass.Attr.DELIMETER, fillter);
            // 
            if(!propObj[className]){
                propObj[className] = Object.create(null);
                Object.assign(propObj[className], properties);
                return propObj;
            }else if(propObj[className] && !Array.isArray(propObj[className])){
                const lastClassProperties:Record<string, SimplePropertyType> = propObj[className];
                propObj[className] = [lastClassProperties];
            }
            (propObj[className] as Array<Record<string, SimplePropertyType>>).push(properties);
            // 
            return propObj
        }
        
    }// end EditorUtil


    export namespace classes {
        /**
         * Để sử dụng utils.editor, cần export Editor.d.ts vào root folder của project.
         * Developer > Export.d.ts
         */
        const cocosBuiltinClasses: Set<string> = new Set(getBuiltinCocosClasses());

        /**
         * 
         * @returns 
         */
        export function getBuiltinCocosClasses(): string[] {
            const UpercaseRegex:RegExp = /^[A-Z]/;
            // const UpercaseRegex:RegExp = /^([A-Z][a-z]*)(\s+[A-Z][a-z]*)*$/;
            const builtinClasses: string[] = [];
            const namespaces: any = cc || cclegacy;
            for (const key in namespaces) {            
                const item = (namespaces as any)[key];
                const isFirstUpercase:boolean = UpercaseRegex.test(key);
                const classId:unknown = js.getClassId(item)
                // Kiểm tra xem item là một class constructor
                if (typeof item === 'function' && isFirstUpercase && js.isChildClassOf(item, Component)) {
                    builtinClasses.push(js.getClassId(item));
                }
            }

            return builtinClasses;
        }

        /**
         * 
         * @param ctorOrName 
         * @returns 
         */

        export function isCustomClass(ctorOrName: string | (new (...args: any[]) => any)): boolean {
            const classId:string = typeof ctorOrName == 'string' ? js.getClassId(js.getClassByName(ctorOrName)) : js.getClassId(ctorOrName);
            if (!classId) {
                return false;
            }
            return !cocosBuiltinClasses.has(classId);
        }

        /**
         * 
         * @param object 
         * @param propertyName 
         * @returns 
         */
        export function getDeepPropertyDescriptor(object: any, propertyName: string):PropertyDescriptor{
            while (object) {
                const desc:PropertyDescriptor = js.getPropertyDescriptor(object, propertyName);
                if (desc) return desc;
                object = Object.getPrototypeOf(object);
            }            
        }

        /**
         * 
         * @param classContructor 
         * @param lastAttributes 
         * @returns 
         */
        export function getClassAttrs(classContructor:any, lastAttributes:Record<string, unknown> = {}):Record<string, unknown>{
            const attributes:any = Object.assign(lastAttributes, CCClass.Attr.getClassAttrs(classContructor) );
            const superConstructor = js.getSuper(classContructor);
            return (superConstructor && superConstructor  !== Component) ? this.getClassAttrs(superConstructor, attributes) : attributes;
            
        }


        /**
         * 
         * @param target 
         * @param propertyKey 
         * @param descriptorOrInitializer 
         * @returns 
         */
        export function getOrCreatePropertyStash (
            target: Parameters<LegacyPropertyDecorator>[0],
            propertyKey: Parameters<LegacyPropertyDecorator>[1],
            descriptorOrInitializer?: Parameters<LegacyPropertyDecorator>[2],
        ): PropertyStash {
            const classStash:unknown = target.constructor[CACHE_KEY] || ((target.constructor[CACHE_KEY]) = {});
            const ccclassProto = this.getSubDict(classStash, 'proto' as never);
            const properties:any = this.getSubDict(ccclassProto, 'properties' as never);
            const propertyStash:PropertyStash = properties[(propertyKey as string)] ??= {} as PropertyStash;
            // 
            if (descriptorOrInitializer && typeof descriptorOrInitializer !== 'function' && (descriptorOrInitializer.get || descriptorOrInitializer.set)) {
                if (descriptorOrInitializer.get) {
                    propertyStash.get = descriptorOrInitializer.get;
                }
                if (descriptorOrInitializer.set) {
                    propertyStash.set = descriptorOrInitializer.set;
                }
            } 
            // 
            return propertyStash;
        }

        /**
         * 
         * @param modifier 
         * @returns 
         */
        export function generateImplicitDecorator(modifier:(options:unknown, target: any, propertyKey: string, descriptor?: PropertyDescriptor)=>void):Function {
            const decorateMethod = function(target?: unknown, propertyKey?: string, descriptor?: PropertyDescriptor): any | void {
                let options: unknown = null;
                function normalized (target: any, propertyKey: string, descriptor?: PropertyDescriptor) {                    
                    modifier(options, target, propertyKey, descriptor);
                }
                
                if (target === undefined) {
                    return decorateMethod();
                } else if (typeof propertyKey === 'undefined') {
                    options = target as unknown;
                    return normalized;
                } else {
                    // @on
                    normalized(target, propertyKey, descriptor);
                    return undefined;
                }
            }
            return decorateMethod;
        }
    }

    export namespace strings {

        /**
         * 
         * @param input 
         * @returns 
         */
        export function pascalCase(input: string): string { 
            return input.replace(/^\s+|\s+$/g, '').replace(/\s+/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase()).replace(/\s+/g, ''); 
        }

        /**
         * const template:string = "https://example.com/page/${pageIndex}/user/${userId}/lang/${lang}";
         * const values = {
         *   pageIndex: 5,
         *   userId: "abc123",
         *   lang: "en"
         * };
         * const result:string = replaceParameters(template, values);
         * console.log(result);
         * @param template 
         * @param variables 
         * @returns 
         */
        export function replaceParameters(template: string, variables: Record<string, string | number>): string {
            try{
                return template.replace(/\$\{(\w+)\}/g, (_, key) => key in variables ? (variables[key] || '').toString() : `\${${key}}`);
            }catch(err) {
                error(`replaceParameters fail ` + err);
            }
            return null
        }

        /**
         * 
         * @param str 
         * @param length 
         * @returns 
         */
        export function hashShort(str: string, length: number = 8): string {
            // Tạo hash số nguyên bằng FNV-1a
            let hash = 2166136261;
            for (let i = 0; i < str.length; i++) {
                hash ^= str.charCodeAt(i);
                hash = Math.imul(hash, 16777619);
            }
            // Chuyển sang base36 để ngắn gọn hơn
            const base36 = (hash >>> 0).toString(36);
            // Cắt chuỗi theo độ dài mong muốn
            return base36.substring(0, length);
        }

        // export function escapeRegExp(str: string) {
        //     return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        // }

        /**
         * 
         * @param obj 
         * @param sep 
         * @returns 
         */
        // export function unflattenBySeparator(obj: Record<string, any>, sep = '$_$', filter?:(out:Record<string, Record<string, any>>, key:string, suffix:string, value:unknown)=>void): Record<string, Record<string, any>> {
        export function unflattenBySeparator(obj: Record<string, any>, sep = '$_$', filter?: (
            out: Record<string, any>,
            paths: string[],
            value: unknown
        ) => void ): Record<string, Record<string, any>> {
            const out: Record<string, any> = {};
            for (const k in obj) {
                if (!Object.prototype.hasOwnProperty.call(obj, k)) continue;
                const value = obj[k];
                const paths = k.split(sep);
                if (filter) {
                    filter(out, paths, value);
                    continue;
                }
                let cur = out;
                for (let i = 0; i < paths.length; i++) {
                const p = paths[i];
                if (i === paths.length - 1) {
                    cur[p] = value;
                } else {
                    if (!cur[p] || typeof cur[p] !== 'object') {
                    cur[p] = {};
                    }
                    cur = cur[p];
                }
                }
            }

            return out;
        }

        /**
         * 
         * @param input 
         * @param seed 
         * @returns 
         */
        export function generateUUID(input: string, seed: number): string {
            let hash:number = seed;
            for (let i = 0; i < input.length; i++) {
                hash = Math.imul(hash + input.charCodeAt(i), 31);
            }
            return 'xxxxxxxx.xxxx'.replace(/[x]/g, () => {
                hash = Math.imul(hash ^ (hash >>> 13), 0x5bd1e995);
                return ((hash >>> 0) % 16).toString(16);
            });
        }

        /**
         * 
         * @param input 
         * @param seed 
         * @returns 
         */
        export function generateEmbedToken(input: string, seed: number): string {
            let h1:number = 0xdeadbeef ^ seed;
            let h2:number = 0x41c6ce57 ^ seed;

            for (let i = 0; i < input.length; i++) {
                const ch = input.charCodeAt(i);
                h1 = Math.imul(h1 ^ ch, 2654435761);
                h2 = Math.imul(h2 ^ ch, 1597334677);
            }

            h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
            h2 = Math.imul(h2 ^ (h2 >>> 13), 3266489909);

            return ((h1 >>> 0).toString(36) + (h2 >>> 0).toString(36));
        }

        export function isHash(str: string): boolean {
            if (str.length < 6 || str.length > 64) return false; // quá ngắn/dài
            if (!/^[0-9a-zA-Z]+$/.test(str)) return false;     // ký tự lạ
            if ((str.match(/_/g) || []).length > 0) return false; // underscore -> loại

            // Base36/base62 regex
            const base36 = /^[0-9a-z]{6,32}$/;   
            const base62 = /^[0-9a-zA-Z]{6,32}$/; 
            if (!base36.test(str) && !base62.test(str)) return false;

            // --- Entropy check chỉ dùng cho string dài ---
            if (str.length > 12) {
                const entropy = shannonEntropy(str);

                let threshold: number;
                if (str.length <= 16) threshold = 3.5; 
                else if (str.length <= 32) threshold = 4.0;
                else threshold = 4.5;

                if (entropy < threshold) return false;
            }else{
                // Nếu string quá ngắn (<6) hoặc quá dài (>32) → không phải hash
                if (str.length < 6 || str.length > 32) return false;

                // Nếu string chứa ký tự đặc biệt không phải 0-9a-zA-Z → có thể không phải hash
                if (!/^[0-9a-zA-Z]+$/.test(str)) return false;

                // Nếu string chứa nhiều chữ in hoa hoặc dấu '_' → có thể không phải hash
                if (/[A-Z_]/.test(str)) return false;

                // Nếu string đủ ngắn và trông ngẫu nhiên → có khả năng là hash
                return true;
            }

            return true;
        }

        function shannonEntropy(str: string): number {
            const len = str.length;
            const freq: Record<string, number> = {};

            for (const char of str) {
                freq[char] = (freq[char] || 0) + 1;
            }

            let entropy = 0;
            for (const char in freq) {
                const p = freq[char] / len;
                entropy -= p * Math.log2(p);
            }

            return entropy;
        }


    }// end StringUtils


    export namespace functions {                
        /**
         * 
         * @param eventHandler 
         * @returns 
         */
        export function getMethodFromEventHandler(eventHandler: EventHandler): Function | null {
            if (eventHandler && eventHandler instanceof EventHandler) {
                const comp: Component | null = this.getComponentFromEventHandler(eventHandler)!;
                if (!comp) {
                    return null;
                }
                const handler: Function = comp![eventHandler.handler];
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
        export function getComponentFromEventHandler(eventHandler: EventHandler): Component | null {
            if (eventHandler && eventHandler instanceof EventHandler) {
                const target: Node = eventHandler.target;
                if (!target) {
                    return null;
                }
                
                const compType: __private.__types_globals__Constructor<Component> = js.getClassByName(eventHandler._componentName) as __private.__types_globals__Constructor<Component>;
                if (!compType) {
                    return null;
                }
                const comp: Component = target!.getComponent<Component>(compType);
                if (!comp) {
                    return null;
                }
                return comp;
            }
            return null;
        }
        
        /**
         * 
         * @param func 
         * @param args 
         * @returns 
         */
        export async function asyncCall(func:Function, ...args:any[]):Promise<any>{
            const result:any = func(...args);
            if ((result instanceof Promise) || (typeof result === 'object' && typeof result.then === 'function')) {            
                return await result;
            }
            return result;
        }
        
        /**
         * 
         * @param func 
         * @param timeout 
         * @param args 
         * @returns 
         */
        export async function callWithTimeout<T = unknown>(func: Function, options:{timeout: number, abort?:AbortController} , ...args: unknown[]):Promise<T>{
            let id:unknown;
            const timeoutPromise = new Promise<T>((_, reject) => {
                id = setTimeout(() => { 
                    clearTimeout(id as number);
                    reject(new Error("Aborted by timeout")); 
                }, options?.timeout ?? 3000) ; 
            });
            // Promise thực thi hàm 
            try{
                // Thêm abort vào đầu tham số nếu có.
                options?.abort && args.unshift(options?.abort)
                const taskPromise = asyncCall(func, ...args); // Đua giữa hai promise 
                const result:T = await Promise.race([taskPromise, timeoutPromise]);
                clearTimeout(id as number);
                return result;
            }catch(err){
                clearTimeout(id as number);            
                return err            
            }
        }

    }// end FunctionUtils

    export namespace math {
        /**
         * 
         * @param refs 
         * @returns 
         */
        export function flattenGraph(refs: { [key: string]: string[] }): { [key: string]: string[] } {
            const result: { [key: string]: string[] } = {};
            // Tìm tất cả component bị tham chiếu
            const referenced = new Set<string>();
            for (const k in refs) {
                for (const v of refs[k]) referenced.add(v);
            }
            // Hàm gom chuỗi tham chiếu
            const collect = (key: string, visited: Set<string>): string[] => {
                if (visited.has(key)) return [];
                visited.add(key);
                const direct = refs[key] || [];
                let all: string[] = [];
                for (const child of direct) {
                    all.push(child);
                    all = all.concat(collect(child, visited));
                }
                return Array.from(new Set(all)); // loại trùng
            };

            // Chỉ giữ root: không bị tham chiếu
            for (const k in refs) {
                if (!referenced.has(k)) {
                    result[k] = collect(k, new Set<string>());
                }
            }
            return result;
        }

        export function deepMerge<T extends Record<string, any>>(target: T, source: Record<string, any>): T {
            for (const k in source) {
                if (!Object.prototype.hasOwnProperty.call(source, k)) continue;
                const sv:unknown = source[k];
                const tv:unknown = target[k];
                if (tv && sv && typeof tv === 'object' && typeof sv === 'object' && !Array.isArray(tv) && !Array.isArray(sv)) {
                    deepMerge(tv, sv);
                } else {
                    (target as Record<string, any>)[k] = sv;
                }
            }
            return target;
        }

    }// end MathUtil

    export namespace types {

        /**
         * 
         * @param value 
         * @returns 
         */
        export function isCocosValueType(value: unknown): boolean {
            if (!value || typeof value !== 'object') return false;    
            if (value instanceof ValueType) return true;    
            const ctor: any = (value as any).constructor;
            return !!ctor && ctor.prototype instanceof ValueType;
        }
        
        /**
         * 
         * @param value 
         * @returns 
         */
        export function isPrimitiveType(value: unknown): value is PrimitiveType {
            if (value === null) return true;
            const t = typeof value;
            return (
                t === 'string' ||
                t === 'number' ||
                t === 'boolean' ||
                t === 'undefined' ||
                t === 'symbol' ||
                t === 'bigint'
            );
        }

        /**
         * 
         * @param value 
         * @returns 
         */
        export function isObject(value: unknown): value is Record<string, unknown> {            
            return typeof value === 'object' && value !== null;
        }
        
        /**
         * 
         * @param value 
         * @returns 
         */
        export function getType(value: any): string {
            if (value === null) return "null";
            if (value === undefined) return "undefined";
            if (Array.isArray(value)) return "array";
            if (value instanceof Date) return "date";
            if (value instanceof RegExp) return "regexp";
            if (value instanceof Map) return "map";
            if (value instanceof Set) return "set";
            if (value instanceof WeakMap) return "weakmap";
            if (value instanceof WeakSet) return "weakset";
            if (typeof value === "function") return "function";
            if (typeof value === "object") return "object";
            return typeof value; // number, string, boolean, symbol, bigint
        }

        function inferType(value: any): string {
            if (Array.isArray(value)) {
                if (value.length === 0) return 'any[]';
                return `${inferType(value[0])}[]`;
            }
            if (value === null) return 'null';
            return typeof value;
            // // if (value === null) return "null";
            // if (value === null) return "unknown";
            // if (Array.isArray(value)) return "any[]";
            // return typeof value;
        }
    
        /**
         * 
         * @param obj 
         * @param typeName 
         * @param output 
         * @returns 
         */
        export function generateTypes(obj: Record<string, any>, typeName: string, output: string[] = [], declared = new Set<string>()): string {
            if (declared.has(typeName)) {
                return output.join('\n'); // 
            }
            // 
            declared.add(typeName);
            const fields: string[] = [];
            for (const key of Object.keys(obj)) {
                const value = obj[key];    
                if ( typeof value === "object" && value !== null && !Array.isArray(value)) {
                    const childTypeName = strings.pascalCase(`${key}Type`);
                    this.generateTypes(value, childTypeName, output, declared);
                    fields.push(`  ${key}: ${childTypeName};`);
                } else {
                    fields.push(`  ${key}: ${inferType(value)};`);
                }
            }    
            output.push(`export type ${typeName} = { \n${fields.join("\n")}\n };\n`);
    
            return output.join('\n'); // đảm bảo luôn có return
        }


        export function generateInterfaces(
            obj: Record<string, any>,
            name: string,
            output: string[] = [],
            structureMap = new Map<string, string>(),
            generated = new Set<string>()
        ): string {
            const structureHash = hashStructure(obj);

            let interfaceName = structureMap.get(structureHash);
            if (!interfaceName) {
                interfaceName = strings.pascalCase(name);
                structureMap.set(structureHash, interfaceName);
            }

            if (generated.has(interfaceName)) {
                return interfaceName;
            }

            generated.add(interfaceName);

            const fields: string[] = [];

            for (const key of Object.keys(obj)) {
                const value = obj[key];

                if ( typeof value === 'object' && value !== null && !Array.isArray(value) ) {
                    const childName = `${interfaceName}_${key}`;
                    const ref = generateInterfaces(
                        value,
                        childName,
                        output,
                        structureMap,
                        generated
                    );
                    fields.push(`  ${key}: ${ref};`);
                } else {
                    fields.push(`  ${key}: ${inferType(value)};`);
                }
            }

            output.push(
                `export interface ${interfaceName} {\n${fields.join('\n')}\n}\n`
            );

            return interfaceName;
        }


        function hashStructure(obj: any): string {
            if (obj === null) return 'null';

            if (Array.isArray(obj)) {
                return `array<${obj.length ? hashStructure(obj[0]) : 'any'}>`;
            }

            if (typeof obj !== 'object') {
                return typeof obj;
            }

            const keys = Object.keys(obj).sort();
            return `{${keys
                .map(k => `${k}:${hashStructure(obj[k])}`)
                .join(',')}}`;
        }

    
        export function mapToObject(map: Map<any, any>): any {
            const obj: any = {};
            for (const [key, value] of map) {
                obj[key] = value instanceof Map
                    ? mapToObject(value)
                    : value;
            }
            return obj;
        }

        export function mapToJSON(map: Map<any, any>): string {
            return JSON.stringify(mapToObject(map));
        }
        
    }

    
    
    export const findReferences = editor.findReferences;
    export const updateJSONFile = editor.updateJSONFile;
    export const getPrefabAssetUUID = editor.getPrefabAssetUUID;
    export const getPrefabAssetName = editor.getPrefabAssetName;
    export const isNodeOfPrefab = editor.isNodeOfPrefab;
    export const getCustomComponentsInChildren = editor.getCustomComponentsInChildren;
    export const getPrefabRootNode = editor.getPrefabRootNode;
    export const getPersitParentNode = editor.getPersitParentNode;
    export const extractProperties = editor.extractProperties;

    export const isCustomClass = classes.isCustomClass;
    export const getClassAttrs = classes.getClassAttrs;
    export const getDeepPropertyDescriptor = classes.getDeepPropertyDescriptor;
    export const getOrCreatePropertyStash = classes.getOrCreatePropertyStash;
    export const generateImplicitDecorator = classes.generateImplicitDecorator;
    export const getBuiltinCocosClasses = classes.getBuiltinCocosClasses;

    export const replaceParameters = strings.replaceParameters;
    export const pascalCase = strings.pascalCase;
    export const hashShort = strings.hashShort;
    export const unflattenBySeparator = strings.unflattenBySeparator;
    export const generateUUID = strings.generateUUID;
    export const generateEmbedToken = strings.generateEmbedToken;
    export const isHash = strings.isHash;

    export const getMethodFromEventHandler = functions.getMethodFromEventHandler;
    export const getComponentFromEventHandler = functions.getComponentFromEventHandler;
    export const asyncCall = functions.asyncCall;
    export const callWithTimeout = functions.callWithTimeout;

    export const flattenGraph = math.flattenGraph;
    export const deepMerge = math.deepMerge;

    export const isCocosValueType = types.isCocosValueType;
    export const isPrimitiveType = types.isPrimitiveType;
    export const isObject = types.isObject;
    export const getType = types.getType;
    export const generateTypes = types.generateTypes;
    export const generateInterfaces = types.generateInterfaces;
    export const mapToObject = types.mapToObject;
    export const mapToJSON = types.mapToJSON;
    
}
import { _decorator, CCBoolean, Component, log, Node } from 'cc';
import { EDITOR } from 'cc/env';
import { utils } from '../definition/cocoeywa.utils';
const { ccclass, property } = _decorator;

@ccclass('EditorBlock')
export class EditorBlock extends Component {
    
    @property
    data:string = ''

    private _test: boolean;
    @property({
        type:CCBoolean,
        visible:true
    })
    public get test(): boolean {
        return this._test;
    }
    public set test(value: boolean) {
        this._test = value;
        
        if(this.data.length) {
            log('\n ' + this.generateTypes(JSON.parse(this.data), 'BetResponse'))
        }
        if(EDITOR){
            Editor.Message.request('scene', 'execute-scene-script', {
                name: 'cocoeywa',
                method: 'log',
                args: [],
            })
        }
    }

    /**
     * 
     * @param obj 
     * @param typeName 
     * @param output 
     * @returns 
     */
    protected generateTypes(obj: Record<string, any>, typeName: string, output: string[] = [], declared = new Set<string>()): string {
        if (declared.has(typeName)) {
            return output.join('\n'); // 
        }
        // 
        declared.add(typeName);
        const fields: string[] = [];
        for (const key of Object.keys(obj)) {
            const value = obj[key];    
            if ( typeof value === "object" && value !== null && !Array.isArray(value)) {
                const childTypeName = utils.pascalCase(`${key}Type`);
                this.generateTypes(value, childTypeName, output, declared);
                fields.push(`  ${key}: ${childTypeName};`);
            } else {
                fields.push(`  ${key}: ${this.inferType(value)};`);
            }
        }    
        output.push(`export type ${typeName} = { \n${fields.join("\n")}\n };\n`);

        return output.join('\n'); // đảm bảo luôn có return
    }

    private inferType(value: any): string {
        if (Array.isArray(value)) {
            if (value.length === 0) return 'any[]';
            return `${this.inferType(value[0])}[]`;
        }
        if (value === null) return 'null';
        return typeof value;
        // // if (value === null) return "null";
        // if (value === null) return "unknown";
        // if (Array.isArray(value)) return "any[]";
        // return typeof value;
    }

}



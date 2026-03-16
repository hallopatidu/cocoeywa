import { _decorator, Component, Node } from 'cc';
import { IntentBlock } from './IntentBlock';
const { ccclass, property } = _decorator;
class StateStore<V = unknown> {
    private list: { key: string; value: V }[] = [];
    private index = new Map<string, V[]>();

    public set(key: string, value: V): void {
        this.list.push({ key, value });
        let bucket:V[] = this.index.get(key);
        if (!bucket) {
            bucket = [];
            this.index.set(key, bucket);
        }
        bucket.push(value);

    }

    public sort(key: string, compareFn:(a:V, b:V)=>number){
        if(this.index.has(key)){
            const keys:V[] = this.index.get(key);
            keys.sort(compareFn)
        }
    }

    public get(key: string): V[] {        
        return this.index.get(key) ?? [];
    }
    
    public has(key: string): boolean {
        return this.index.has(key);
    }

    public delete(key: string, value?: V|undefined): boolean {
        if(value === undefined){
            return this.index.delete(key);;
        }
        // Xóa trong index
        const bucket:V[] = this.index.get(key);
        if (!bucket) return false;

        const valueIndex:number = bucket.findIndex(v => (typeof value == 'string') ? v === value : Object.is(v, value));
        if (valueIndex === -1) return false;

        bucket.splice(valueIndex, 1);
        if (bucket.length === 0) {
            this.index.delete(key);
        }

        // Xóa trong list (giữ thứ tự)
        const listIndex = this.list.findIndex( item => item.key === key && Object.is(item.value, value) );

        if (listIndex !== -1) {
            this.list.splice(listIndex, 1);
        }

        return true;
    }
}


@ccclass('StoreBlock')
export abstract class StoreBlock extends IntentBlock {

    private _store: StateStore<string> = null;
    protected get store(): StateStore<string> {
        if(!this._store){
            this._store = new StateStore<string>();
        }
        return this._store;
    }


    protected onDestroy(): void {
        this._store = null;
        super.onDestroy && super.onDestroy()
    }
}



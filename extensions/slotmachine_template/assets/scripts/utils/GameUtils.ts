import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('GameUtils')
export abstract class GameUtils{
    static getEnumKeys<T>(enumObj: T): string[] {
        return Object.keys(enumObj).filter(key => isNaN(Number(key))); 
    }
}



import { __private, _decorator, Enum, sp } from 'cc';

// import { PipeDoneType, PipeTask } from '../../cocoseus/decorator/Pipelineify';
// const { ccclass, property } = _decorator;



// export enum BlockProgressType {
//     SEQUENCE,
//     PARALLEL
// }
// Enum(BlockProgressType)

// export interface IChainBlock {
//     execute<T = any>(data?: T): Promise<T>
//     cancel(): void
// }

// export interface IPlayBlock extends IChainBlock {
//     get totalDuration(): number
// }

// export interface IChainTask extends PipeTask {
//     set done(value: PipeDoneType);
//     get done(): PipeDoneType
// }
// export type PipeJoint = ((task: IPipeTask, done: PipeDone ) => void) | ((task: IPipeTask) => Error | void);
// export type PipeDone = (err?: Error | null | Boolean) => void;


// export const BlockEvent = {
//     CANCEL: 'block_cancel',
// } 
export const EditorMode = {
    Prefab:'prefab',
    Animation:'animation',
    General:'general'
}

// 
export type SpSkeletonType = sp.Skeleton & {
    _cacheMode:typeof sp.Skeleton.AnimationCacheMode,
    _curFrame:__private._cocos_spine_skeleton_cache__AnimationFrame,
    _animCache:__private._cocos_spine_skeleton_cache__AnimationCache,
    _isAniComplete:boolean,
    _animationQueue:__private._cocos_spine_skeleton__AnimationItem[],
    _headAniInfo:__private._cocos_spine_skeleton__AnimationItem,
    _accTime:number,
    _instance: sp.spine.SkeletonInstance,
    _updateCache:(dt:number)=>void,
    markForUpdateRenderData:(enable?:boolean)=>void
}

export type SpineStateOption = {
    status: SpineStatus,
    spine?:sp.Skeleton
}

export enum SpineStatus {
    INIT,
    START,
    END,
}
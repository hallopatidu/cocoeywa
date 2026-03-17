import { _decorator, Animation, AnimationClip, assetManager, Component, error, Node, sp, TweenSystem } from 'cc';
import { EDITOR } from 'cc/env';
import { EditorMode, SpSkeletonType } from 'db://cocoseus/scripts/widgets/spines/SpineType';
import { utils } from '../definition/cocoeywa.utils';
import { AssetInfo } from '@cocos/creator-types/editor/packages/asset-db/@types/public';
const { ccclass, property, executeInEditMode } = _decorator;

const DefaultAnimationClipData = {
    __type__: "cc.AnimationClip",
    _name: "",
    _objFlags: 0,
    _native: "",
    sample: 60,
    speed: 1,
    wrapMode: 1,
    events: [],
    _duration: 50,
    _keys: [],
    _stepness: 0,
    curveDatas: {},
    _curves: [],
    _commonTargets: [],
    _hash: 0
}

@ccclass('SpinePreview')
@executeInEditMode(true)
export class SpinePreview extends Animation {

    private static __runningPreviewerUuid: string = null

    private static get isAnimationMode(): boolean {
        if (EDITOR) {
            const currentMode: string = Editor.EditMode.getMode();
            return currentMode == EditorMode.Animation;
        }
        return false;
    }

    @property({ type: sp.Skeleton })
    public get spine(): sp.Skeleton {
        return this._spine;
    }
    public set spine(value: sp.Skeleton) {
        if (this._spine === value) return;
        this._spine = value;
        if (!SpinePreview.isAnimationMode) {
            if (value && value.skeletonData) {
                // this.updateSpine(value);    
                const skeletonData: sp.SkeletonData = value.skeletonData;
                const uuid: string = skeletonData.uuid;
                this.referenceAnimationAsset(uuid);

            } else if (value && !value.skeletonData) {
                error('Reference to Spine Component fail. You need SkeletonData Asset for this Spine Component !')
            } else {
                this.clips.forEach((clip: AnimationClip) => {
                    this.removeClip(clip, true);
                })
                this.defaultClip = null;
            }
        }
    }

    @property({
        type: AnimationClip,
        visible: false,
        override: true
    })
    get defaultClip(): AnimationClip {
        return this._defaultClip
    }
    set defaultClip(value: AnimationClip) {
        this._defaultClip = value;
    }

    @property({
        visible() {
            return this._spine;
        }
    })
    public get playInEditor(): boolean {
        if (EDITOR) {
            const currentMode: string = Editor.EditMode.getMode();
            if (currentMode == EditorMode.Animation) {
                this._isRunning = true
            }
        }
        return this._isRunning;
    }

    public set playInEditor(value: boolean) {
        if (EDITOR) {
            if (value) {
                this.playAnimation();
            } else if (!value && SpinePreview.__runningPreviewerUuid == this.uuid) {

                const checkMode: string = Editor.EditMode.getMode();
                // this.spineState && this.spineState.cancel();
                if (checkMode == EditorMode.Animation) {
                    // 
                    const currentClip: AnimationClip = this.clips[0];
                    if (currentClip) {
                        Editor.Message.request('scene', 'change-clip-state', 'stop', currentClip.uuid);
                    }
                    Editor.Message.request('scene', "close-scene")
                    SpinePreview.__runningPreviewerUuid = null;
                }
            } else {
                return;
            }
        }
        this._isRunning = value;
    }

    private _spine: sp.Skeleton = null;
    private _isRunning: boolean = false;


    update(deltaTime: number) {
        if (this.playInEditor && SpinePreview.__runningPreviewerUuid == this.uuid) {
            this.updateSpineAnimation(deltaTime);
            // SkeletonSystem
            // director.getSystem('SKELETON').postUpdate(deltaTime)
            TweenSystem.instance.ActionManager.update(deltaTime);
            Editor.Message.request('scene', 'set-edit-time', deltaTime)
        }
    }

    /**
     * Update skeleton animation.
     * @param dt delta time.
     */
    public updateSpineAnimation(dt: number): void {
        if (!this.spine) return;
        const spine: SpSkeletonType = this.spine as SpSkeletonType;
        spine.markForUpdateRenderData();
        if (spine.paused) return;
        dt *= spine.timeScale * 1;
        // if (spine.isAnimationCached()) {
        if (spine._cacheMode !== sp.Skeleton.AnimationCacheMode.REALTIME) {
            if (spine._isAniComplete) {
                if (spine._animationQueue.length === 0 && !spine._headAniInfo) {
                    const frameCache = spine._animCache;
                    if (frameCache && frameCache.isInvalid()) {
                        frameCache.updateToFrame(0);
                        const frames = frameCache.frames;
                        spine._curFrame = frames[frames.length - 1];
                    }
                    return;
                }
                if (!spine._headAniInfo) {
                    spine._headAniInfo = spine._animationQueue.shift()!;
                }
                spine._accTime += dt;
                if (spine._accTime > spine._headAniInfo?.delay) {
                    const aniInfo = spine._headAniInfo;
                    spine._headAniInfo = null;
                    spine.setAnimation(0, aniInfo?.animationName, aniInfo?.loop);
                }
                return;
            }
            spine._updateCache(dt);
        } else {
            spine._instance! && spine._instance!.updateAnimation(dt);
        }
    }

    /**
     * 
     * @param uuid 
     * @returns 
     */
    private async loadAnimationClipByUuid(uuid: string): Promise<AnimationClip | null> {
        return new Promise<AnimationClip | null>((resolve, reject) => {
            assetManager.loadAny({ uuid: uuid }, (err, asset) => {
                if (err) {
                    console.error('Failed to load asset:', err);
                    resolve(null);
                    return;
                }
                resolve(asset as AnimationClip);
            });
        })
    }

    private async referenceAnimationAsset(targetAssetUuid: string): Promise<void> {
        if (EDITOR) {
            const uuid: string = targetAssetUuid
            const url: string = await Editor.Message.request('asset-db', "query-url", uuid);
            const relativePath: string = utils.strings.getPathWithoutFileName(url);
            const animAssetName: string = utils.strings.getFilenameWithoutExtension(url);
            const animAssetUrl: string = relativePath + animAssetName + '.anim';
            // 
            let isNewAsset: boolean = false;
            let assetInfo: AssetInfo = await Editor.Message.request('asset-db', 'query-asset-info', animAssetUrl);
            if (!assetInfo) {
                assetInfo = await Editor.Message.request('asset-db', 'create-asset', animAssetUrl, JSON.stringify(DefaultAnimationClipData));

                await Editor.Message.request('asset-db', 'refresh-asset', assetInfo.uuid);
                isNewAsset = true;
            }
            // 
            const animationClip: AnimationClip = await this.loadAnimationClipByUuid(assetInfo.uuid);
            if (animationClip) {
                this.addClip(animationClip, assetInfo.name);
                this.defaultClip = animationClip;
                isNewAsset && await Editor.Message.request('scene', 'soft-reload');
            }
        }
    }


    private async playAnimation() {
        if (EDITOR) {
            const currentClip: AnimationClip = this.clips[0];
            const selectedNodeUuid: string = this.node.uuid
            await Editor.Message.request('scene', 'record-animation', selectedNodeUuid, true, currentClip.uuid);
            SpinePreview.__runningPreviewerUuid = this.uuid;
            await Editor.Message.request('scene', 'query-node', selectedNodeUuid);

            // if (currentClip) {

            //     if (this.spineState) {

            //         await this.excuteSpineState();


            //         this.playInEditor = false;
            //     }
            // }
        }
    }

}



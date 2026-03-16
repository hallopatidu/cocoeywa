import { _decorator, Component, isValid, Layout, Node, tween, UITransform, Vec3 } from 'cc';
import { ReelLayoutState } from './constants/ReelConstants';
const { ccclass, property, executeInEditMode } = _decorator;
const _tempVec3 = new Vec3();



@ccclass('ReelLayout')
export class ReelLayout extends Layout {

    static readonly Event = {
        STATE_CHANGED:'reellayout_state_changed',
        RESET_SYMBOL:'reellayout_reset_symbol'
    }

    public get offset(): number {
        return this._offset;        
    }
    public set offset(value: number) {
        this._offset = value;
        this.updateLayout(true)
    }

    protected _state:number = ReelLayoutState.INIT;
    private _offset: number = 0;
    private _reelId: number = 0;
    get reelId(): number {
        return this._reelId;
    }
    
    get activedChildrenLength():number{
        return this._usefulLayoutObj?.length || 0;
    }

    /**
     * 
     */
    protected onLoad(): void {
        if(isValid(this.node) && this.node.parent){
            const index:number = this.node.parent.children.findIndex((child:Node)=>child == this.node)
            this._reelId = index >= 0 ? index : this._reelId;
            this.setState(ReelLayoutState.READY);
        }
    }

    // ------------ Life Cycle ---------------

    // protected update(dt: number): void {
    //     this.offset += this.currentSpeed * dt;
    // }


    // ---------------------------------------

    /**
     * 
     * @param state 
     */
    setState(state:ReelLayoutState){
        if(isValid(this.node) && this._state !== state){
            this._state = state;
            this.emitEvent(ReelLayout.Event.STATE_CHANGED, this._state);
            // this.node.emit(ReelLayout.EVENT.STATE_CHANGED, state);
            // const activeUITransforms:UITransform[] = this._usefulLayoutObj;
            // activeUITransforms.forEach((uiTrans:UITransform)=>{
            //     uiTrans.node?.emit(ReelLayout.EVENT.STATE_CHANGED, this._state);
            // })
        }
    }

    /**
     * 
     * @returns 
     */
    getState():ReelLayoutState{
        return this._state;
    }

    /**
     * 
     * @param event 
     * @param data 
     */
    protected emitEvent(event:string, data:unknown){
        this.node.emit(event, data);
        const activeUITransforms:UITransform[] = this._usefulLayoutObj;
        activeUITransforms.forEach((uiTrans:UITransform)=>{
            uiTrans.node?.emit(event, data);
        })
    }

    /**
     * 
     * @param sign 
     * @param baseHeight 
     * @returns 
     */
    protected calculateVerticallyStatePos(sign:number, baseHeight: number):number{
        const trans:UITransform = this.node.getComponent(UITransform);
        const layoutAnchor = trans.anchorPoint;
        let paddingY = this._paddingBottom;
        let startPos:number = (this._verticalDirection - layoutAnchor.y) * baseHeight + sign * paddingY;
        return startPos + sign*this.offset;
    }

    /**
     * 
     * @param symbolNode 
     * @param x 
     * @param y 
     * @param z 
     */
    protected setSymbolPosition(index:number, symbolNode:Node, symbolHeight:number, sign:number, x:number, y:number, z:number){
        const usefulMaxIndex:number = this._usefulLayoutObj.length - 1;
        if(this.offset > (symbolHeight + this._spacingY) && index == usefulMaxIndex){
            // chuyen node cuoi len phia tren.
            symbolNode.setSiblingIndex(sign > 0 ? usefulMaxIndex : 0);
            this.offset = 0;
            this.node.emit(ReelLayout.Event.RESET_SYMBOL, symbolNode);
        }else{
            symbolNode.setPosition(x, y, z);
        }
    }

    /**
     * 
     * @param baseHeight 
     * @param columnBreak 
     * @param fnPositionX 
     * @param applyChildren 
     * @returns 
     */
    
    protected _doLayoutVertically (baseHeight: number, columnBreak: boolean, fnPositionX: (...args: any[]) => number, applyChildren: boolean): number {
        const trans:UITransform = this.node.getComponent(UITransform);
        const layoutAnchor = trans.anchorPoint;
        const limit = this._getFixedBreakingNum();
        
        let sign:number = 1;
        let paddingY = this._paddingBottom;
        if (this._verticalDirection === Layout.VerticalDirection.TOP_TO_BOTTOM) {
            sign = -1;
            paddingY = this._paddingTop;
        }

        const startPos = this.calculateVerticallyStatePos(sign, baseHeight);// (this._verticalDirection - layoutAnchor.y) * baseHeight + sign * paddingY;
        let nextY = startPos - sign * this._spacingY;
        let tempMaxWidth = 0;
        let maxWidth = 0;
        let colMaxWidth = 0;
        let totalWidth = 0;
        let isBreak = false;
        const activeChildCount = this._usefulLayoutObj.length;
        let newChildHeight = this._cellSize.height;
        const paddingV = this._getPaddingV();
        
        if (this._layoutType !== Layout.Type.GRID && this._resizeMode === Layout.ResizeMode.CHILDREN) {
            newChildHeight = (baseHeight - paddingV - (activeChildCount - 1) * this._spacingY) / activeChildCount;
        }

        const children = this._usefulLayoutObj;
        for (let i:number = 0; i < children.length; ++i) {
            const childTrans = children[i];
            const child = childTrans.node;
            const scale = child.scale;
            const childScaleX = this._getUsedScaleValue(scale.x);
            const childScaleY = this._getUsedScaleValue(scale.y);

            // for resizing children
            if (this._resizeMode === Layout.ResizeMode.CHILDREN) {
                childTrans.height = newChildHeight / childScaleY;
                if (this._layoutType === Layout.Type.GRID) {
                    childTrans.width = this._cellSize.width / childScaleX;
                }
            }

            const anchorY = Math.abs(this._verticalDirection - childTrans.anchorY);
            const childBoundingBoxWidth = childTrans.width * childScaleX;
            const childBoundingBoxHeight = childTrans.height * childScaleY;

            if (childBoundingBoxWidth > tempMaxWidth) {
                maxWidth = Math.max(tempMaxWidth, maxWidth);
                colMaxWidth = tempMaxWidth || childBoundingBoxWidth;
                tempMaxWidth = childBoundingBoxWidth;
            }

            nextY += sign * (anchorY * childBoundingBoxHeight + this._spacingY);
            const topBoundaryOfChild = sign * (1 - anchorY) * childBoundingBoxHeight;

            if (columnBreak) {
                if (limit > 0) {
                    isBreak = (i / limit) > 0 && (i % limit === 0);
                    if (isBreak) {
                        colMaxWidth = tempMaxWidth > childBoundingBoxHeight ? tempMaxWidth : colMaxWidth;
                    }
                } else if (childBoundingBoxHeight > baseHeight - paddingV) {
                    if (nextY > startPos + sign * (anchorY * childBoundingBoxHeight)) {
                        isBreak = true;
                    }
                } else {
                    const boundary = (1 - this._verticalDirection - layoutAnchor.y) * baseHeight;
                    const columnBreakBoundary = nextY + topBoundaryOfChild + sign * (sign > 0 ? this._paddingTop : this._paddingBottom);
                    isBreak = Math.abs(columnBreakBoundary) > Math.abs(boundary);
                }

                if (isBreak) {
                    nextY = startPos + sign * (anchorY * childBoundingBoxHeight);
                    if (childBoundingBoxWidth !== tempMaxWidth) {
                        colMaxWidth = tempMaxWidth;
                    }
                    // In unconstrained mode, the second width size is always what we need when a line feed condition is required to trigger
                    totalWidth += colMaxWidth + this._spacingX;
                    colMaxWidth = tempMaxWidth = childBoundingBoxWidth;
                }
            }

            const finalPositionX = fnPositionX(child, childTrans, totalWidth);
            if (applyChildren) {
                child.getPosition(_tempVec3);
                // child.setPosition(finalPositionX, nextY, _tempVec3.z);
                this.setSymbolPosition(i, child, childBoundingBoxHeight , sign, finalPositionX, nextY, _tempVec3.x);
            }

            nextY += topBoundaryOfChild;
        }

        colMaxWidth = Math.max(colMaxWidth, tempMaxWidth);
        const containerResizeBoundary = Math.max(maxWidth, totalWidth + colMaxWidth) + this._getPaddingH();
        return containerResizeBoundary;
    }

}



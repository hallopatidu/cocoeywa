import { _decorator, Button, Component, Event, Node, tween, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('ButtonScale')
export class ButtonScale extends Component {
    @property
    pressedScale: number = 0.9;
    @property
    transDuration: number = 0.02;

    private scaleDefault: Vec3 = null;
    public isRun: boolean = true;

    onLoad() {
        this.scaleDefault = new Vec3(this.node.scale.x, this.node.scale.y, this.node.scale.z);
        this.node.on(Node.EventType.TOUCH_START, this.onTouchDown, this);
        this.node.on(Node.EventType.TOUCH_CANCEL, this.onTouchUp, this);
        this.node.on(Node.EventType.TOUCH_END, this.onTouchUp, this);
    }

    protected onDestroy(): void {
        this.node.off(Node.EventType.TOUCH_START, this.onTouchDown, this);
        this.node.off(Node.EventType.TOUCH_CANCEL, this.onTouchUp, this);
        this.node.off(Node.EventType.TOUCH_END, this.onTouchUp, this);
    }

    onTouchDown(event:Event) {
        // tween(this.node).stop();
        let btn:Button = this.node.getComponent(Button);
        if ((btn && !btn.interactable) || !this.isRun) {
            return;
        }
        tween(this.node).to(this.transDuration, { scale: this.scaleDefault })
            .to(this.transDuration,
                { scale: new Vec3(this.scaleDefault.x * this.pressedScale, this.scaleDefault.y * this.pressedScale, this.scaleDefault.z) }).start();
    }

    onTouchUp(event:Event) {
        let btn = this.node.getComponent(Button);
        if ((btn && !btn.interactable) || !this.isRun) {
            return;
        }
        tween(this.node).to(this.transDuration, { scale: this.node.scale })
            .to(this.transDuration, { scale: this.scaleDefault }).start();
    }
}



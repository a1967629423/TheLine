import MovingSprite from "../../BackgroundMaterial/src/MovingSprite";

// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property,requireComponent} = cc._decorator;

@ccclass
@requireComponent(MovingSprite)
export default class DemoBackground extends cc.Component {
    movingSprite:MovingSprite = null;
    private _offset:cc.Vec2 = new cc.Vec2();
    setOffset(offset:cc.Vec2){
        this._offset.set(offset)
        this.movingSprite.offset.set(this._offset.negate());
    }
    onLoad(){
        this.movingSprite = this.getComponent(MovingSprite)
    }

    // update (dt) {}
}

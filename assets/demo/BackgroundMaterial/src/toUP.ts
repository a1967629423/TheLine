import CanMovedSprite from "./CanMovedSprite";

const {ccclass, property,requireComponent,inspector} = cc._decorator;

@ccclass
@requireComponent(CanMovedSprite)
export default class NewClass extends cc.Component {
    @property()
    speed:number = 100;

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}
    offsetY:number = 0;
    canMoved:CanMovedSprite
    start () {
        this.canMoved = this.getComponent(CanMovedSprite)
    }

    update (dt) {
        this.offsetY -= dt*this.speed;
        this.canMoved.offset.y = this.offsetY;
    }
}

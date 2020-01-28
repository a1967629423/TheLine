import MovingSprite from "./MovingSprite";

const {ccclass, property,requireComponent,inspector} = cc._decorator;

@ccclass
@requireComponent(MovingSprite)
export default class toUP extends cc.Component {
    @property()
    speed:number = 100;

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}
    offsetY:number = 0;
    canMoved:MovingSprite
    start () {
        this.canMoved = this.getComponent(MovingSprite)
    }

    update (dt) {
        this.offsetY -= dt*this.speed;
        this.canMoved.offset.y = this.offsetY;
    }
}

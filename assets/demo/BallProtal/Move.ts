import BallProtal from "./BallProtal";

// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property,requireComponent} = cc._decorator;

@ccclass
@requireComponent(BallProtal)
export default class BollProtal_Move extends cc.Component {

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}
    @property()
    speed:number = 10;
    v:cc.Vec3 = new cc.Vec3();
    bollProtal:BallProtal
    start () {
        this.bollProtal = this.getComponent(BallProtal)
        cc.Canvas.instance.node.on(cc.Node.EventType.TOUCH_MOVE,(e:cc.Touch)=>{
            let local  = cc.Canvas.instance.node.convertToNodeSpaceAR(e.getLocation())
            this.v.x = local.x;
            this.v.y = local.y;
            this.bollProtal.displayedBoll.setPosition(this.v) 
        })
    }

    update (dt) {
        
    }

}

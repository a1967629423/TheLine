import PhysicalComponent from "./PhysicalComponent";

// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property,requireComponent} = cc._decorator;

@ccclass
@requireComponent(PhysicalComponent)
export default class DemoBallControll extends cc.Component {
    physical:PhysicalComponent = null;
    upVec2:cc.Vec2 = new cc.Vec2(0,500)
    onLoad(){
        this.physical = this.getComponent(PhysicalComponent)
    }
    onEnable(){
        cc.Canvas.instance.node.on(cc.Node.EventType.TOUCH_START,(e)=>{
            this.physical.applyImpulse(this.upVec2)
        })
    }
    start(){
        this.physical.applyImpulse(this.upVec2)
    }
}

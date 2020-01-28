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
export default class DemoCameraFollow extends cc.Component {
    

    // LIFE-CYCLE CALLBACKS:
    @property(PhysicalComponent)
    target:PhysicalComponent = null;
    physical:PhysicalComponent = null;
    tVec2:cc.Vec2 = new cc.Vec2();
    onLoad () {
        this.physical = this.getComponent(PhysicalComponent)
        if(this.target === null){
            console.warn('CameraFollow need target')
        }
    }


    update (dt:number) {
        let y =  this.target.virtualPosition.y -this.physical.virtualPosition.y 
        if(y>0){
            this.physical._virtualPosition.y+=4*y*dt;
        } 
        
    }
}

// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    @property(cc.Label)
    label: cc.Label = null;

    @property
    text: string = 'hello';

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}
    p:cc.Vec3 = new cc.Vec3()
    start () {
        this.p.set(this.node.position)
        this.speed = 1000;
    }
    speed:number = 0;
    update (dt) {

        if(this.p.y>-2000){
            this.p.y+=dt*this.speed;
            this.node.setPosition(this.p)
            
            this.speed-=480*dt;
        }
    }
}

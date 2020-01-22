// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html
enum Follow {
    LINE,SMOOTH
}
const {ccclass, property} = cc._decorator;

@ccclass
export default class cameraFollow extends cc.Component {

    @property(cc.Node)
    target: cc.Node = null;
    @property({type:cc.Enum(Follow)})
    followType:Follow = Follow.LINE
    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}
    v:cc.Vec3 = new cc.Vec3();
    @property({type:cc.Integer})
    max=-30;
    start () {
        this.v.set(this.node.position)
    }

    update (dt) {
        switch(this.followType){
            case Follow.LINE:
                if(this.target.position.y - this.v.y >this.max){
                    this.v.y = this.target.position.y - this.max;
                    this.node.setPosition(this.v)
                }
            break;
            case Follow.SMOOTH:
                let d = (this.target.position.y - this.v.y+(-3*this.max));
                if(d>0){
                    this.v.y += 3*d *dt;
                    this.node.setPosition(this.v)
                }
            break;
        }
    }
}

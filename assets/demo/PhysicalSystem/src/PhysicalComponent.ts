import PhysicalManager from "./PhysicalManager";

const {ccclass, property} = cc._decorator;

@ccclass
export default class PhysicalComponent extends cc.Component {

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}
    _currentVelocity:cc.Vec2 = new cc.Vec2();
    @property()
    affectedByGravity:boolean = true;
    @property()
    mass:number = 1
    _acceleratedVelocity:cc.Vec2 = new cc.Vec2();
    _virtualPosition:cc.Vec2 = new cc.Vec2();
    get virtualPosition(){
        return this._virtualPosition;
    }

    start () {

    }
    onEnable(){
        PhysicalManager.getInstance().registerPhysicalNode(this)
    }
    onDisable(){
        PhysicalManager.getInstance().unregisterPhysicalNode(this)
    }
    applyForce(force:cc.Vec2){
        this._acceleratedVelocity.set(force.divide(this.mass));
    }
    applyImpulse(impulse:cc.Vec2){
        this._currentVelocity.addSelf(impulse.divide(this.mass));
    }
    setLinearVelocity(velocity:cc.Vec2){
        this._currentVelocity.set(velocity);
    }

    // update (dt) {}
}

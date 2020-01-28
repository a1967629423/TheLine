import PhysicalComponent from "./PhysicalComponent";
import DemoBackground from "./Background";
// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = cc._decorator;

@ccclass
export default class PhysicalManager extends cc.Component {
    @property()
    gravity:number = 9.8
    @property(DemoBackground)
    background:DemoBackground = null
    @property(PhysicalComponent)
    camera:PhysicalComponent = null
    private _cameraWorldPosition:cc.Vec3 = new cc.Vec3();
    private static _instance:PhysicalManager = null;
    private _physicalNodes:PhysicalComponent[] = []
    private _aVelocity:cc.Vec2 = new cc.Vec2();
    private _tempLocation:cc.Vec3 = new cc.Vec3();
    public static getInstance(){
        if(!this._instance){
            console.warn('physicalManage must be insert to scene')
        }
        return this._instance;
    }
    constructor(){
        super()
        PhysicalManager._instance = this;
    }
    onLoad(){
        if(!this.background||!this.camera){
            this.enabled = false;
            return;
        }
        this._cameraWorldPosition = this.camera.node.parent.convertToWorldSpaceAR(this.camera.node.position)
        this.camera._virtualPosition.x = this._cameraWorldPosition.x;
        this.camera._virtualPosition.y = this._cameraWorldPosition.y;
    }
    update(dt:number){
        //并不是最优的方法
        [this.camera,...this._physicalNodes].forEach((pNode)=>{
            this._aVelocity.set(cc.Vec2.ZERO)
            if(pNode.affectedByGravity){
                this._aVelocity.y-=this.gravity;
            }
            this._aVelocity.addSelf(pNode._acceleratedVelocity);
            pNode._acceleratedVelocity.set(cc.Vec2.ZERO)
            pNode._currentVelocity.addSelf(this._aVelocity)
            pNode._virtualPosition.x+= pNode._currentVelocity.x*dt;
            pNode._virtualPosition.y+= pNode._currentVelocity.y*dt;
        })
        this._physicalNodes.filter((v)=>v!==this.camera).forEach((pNode)=>{
            this._tempLocation.set(cc.Vec3.ZERO)
            this._aVelocity.set(pNode._virtualPosition)
            let sub = this._aVelocity.subtract(this.camera._virtualPosition)
            this._tempLocation.x = sub.x;
            this._tempLocation.y = sub.y;
            this._tempLocation.addSelf(this._cameraWorldPosition)
            pNode.node.setPosition(pNode.node.parent.convertToNodeSpaceAR(this._tempLocation));
        })
        this.background.setOffset(this.camera._virtualPosition)
    }
    registerPhysicalNode(physicalNode:PhysicalComponent){
        // 实现的不太好
        if(this.enabled&&physicalNode !== this.camera){
            this._physicalNodes.push(physicalNode)
            let pNodep = physicalNode.node.parent.convertToWorldSpaceAR(physicalNode.node.position).subtract(this._cameraWorldPosition)
            physicalNode._virtualPosition.x = pNodep.x;
            physicalNode._virtualPosition.y = pNodep.y;
            physicalNode._virtualPosition.addSelf(this.camera._virtualPosition)
        }
    }
    unregisterPhysicalNode(physicalNode:PhysicalComponent){
        this._physicalNodes =this._physicalNodes.filter((v)=>v!==physicalNode)
    }
    onDestroy(){
        PhysicalManager._instance = null;
    }

}

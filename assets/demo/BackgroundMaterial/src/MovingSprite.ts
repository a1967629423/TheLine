
const {ccclass, property} = cc._decorator;

@ccclass
export default class MovingSprite extends cc.Sprite {
    @property(cc.Vec2)
    offset:cc.Vec2 = new cc.Vec2();
    @property(cc.Vec2)
    sizeVec2:cc.Vec2 = new cc.Vec2();
    needUpdate:boolean = false;
    start(){
    }
    update(dt){
        let material = this.getMaterial(0);
        let offsetProp:cc.Vec2 = material.getProperty('offset',0) as any
        let sizeProp:cc.Vec2 = material.getProperty('objSize',0) as any;
        if(offsetProp&&!this.offset.equals(offsetProp)){
            material.setProperty('offset',this.offset)
        } 
        if(sizeProp&&!this.sizeVec2.equals(sizeProp)){
            material.setProperty('objSize', this.sizeVec2)
        }
    }
}

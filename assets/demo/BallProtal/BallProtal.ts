/*
* 传送门思路: 利用三个相同物体模拟
* 三个物体除了x轴位置以外的其余属性应保持一致
*   *     *     *
* 当中心展示物体到达边缘时修改cursor即可
*/
const {ccclass, property} = cc._decorator;
@ccclass
export default class BallProtal extends cc.Component {
    @property({type:[cc.Node]})
    bolls:cc.Node[] = new Array(3)
    @property({type:cc.Integer,max:2})
    cursor:number = 0
    get displayedBoll() {
        return this.bolls[this.cursor]
    }
    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}
    canvasWidth:number
    start () {
        this.canvasWidth = cc.Canvas.instance.node.width
        if(this.bolls.some((v)=>!v)){
            this.node.active = false;
        }
    }
    v:cc.Vec3 = new cc.Vec3();
    private next(){
        this.cursor++;
        if(this.cursor>=this.bolls.length){
            this.cursor = 0
        }
        return this.displayedBoll;
    }
    private previous(){
        this.cursor--;
        if(this.cursor<=0){
            this.cursor = this.bolls.length-1;
        }
        return this.displayedBoll;
    }
    update () {
        let displayed = this.displayedBoll;
        if(displayed.position.x>this.canvasWidth/2){
            displayed = this.previous();
        }
        if(displayed.position.x<-this.canvasWidth/2){
            displayed = this.next();
        }
        this.bolls.filter((v)=>v!==displayed).forEach((v,i)=>{
            this.v.set(displayed.position)
            this.v.x += i?-this.canvasWidth:this.canvasWidth;
            v.setPosition(this.v)
        });
    }
}

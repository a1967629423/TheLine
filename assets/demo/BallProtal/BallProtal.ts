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
    balls:cc.Node[] = new Array(3)
    @property({type:cc.Integer,max:2})
    cursor:number = 0
    get displayedBall() {
        return this.balls[this.cursor]
    }
    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}
    canvasWidth:number
    canvasNode:cc.Node
    start () {
        this.canvasNode = cc.Canvas.instance.node
        this.canvasWidth = cc.Canvas.instance.node.width
        if(this.balls.length !== 3){
            console.error('length of balls  shoud be 3')
            this.node.active = true;
        }
        if(this.balls.some((v)=>!v)){
            this.node.active = false;
        }
    }
    v:cc.Vec3 = new cc.Vec3();
    private next(){
        this.cursor++;
        if(this.cursor>=this.balls.length){
            this.cursor = 0
        }
        return this.displayedBall;
    }
    private previous(){
        this.cursor--;
        if(this.cursor<=0){
            this.cursor = this.balls.length-1;
        }
        return this.displayedBall;
    }
    update () {
        let displayed = this.displayedBall;
        if(displayed.position.x>this.canvasNode.width*(1-this.canvasNode.anchorX)){
            displayed = this.previous();
        }
        if(displayed.position.x<-this.canvasNode.width*(this.canvasNode.anchorX)){
            displayed = this.next();
        }
        this.balls.filter((v)=>v!==displayed).forEach((v,i)=>{
            this.v.set(displayed.position)
            this.v.x += i?-this.canvasWidth:this.canvasWidth;
            v.setPosition(this.v)
        });
    }
}

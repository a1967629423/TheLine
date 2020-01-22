import EventCenter from "../frame/EventCenter";


// Learn TypeScript:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html
enum SyncEnum {
    disable, mainCamera, mainPlay
}
const { ccclass, property } = cc._decorator;

@ccclass
export default class NodeSync extends cc.Component {
    @property(cc.Node)
    tageNode: cc.Node = null;
    @property({ type: cc.Enum(SyncEnum) })
    SyncTypeEnum: SyncEnum = SyncEnum.disable;
    @property
    Synclocation: boolean = true;
    @property
    SyncSize: boolean = false;
    @property
    workInStart: boolean = false;
    @property
    workInResize: boolean = false;
    @property
    negation: boolean = false;
    onLoad() {
        switch (this.SyncTypeEnum) {
            case SyncEnum.mainCamera:
                this.tageNode = cc.Camera.main.node;
                break;
            case SyncEnum.mainPlay:
                break;
            default:
                break;
        }
    }
    start() {
        // var _this = this;

        // GlobalTime.Instantiation.Coroutines((function*(){
        //     while(_this.tageNode)
        //     {
        //         _this.node.position =  _this.node.getParent().convertToNodeSpaceAR(_this.tageNode.getParent().convertToWorldSpaceAR(_this.tageNode.position));
        //         yield CoroutinesType.frame;
        //     }
        // })())
        if (this.workInStart) {
            if (this.Synclocation) {
                this.tracePosition();
            }
            if (this.SyncSize) {
                this.traceSize();
            }
        }
        if (this.workInResize) {
            if (this.Synclocation) {
                EventCenter.Instance.node.on("resize", this.tracePosition, this);
            }
            if (this.SyncSize) {
                EventCenter.Instance.node.on("resize", this.traceSize, this);
            }
        }
    }
    tracePosition() {
        var parent =  this.node.getParent();
        var tarparent = this.tageNode.getParent();
        var po = parent.convertToNodeSpaceAR(tarparent.convertToWorldSpaceAR(this.tageNode.position));
        this.node.position = this.negation ? po.neg() : po;
        po = null;
        parent = null;
        tarparent = null;
    }
    traceSize() {
        this.node.setContentSize(this.tageNode.getContentSize());
    }
    update(dt) {
        if (this.tageNode && !this.workInStart) {
            if (this.Synclocation) {
                this.tracePosition();
            }
            if (this.SyncSize) {
                this.traceSize();
            }

        }
    }
    onDestroy()
    {
        if(this.workInResize)
        {
            if(EventCenter.Instance)
            {
                EventCenter.Instance.node.off("resize",this.tracePosition,this);
                EventCenter.Instance.node.off("resize",this.traceSize,this);
            }
        }
    }
}

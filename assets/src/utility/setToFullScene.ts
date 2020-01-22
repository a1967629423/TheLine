import EventCenter from "../frame/EventCenter";


const {ccclass, property} = cc._decorator;

@ccclass
export default class setToFullScene extends cc.Component {
    nowZoomRatio:number = 1
    setSize()
    {
        this.node.setContentSize(cc.winSize);
        
    }
    onLoad()
    {
        if(!window.onresize)
        {
            window.onresize = ()=>{EventCenter.Instance.node.emit("resize")}
        }
        EventCenter.Instance.node.on('resize',this.setSize,this);
        this.setSize();
    }
    update()
    {
        var camera = cc.Camera.findCamera(this.node)
        if(camera&&camera.zoomRatio!==this.nowZoomRatio)
        {
            this.node.scale = 1/camera.zoomRatio
        }
    }
    onDestroy()
    {
        EventCenter.Instance.node.off('resize',this.setSize,this);
    }

    // update (dt) {}
}

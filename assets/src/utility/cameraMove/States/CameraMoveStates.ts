import { CameraMoveMachine } from "../CameraMoveMachine";
import { MSMDsc } from "../../../frame/StateMachine/StateDec";

export  module CameraMoveStates
{
    
    @MSMDsc.mDefaultState
    @MSMDsc.mLinkTo('Pause','pause')
    @MSMDsc.mLinkTo('Scale','scale')
    @MSMDsc.mState('Default',CameraMoveMachine.CameraMoveMachine)
    export class DefaultState extends CameraMoveMachine.CameraMoveState
    {
        lastScrollY:number = 1;
        Start()
        {
            this.context.listen('pause');
            this.lastScrollY = 1;
        }
        touchEnd(t:cc.Touch)
        {
            this.context.touchExit(t);
        }
        touchCancel(t:cc.Touch)
        {
            this.context.touchExit(t);
        }
        touch(t:cc.Touch)
        {
            var nid = t.getID();
            if(!this.context.touchs.find(value=>value.id===nid))
            {
                this.context.touchs.push({id:nid,point:t.getLocation()})
            }
            if(this.context.touchs.length>1)
            {
                this.context.emit('scale')
            }
            else
            {
                var add = t.getDelta().neg().mul(1/this.context.nCamera.zoomRatio);
                this.context.node.position=this.context.node.position.add(add);
            }
        }
        
        mouseWheel(mouseEvent:cc.Event.EventMouse)
        {
            this.lastScrollY += mouseEvent.getScrollY()/1200
            this.lastScrollY = this.context.changeCameraZoom(this.lastScrollY);
        }
        Quit()
        {
            this.lastScrollY = 1;
            this.context.cancelListen('pause');
        }
    }
    
    @MSMDsc.mLinkTo('Default','resume')
    @MSMDsc.mState('Pause',CameraMoveMachine.CameraMoveMachine)
    export class PauseState extends CameraMoveMachine.CameraMoveState
    {
        Start()
        {
            this.context.listen('resume')
        }
        Quit()
        {
            this.context.cancelListen('resume')
        }
    }
    
    @MSMDsc.mLinkTo('Default','exit')
    @MSMDsc.mState('Scale',CameraMoveMachine.CameraMoveMachine)
    export class ScaleState extends CameraMoveMachine.CameraMoveState{
        nscale:number=null;
        touchExit(t:cc.Touch)
        {
            if(this.context.touchs.length<=1)
            {
                this.context.emit('exit');
            } 
        }
        touchCancel(t:cc.Touch)
        {
            this.context.touchExit(t);
        }
        touchEnd(t:cc.Touch)
        {
            this.context.touchExit(t);
        }
        touch(t:cc.Touch)
        {
            var nid = t.getID();
            var savetouch = this.context.touchs.find(value=>value.id===nid)
            if(!savetouch)
            {
                this.context.touchs.push({id:nid,point:t.getLocation()})
            }
            else
            {
                savetouch.point = t.getLocation();
            }
            if(this.context.touchs.length>1)
            {
                var sub = this.context.touchs[0].point.sub(this.context.touchs[1].point).mag()
                if(!this.nscale)
                {
                    this.nscale = sub;
                }
                var add = sub-this.nscale;
                var nextRatio = this.context.nCamera.zoomRatio+(add/1000)
                this.context.changeCameraZoom(nextRatio);
                this.nscale = sub;
            }
        }
        Quit()
        {
            this.nscale = null;
        }
    }
}
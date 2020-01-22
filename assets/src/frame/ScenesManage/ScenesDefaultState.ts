import ScenesManage, { ScenesState } from "../ScenesManage";
import { MSMDsc } from "../StateMachine/StateDec";
 
@MSMDsc.mDefaultState
@MSMDsc.mState("Default",ScenesManage)
export default class ScenesDefaultState extends ScenesState {
    loadScenes(name:string,time:number,callback:()=>void)
    {
        cc.director.preloadScene(name);
        setTimeout(()=>{
            cc.director.loadScene(name,()=>{if(callback)callback()})
        },time)
    }
    ctx:ScenesManage
    get context():ScenesManage
    {
        return this.ctx;
    }
    set context(val)
    {
        this.ctx = val;
    }
}

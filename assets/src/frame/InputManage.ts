import setToFullScene from "../utility/setToFullScene";
import { MSMDsc } from "./StateMachine/StateDec";
import { MSM } from "./StateMachine/StateMachine";

/**
 * 输入管理器
 * 全局输入管理器会生成在Camera下，所以需要保持Camera始终在游戏物体上方
 */
export enum InputType
{
    touch,mouse,keyboard
}
export interface IInput {
    touch(touchEvent: cc.Touch);
    touchStart(touchEvent: cc.Touch);
    touchEnd(touchEvent: cc.Touch);
    touchCancel(touchEvent: cc.Touch);
}
export interface IInput_mouse
{
    mouseDown(mouseEvent:cc.Event.EventMouse);
    mouseUp(mouseEvent:cc.Event.EventMouse);
    mouseEnter(mouseEvent:cc.Event.EventMouse);
    mouseLeave(mouseEvent:cc.Event.EventMouse);
    mouseWheel(mouseEvent:cc.Event.EventMouse);
    mouseMove(mouseEvent:cc.Event.EventMouse);
}
export interface IInput_keyborad 
{

}
const { ccclass, property } = cc._decorator;
const { mStateMachine, mSyncFunc } = MSMDsc;
const { StateMachine, State } = MSM;
type HitTestCallback={callback:(point:cc.Vec2,listener:cc.Touch)=>boolean,target:object|null}
export module IPSM {

    @mStateMachine
    @ccclass
    export class InputManage extends StateMachine implements IInput {
        @mSyncFunc
        touchStart(touchEvent: cc.Touch) {
        }
        @mSyncFunc
        touchEnd(touchEvent: cc.Touch) {

        }
        @mSyncFunc
        touchCancel(touchEvent: cc.Touch) {

        }
        @mSyncFunc
        touch(touchEvent: cc.Touch) {

        }
        @mSyncFunc
        InputEvent(event:cc.Event,eventName:string)
        {

        }
        private _InputEventAdd(eventName:string,eventType:string)
        {
            var fun = (event:cc.Event)=>{
                this.InputEvent(event,eventName);
            }
            this.InputEventList.push({callback:fun,eventType:eventType})
            return fun;
        }
        @property([cc.Component])
        targets: cc.Component[] = [];
        static g_InputManage: { Camera: cc.Camera, Manage: InputManage }[] = [];
        /**
         * 0=local
         * 1=global
         */
        exState: number = 0;
        _tar: any[] = [];
        customHitTest:HitTestCallback[] = []
        InputEventList:{callback:(event:cc.Event,eventName:string)=>void,eventType:string}[] = []
        enableListens:{touch:boolean,mouse:boolean,keyboard:boolean} = {touch:false,mouse:false,keyboard:false}
        private instanceofIInput(a: any): boolean {
            if (a['touch']) return true
            return false
        }
        static enableCollider:boolean = false;
        static getInstance(tg?: {getComponent(c:typeof cc.Component),addComponent(c:typeof cc.Component)},collider:boolean=false): InputManage {
            var ins: InputManage = null;
            if (tg) {
                ins = tg.getComponent(InputManage);
                if (!ins) {
                    ins = tg.addComponent(InputManage);
                    ins.exState = 0;
                    if(collider&&!this.enableCollider)
                    {
                        cc.director.getCollisionManager().enabled = true;
                        this.enableCollider = true;
                    }
                }
            }
            else {
                var store = this.g_InputManage.find(value => { return value.Camera == cc.Camera.main });

                if (!store) {
                    if(cc.Camera.main)
                    {
                        var newNode = new cc.Node("inputManage");
                        ins = newNode.addComponent(InputManage);
                        newNode.addComponent(setToFullScene);
                        newNode.setParent(cc.Camera.main.node);
                        ins.exState = 1;
                        this.g_InputManage.push({ Camera: cc.Camera.main, Manage: ins });
                    }
                    else
                    {
                        cc.Camera.cameras.forEach(value => {
                            var newNode = new cc.Node("inputManage");
                            ins = newNode.addComponent(InputManage);
                            newNode.addComponent(setToFullScene);
                            newNode.setParent(value.node);
                            ins.exState = 1;
                            this.g_InputManage.push({ Camera: value, Manage: ins });
                        })
                    }
                }
                else {
                    ins = store.Manage;
                }
            }
            return ins;
        }
        addInput(inp:any,type?:InputType)
        addInput(inp:IInput,type:InputType.touch):void
        addInput(inp:IInput_mouse,type:InputType.mouse):void
        addInput(inp:IInput_mouse,type:InputType.keyboard):void
        addInput(inp:any,type:InputType=InputType.touch) {
            switch(type)
            {
                case InputType.touch:
                this._addInput_touch(inp);
                break;
                case InputType.mouse:
                this._addInput_mouse(inp);
                break;
                case InputType.keyboard:
                this._addInput_keyboard(inp);
                break;
            }
            if(!this._tar.find(value=>value===inp))
            {
                this._tar.push(inp);
            }          
        }
        private _addInput_mouse(inp:IInput_mouse)
        {
            if(!this.enableListens.mouse)
            {
                var downType = cc.Node.EventType.MOUSE_DOWN
                var upType = cc.Node.EventType.MOUSE_UP;
                var enterType = cc.Node.EventType.MOUSE_ENTER
                var leaveType = cc.Node.EventType.MOUSE_LEAVE;
                var wheelType = cc.Node.EventType.MOUSE_WHEEL;
                var moveType = cc.Node.EventType.MOUSE_MOVE;
                this.node.on(downType,this._InputEventAdd('mouseDown',downType),this);
                this.node.on(upType,this._InputEventAdd('mouseUp',upType),this);
                this.node.on(enterType,this._InputEventAdd('mouseEnter',enterType),this);
                this.node.on(leaveType,this._InputEventAdd('mouseLeave',leaveType),this);
                this.node.on(wheelType,this._InputEventAdd('mouseWheel',wheelType),this);
                this.node.on(moveType,this._InputEventAdd('mouseMove',moveType),this);
                this.enableListens.mouse= true;
            }
        }
        private _addInput_keyboard(inp:IInput_keyborad)
        {
            if(!this.enableListens.keyboard)
            {
                this.enableListens.keyboard = true;
            }
        }
        private _addInput_touch(inp:IInput)
        {
            if(!this.enableListens.touch)
            {
                this.node.on(cc.Node.EventType.TOUCH_MOVE, this.touch, this);
                this.node.on(cc.Node.EventType.TOUCH_START, this.touchStart, this);
                this.node.on(cc.Node.EventType.TOUCH_END, this.touchEnd, this);
                this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.touchCancel, this);
                this.enableListens.touch = true;
            }
        }
        // addInput(inp:IInput_mouse)
        // {

        // }
        removeInput(inp: IInput) {
            var idx = this._tar.findIndex(value => value === inp)
            if(idx>-1)
            this._tar.splice(idx, 1)
        }
        async start() {
            await super.start();
            this.targets.forEach(value => {
                var inter = <IInput><unknown>value
                if (this.instanceofIInput(value)) {
                    this._tar.push(inter)
                }
                else {
                    console.warn("对象未实现接口IInput")
                    console.warn(value)
                }
            })
            if(this.exState === 0)
            {
                var test = this.node['_hitTest'];
                //hookHitTest
                this.node['_hitTest'] = (...arg)=>{
                    if(this.HitTest(...arg))return true;
                    if(test.apply(this.node,arg))return true
                    return false;
                }
            }


        }
        HitTest(...arg):boolean
        {
            for(var i = this.customHitTest.length-1;i>=0;i--)
            {
                var target = this.customHitTest[i].target;
                if(!target)target=this.node;
                if(this.customHitTest[i].callback.apply(target,arguments))return true;
            }
            return false;
        }
        onHitTest(hitTest:(this:cc.Node,point:cc.Vec2,listener:cc.Touch)=>boolean,target:object = null)
        {
            if(!this.customHitTest.find(value=>value.callback===hitTest&&value.target===target))
            {
                this.customHitTest.unshift({callback:hitTest,target})
            } 
        }
        offHitTest(hitTest:(this:cc.Node,point:cc.Vec2,listener:cc.Touch)=>boolean,target:object=null)
        {
            var idx = this.customHitTest.findIndex(value=>value.callback===hitTest&&value.target===target);
            if(idx>-1)
            this.customHitTest.splice(idx,1);
        }
        onDisable() {
            super.onDisable();
            if(this.enableListens.touch)
            {
                this.node.off(cc.Node.EventType.TOUCH_MOVE, this.touch, this);
                this.node.off(cc.Node.EventType.TOUCH_START, this.touchStart, this);
                this.node.off(cc.Node.EventType.TOUCH_END, this.touchEnd, this);
                this.node.off(cc.Node.EventType.TOUCH_CANCEL, this.touchCancel, this);
            }
            if(this.InputEventList.length>0)
            {
                this.InputEventList.forEach(value=>{
                    this.node.off(value.eventType,value.callback,this)
                });
                this.InputEventList = [];
            }
        }
    }
    export class InputState extends State implements IInput {
        touchStart(touchEvent: cc.Touch) {
        }
        touchEnd(touchEvent: cc.Touch) {
        }
        touchCancel(touchEvent: cc.Touch) {
        }
        touch(touchEvent: cc.Touch) {
        }
        ctx: InputManage
        get context(): InputManage {
            return <InputManage>this.ctx
        }
        set context(value) {
            this.ctx = value;
        }
        InputEvent(event:cc.Event,eventName:string)
        {

        }
    }
    var CameraVec = cc.v2();
    export function ConvertInputPointToWorld(point:cc.Vec2,node:cc.Node)
    {
        var Camera = cc.Camera.findCamera(node);
        if(Camera)
        {
            Camera.getCameraToWorldPoint(point,CameraVec);
        }
        else
        {
            CameraVec.set(point);
        }
        return CameraVec;
    }
    export function ConvertInputPointToWorldDec<T extends cc.Component>(target:T, methodName: string, paramIndex: number)
    {
        var old:Function = target[methodName];
        target[methodName]=function(){
            var param = arguments[paramIndex];
            if(param&&param['x']&&param['y'])
            {
                arguments[paramIndex] = ConvertInputPointToWorld(param,this.node);
            }
            old.apply(this,arguments);
        }
    }
    

}

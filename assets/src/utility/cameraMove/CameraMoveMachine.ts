import { MSM } from "../../frame/StateMachine/StateMachine";
import {  MSMDsc } from "../../frame/StateMachine/StateDec";
import { IInput, IPSM, IInput_mouse, InputType } from "../../frame/InputManage";

// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html
const{mStateMachine,mSyncFunc}=MSMDsc;
const{StateMachine,State}=MSM;
const {ccclass, property} = cc._decorator;

export module CameraMoveMachine
{
    @mStateMachine
    @ccclass
    export  class CameraMoveMachine extends StateMachine implements IInput,IInput_mouse {
        mouseDown(mouseEvent: cc.Event.EventMouse) {

        }
        mouseUp(mouseEvent: cc.Event.EventMouse) {

        }
        mouseEnter(mouseEvent: cc.Event.EventMouse) {

        }
        mouseLeave(mouseEvent: cc.Event.EventMouse) {

        }
        @mSyncFunc
        mouseWheel(mouseEvent: cc.Event.EventMouse) {

        }
        mouseMove(mouseEvent: cc.Event.EventMouse) {

        }
        touchs:{id:number,point:cc.Vec2}[] = []
        nCamera:cc.Camera = null
        @mSyncFunc
        touch(touchEvent: cc.Touch) {
    
        }
        @mSyncFunc 
        touchStart(touchEvent: cc.Touch) {
    
        }
        @mSyncFunc
        touchEnd(touchEvent: cc.Touch) {
    
        }
        @mSyncFunc
        touchCancel(touchEvent: cc.Touch) {
    
        }
        changeCameraZoom(nextRatio:number)
        {
            nextRatio = Math.max(Math.min(3,nextRatio),0.3)
            this.nCamera.zoomRatio = nextRatio;
            return nextRatio;
        }
        start()
        {
            super.start();
            IPSM.InputManage.getInstance().addInput(this);
            IPSM.InputManage.getInstance().addInput(this,InputType.mouse);
            this.nCamera = this.getComponent(cc.Camera)
        }
        @mSyncFunc
        touchExit(t:cc.Touch)
        {
            this.touchs.splice(this.touchs.findIndex(value=>value.id===t.getID()),1)
        }
    
    
    }
    export class CameraMoveState extends State implements IInput,IInput_mouse
    {
        mouseDown(mouseEvent: cc.Event.EventMouse) {

        }
        mouseUp(mouseEvent: cc.Event.EventMouse) {

        }
        mouseEnter(mouseEvent: cc.Event.EventMouse) {

        }
        mouseLeave(mouseEvent: cc.Event.EventMouse) {

        }
        mouseWheel(mouseEvent: cc.Event.EventMouse) {

        }
        mouseMove(mouseEvent: cc.Event.EventMouse) {

        }
        context:CameraMoveMachine
        touch(touchEvent: cc.Touch) {
    
        }    
        touchStart(touchEvent: cc.Touch) {
    
        }
        touchEnd(touchEvent: cc.Touch) {
    
        }
        touchCancel(touchEvent: cc.Touch) {
    
        }
        touchExit(t:cc.Touch)
        {

        }
    
        
    }
    
}

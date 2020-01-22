import { MSM } from "../StateMachine/StateMachine";
import { MSMDsc } from "../StateMachine/StateDec";
const {ccclass} = cc._decorator
@MSMDsc.mStateMachine
@ccclass
export default class MachineTest extends MSM.StateMachine {
    testNumber:number = 0;
    @MSMDsc.mSyncFunc
    input(i:number){
        console.log(i)
    }
    async start(){
        await super.start();
        setInterval(()=>{
            this.input(1);
        },1000);
    }
}
@MSMDsc.mState(MachineTest)
@MSMDsc.mDefaultState
@MSMDsc.mLinkTo(()=>TestNextState,'next')
export class TestDefaultState extends MSM.State<MachineTest> implements MSM.IBaseState<MachineTest> {
    input(i){

        console.log(i);
        this.context.testNumber++;
        this.context.emit('next');
    }
}
@MSMDsc.mState(MachineTest)
@MSMDsc.mLinkTo(()=>TestDefaultState,'next')
export class TestNextState extends MSM.State<MachineTest> implements MSM.IBaseState<MachineTest> {
    input(i){
        console.log(this.context.testNumber)
        this.context.emit('next')
    }
}
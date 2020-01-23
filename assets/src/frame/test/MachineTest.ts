import { MSM } from "../StateMachine/StateMachine";
import { MSMDsc } from "../StateMachine/StateDec";
const {ccclass,property} = cc._decorator

@MSMDsc.mStateMachine
@ccclass
export default class MachineTest extends MSM.StateMachine {
    testNumber:number = 0;
    @property()
    time:number = 1;
    @property()
    info:string = 'hello'
    @MSMDsc.mSyncFunc
    input(i:number){
        console.log(i)
    }
    async start(){
        await super.start();
        let _baseTime = this.time;
        let _outputInfo = this.info;
        this.startCoroutine_Auto((function*(){
            while(true){
                yield MSM.AwaitNextSecond.getInstance(_baseTime+Math.random())
                console.log(_outputInfo)
            }
        })())
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
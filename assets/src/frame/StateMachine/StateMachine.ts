import ObjectPool, { IObpool } from "../ObjectPool/ObjectPool";
import ObjectFactory from "../ObjectPool/ObjectFactory";
import {EventEmitter} from "events"
export module MSM {
    export class OperatorStruct<Q> implements IObpool {
        recycle() {
            OperatorStruct.OP.push(this);
        }
        unuse() {
            this.canOperator = true;
            this.operatorInformation = Object.create(null);
        }
        reuse() {
        }
        public canOperator: boolean = true;
        public operatorValue: Q = null;
        public operatorInformation: any = Object.create(null);
        public static OP: ObjectPool<OperatorStruct<any>> = new ObjectPool<OperatorStruct<any>>(false);
        public static getinstance<T>(value?: T): OperatorStruct<T> {
            var os: OperatorStruct<T> = this.OP.pop();
            if (!os) {
                os = new OperatorStruct(value);
            }
            os.operatorValue = value;
            return os;
        }
        constructor(value?: Q) {
            this.operatorValue = value;
            //if(!OperatorStruct.cachesOperator)OperatorStruct.cachesOperator = this;
        }
        destroy() {
            OperatorStruct.OP.push(this);
        }
    }
    export class State<T extends BaseStateMachine = BaseStateMachine> extends EventEmitter {
        stateName: string = ''
        context: T = null;
        _isAttach: boolean = false;
        constructor(cxt: T) {
            super()
            this.context = cxt;
        }
        OnLoad()
        {
            
        }
        Start(...arg) {
        }
        update(dt: number, op: OperatorStruct<any>) {

        }
        disable() {

        }
        Quit() {
            this.emit('quitEvent')
        }
        /**
         * 如果此状态为附加状态则此状态退出
         */
        done() {
            if (this._isAttach)
            {
                this.context.attachQuit(this);
            } 
            this.context.emit("done");
        }
    }
    type FilterMember<T,M> = Partial<Pick<T,{[K in keyof T]:T[K] extends M?K:never}[keyof T]>>
    /**
     * 状态接口
     * 当状态会实现状态机部分接口时实现，如不想实现任何接口则不应该实现
     */
    export type IBaseState<T extends BaseStateMachine> = FilterMember<Omit< T,keyof BaseStateMachine>,(...arg:any[])=>void>;
    
    export class AwaitNext implements IObpool {
        unuse() {

        }
        reuse() {
        }
        recycle() {
            if(this._factor)
            {
                this._factor.push(this);
            }
        }
        protected _factor:ObjectFactory<AwaitNext> = null;
        count: number = 1;
        type: number = 1;
        static OF:ObjectFactory<AwaitNext> = null;
        static getInstance():AwaitNext
        {
            if(!this.OF)
            {
                this.OF = new ObjectFactory(true,AwaitNext);
            }
            let re =this.OF.pop();
            re._factor = this.OF;
            return re;
        }
    }
    export class AwaitNextUpdate extends AwaitNext {
        constructor(count: number = 1) {
            super();
            this.type = 1;
            this.count = count;
        }
        static OF:ObjectFactory<AwaitNextUpdate> = null;
        static getInstance(count:number=1):AwaitNextUpdate
        {
            if(!this.OF)
            {
                this.OF = new ObjectFactory(true,AwaitNextUpdate);
            }
            let re = this.OF.pop();
            re._factor = this.OF;
            re.count = count;
            return re;
        }
    }
    export class AwaitNextSecond extends AwaitNext {
        time: number;
        constructor(sec: number) {
            super()
            this.type = 2;
            this.time = sec;
        }
        static OF:ObjectFactory<AwaitNextSecond> = null;
        static getInstance(sec:number=1):AwaitNextSecond
        {
            if(!this.OF)
            {
                this.OF = new ObjectFactory(true,AwaitNextSecond,1);
            }
            let re = this.OF.pop();
            re._factor = this.OF;
            re.time = sec;
            return re;
        }
    }
    class DCoroutine implements IObpool {
        unuse(...value: any[]) {
            this.time=0;
            this.count=0;
            this.type = 0;
            this.timmer = 0;
            this.countor = 0;
            this.mask = 0;
            this.NIter = null;
        }
        reuse(Iter: Iterator<AwaitNext>,mask?:number) {
            this.NIter = Iter;
            this.setAttr(0);
            if(mask)this.mask = mask;
        }
        recycle(...value: any[]) {
            ObjectPool.GlobalPush(this);
        }
        time: number = 0;
        count: number = 0;
        type: number = 0;
        NIter: Iterator<AwaitNext,any,any>;
        timmer: number = 0;
        countor: number = 0;
        mask:number = 0;
        callback: (dc: DCoroutine) => void;
        constructor(Iter: Iterator<AwaitNext,any,any>,mask?:number) {
            if(Iter)
            {
                this.NIter = Iter;
                this.setAttr(0);
            }
            if(mask)this.mask = mask;
        }
        setAttr(dt: number) {
            var result = this.NIter.next(dt);
            if (!result.done) {
                this.setValue(result.value ? result.value : AwaitNextUpdate.getInstance());
            }
            else {
                if (this.callback)this.callback(this);
                //this.recycle()
            }
        }
        setValue(value: AwaitNext) {
            this.type = value.type;
            switch (this.type) {
                case 1:
                    this.count = (<AwaitNextUpdate>value).count;
                    break;
                case 2:
                    this.time = (<AwaitNextSecond>value).time;
                    break;
                default:
                    break;
            }
            value.recycle();
        }
        Update(dt: number) {
            switch (this.type) {
                case 1:
                    this.countor++;
                    if (this.countor >= this.count) {
                        this.countor == 0;
                        this.setAttr(dt);
                    }
                    break;
                case 2:
                    if (this.timmer < this.time) {
                        this.timmer += dt;
                    }
                    else {
                        this.timmer = 0;
                        this.setAttr(dt);
                    }
                    break;
            }
        }
    }
    type CSpeed = {mask:number,speed:number}
    const { ccclass, property } = cc._decorator;
    
    export class BaseStateMachine extends cc.Component implements IObpool {
        unuse(value?) {
            //回收时清理当前状态
            this.nowState = null;
            this.CoroutinesSpeed = [];
        }
        reuse(value?) {
            //启动状态
            this.emit('start');
        }
        recycle(value?) {

        }
        nowState: State = null
        attachment: { ch: State[], construct: { prototype: State } }[] = [];
        sqs: State[] = [];
        stateIns: { Ins: State, Name: string }[] = [];
        strelation: SR[];
        LSMDB: SM;
        Coroutines: DCoroutine[] = [];
        CoroutinesSpeed:CSpeed[] = [];
        protected listenlist: { eventName: string, callback: (eventName: string) => void }[] = [];
        changeState(cs: State,...arg) {
            if (this.nowState) this.nowState.Quit();
            this.nowState = cs;
            cs.Start.apply(cs,arg);
        }
        /**
         * 初始化状态池，并且进入默认状态
         */
        Init()
        {
            if(this.stateIns.length==0&&this.LSMDB&&this.LSMDB.sts&&this.LSMDB.sts.length>0)
            {
                this.LSMDB.sts.forEach(value => {
                    var st: State = new value.st(this);
                    st.stateName = value.name;
                    this.LSMDB.stateRelation.forEach(v=>{
                        if(typeof v.target==='string'&&v.target===value.name)
                        {
                            v.target = value.st;
                        }
                    });
                    st.OnLoad();
                    this.stateIns.push({ Ins: st, Name: value.name });
                })
                this.emit('start')
            }
            
        }
        /**
         * 状态机start方法子类必须调用
         */
        async start()
        {
            return new Promise((res)=>{
                setTimeout(()=>{
                    this.Init();
                    res();
                })
            })
        }
        private DCFactor:ObjectFactory<DCoroutine> = null;
        startCoroutine(iter: DCoroutine) {
            iter.callback = value => {
                var idx = this.Coroutines.findIndex(cor => { return cor === value })
                if(idx>-1)
                this.Coroutines.splice(idx, 1);
            }
            this.Coroutines.push(iter);
            return iter;
        }
        startCoroutine_Auto(iter: Iterator<AwaitNext>,mask?:number) {
            if(!this.DCFactor)this.DCFactor = new ObjectFactory<DCoroutine>(true,DCoroutine);
            return this.startCoroutine(new DCoroutine(iter,mask));
        }
        stopCoroutine(iter:DCoroutine)
        {
            var idx = this.Coroutines.findIndex(value=>value ===iter);
            if(idx>-1)
            {
                var oldCor = this.Coroutines[idx];
                this.Coroutines.splice(idx);
                //TODO:池化操作
            }
        }
        stopAllCoroutine(){
            this.Coroutines.length = 0;
        }
        /**
         * 设置协同程序的运行速度
         * @param speed 1为标准速度值越大越快
         * @param mask 影响遮罩，（小范围的影响会覆盖大范围的影响）
         */
        setCoroutineSpeed(speed:number,mask:number=1)
        {
            if(this.CoroutinesSpeed.length===0)
            {
                this.CoroutinesSpeed.push({mask:mask,speed:speed});
            }
            else
            {
                var csp:CSpeed =this.CoroutinesSpeed.find(v=>v.mask===mask)
                if(!csp)
                {
                    //从大到小插入
                    var idx = this.CoroutinesSpeed.findIndex(v=>mask<v.mask);
                    if(idx===-1)
                    {
                        this.CoroutinesSpeed.unshift({mask:mask,speed:speed});
                    }
                    else
                    {
                        var del = this.CoroutinesSpeed.splice(idx+1,this.CoroutinesSpeed.length-1);
                        this.CoroutinesSpeed.push({mask:mask,speed:speed});
                        this.CoroutinesSpeed = this.CoroutinesSpeed.concat(del);
                    }
                }
                else
                {
                    csp.speed = speed;
                }
            }
        }
        AwaitUntil(target:()=>boolean):Promise<any>
        {
            return new Promise((resolve,reject)=>{
                this.startCoroutine_Auto((function*(){
                    while(!target())
                    {
                        yield AwaitNext.getInstance();
                    }
                    resolve();
                })())
            })
        }
        update(dt: number) {
            if (this.Coroutines.length != 0) {
                for (var i = this.Coroutines.length - 1; i >= 0; i--) {
                    var item = this.Coroutines[i];
                    var ndt:number = dt;
                    if(this.CoroutinesSpeed.length>0)
                    {
                        this.CoroutinesSpeed.forEach(v=>{
                            if(item.mask&v.mask)
                            {
                                ndt = dt*v.speed;
                            }
                        });
                    }
                    this.Coroutines[i].Update(ndt);
                }
            }
            var op = OperatorStruct.getinstance();
            if (this.nowState) this.nowState.update(dt, op);
        }
        attachState<T extends State>(type: {new(ctx:StateMachine):State},...arg): T {
            //创建实例
            var cs: T = type.apply({ __proto__: type.prototype }, [this])
            cs.once("quitEvent",this.attachQuit.bind(this))
            var fch = this.attachment.find((value) => {
                if (value.construct === type) return true;
            });
            if (fch) {
                fch.ch.push(cs);
            }
            else {
                this.attachment.push({ ch: new Array(cs), construct: type });
            }
            this.sqs.push(cs);
            cs._isAttach = true;
            setTimeout(() => {
                cs.Start(...arg);
            })
            return cs;
        }
        attachQuit(CS: State) {
            let typestr = typeof CS;
            var chindex = 0;
            let index = this.attachment.findIndex((value) => {
                if (value.ch.find((v2, index: number) => {
                    if (v2 === CS) {
                        chindex = index;
                        return true;
                    }
                })) return true;
            });
            var index2 = this.sqs.findIndex((value: State) => {
                if (value === CS) return true;
            });
            if(index>-1)
            {
                this.attachment[index].ch.splice(chindex, 1);
                if (this.attachment[index].ch.length < 1) this.attachment.splice(index,1);
            }
            if(index2>-1)
            this.sqs.splice(index2, 1);
            else
            CS.Quit();
            
        }
        getAttachs<T extends State>(type: { prototype: T, apply: Function }): T[] {
            for (let val in this.attachment) {
                if (this.attachment[val].construct === type) return <T[]>this.attachment[val].ch;
            }
            return null;
        }
        getAttach<T extends State>(type: { prototype: T, apply: Function }): T {
            let ats = this.getAttachs(type);
            return <T>(ats ? ats[0] : ats);
        }


        forEachAttach(functionName: string, os: OperatorStruct<any>, ...arg) {
            if (this.sqs.length > 0) {
                for (var i = this.sqs.length - 1; i >= 0; i--) {
                    arg.push(os);
                    //this.sqs[i][functionName].apply(this.sqs[i], arg);
                    if(this.sqs[i][functionName])this.sqs[i][functionName].apply(this.sqs[i],arg);
                }
            }
        }
        /**
         * 修改一个附加状态的执行顺序
         */
        changAttachStateOrder(cs: State, order: number) {
            var idx = this.sqs.findIndex((value) => { if (value === cs) return true });
            if(idx>-1)
            {
                var newArr = this.sqs.splice(idx, 1);
                newArr.splice(order, 0, this.sqs[idx]);
                this.sqs = newArr;
            }
        }
        getStatesLength(): number {
            return this.sqs.length;
        }
        /**
         * 引发一个事件
         * @param eventName 事件名
         */
        emit(eventName: string,...arg) {
            var st =this.strelation?this.strelation.find(value => {
                if(value.type===1)
                {
                    return value.eventname == eventName &&this.nowState&& (value.source == this.nowState['constructor']||!value.source);
                }
                else
                {
                    return value.eventname===eventName;
                }
            }):null;
            if (st) {
                var tarIns = this.stateIns.find(value => { return value.Ins['constructor'] === st.target })
                if(tarIns&&(st.type===1||st.type===2||st.type===3)&&this.nowState!==tarIns.Ins)
                {
                    this.changeState(tarIns.Ins,...arg);
                }
                else if(st.target&&typeof st.target !=='string')
                {
                    if(st.type&8)
                    {
                        if(!this.sqs.find(v=>v['constructor']===st.target))
                        {
                            this.attachState(st.target,...arg);
                        }
                    }
                    else
                    {
                        this.attachState(st.target,...arg);
                    }
                    
                }
            }
            var emitArgs = [eventName];
            emitArgs.push(...arg);
            this.node.emit.apply(this.node,emitArgs);
        }
        private listenToemit(eventName: string) {
            this.emit(eventName);
        }
        listen(eventName: string) {
            if (!this.listenlist.find(value => value.eventName === eventName)) {
                var callback = (function (eventName) {
                    return () => {
                        this.listenToemit(eventName)
                    }
                })(eventName)
                this.listenlist.push({ eventName: eventName, callback: callback })
                this.node.on(eventName, callback, this);
            }
        }
        cancelListen(eventName: string) {
            var list = this.listenlist.find(vlaue => vlaue.eventName === eventName)
            if (list) {
                this.node.off(list.eventName, list.callback, this)
            }
        }
        onDestroy() {
            if(this.nowState)
            this.nowState.Quit();
            this.sqs.forEach(value => {if(value)value.Quit() });
        }
        onDisable() {
            if(this.nowState)
            this.nowState.disable();
            this.sqs.forEach(value => { if(value)value.disable() });
        }

    }
    @ccclass
    export class StateMachine extends BaseStateMachine {

    }

    export class StateMachine_base  {
        nowState: State = null
        attachment: { ch: State[], construct: { prototype: State } }[] = [];
        sqs: State[] = [];
        stateIns: { Ins: State, Name: string }[] = [];
        strelation: SR[];
        LSMDB: SM;
        Coroutines: DCoroutine[] = [];
        protected listenlist: { eventName: string, callback: (eventName: string) => void }[] = [];
        changeState(cs: State) {
            if (this.nowState) this.nowState.Quit();
            this.nowState = cs;
            cs.Start();
        }
        start() {
            this.LSMDB.sts.forEach(value => {
                var st: State = new value.st(this)
                st.OnLoad();
                this.stateIns.push({ Ins: st, Name: value.name })
            })
            this.emit('start')
        }
        startCoroutine(iter: DCoroutine) {
            iter.callback = value => {
                this.Coroutines.splice(this.Coroutines.findIndex(cor => { return cor === value }), 1);
            }
            this.Coroutines.push(iter);
            return iter;
        }
        startCoroutine_Auto(iter: Iterator<AwaitNext>) {
            //TODO:池化
            return this.startCoroutine(new DCoroutine(iter));
        }
        stopCoroutine(iter:DCoroutine)
        {
            var idx = this.Coroutines.findIndex(value=>value ===iter);
            if(idx>-1)
            {
                var oldCor = this.Coroutines[idx];
                this.Coroutines.splice(idx);
                //TODO:池化操作
            }
        }
        update(dt: number) {
            if (this.Coroutines.length != 0) {
                for (var i = this.Coroutines.length - 1; i >= 0; i--) {
                    this.Coroutines[i].Update(dt);
                }
            }
            var op = OperatorStruct.getinstance();
            if (this.nowState) this.nowState.update(dt, op);
        }
        attachState<T extends State>(type: { prototype: T, apply: Function }): T {
            //创建实例
            var cs: T = type.apply({ __proto__: type.prototype }, [this])
            cs.once("quitEvent",this.attachQuit)
            var fch = this.attachment.find((value) => {
                if (value.construct === type) return true;
            });
            if (fch) {
                fch.ch.push(cs);
            }
            else {
                this.attachment.push({ ch: new Array(cs), construct: type });
            }
            this.sqs.push(cs);
            cs._isAttach = true;
            setTimeout(() => {
                cs.Start();
            })
            return cs;
        }
        attachQuit(CS: State) {
            let typestr = typeof CS;
            var chindex = 0;
            let index = this.attachment.findIndex((value) => {
                if (value.ch.find((v2, index: number) => {
                    if (v2 === CS) {
                        chindex = index;
                        return true;
                    }
                })) return true;
            });
            let index2 = this.sqs.findIndex((value: State) => {
                if (value === CS) return true;
            });
            this.attachment[index].ch.splice(chindex, 1);
            this.sqs.splice(index2, 1);
            if (this.attachment[index].ch.length < 1) delete this.attachment[typestr];
        }
        getAttachs<T extends State>(type: { prototype: T, apply: Function }): T[] {
            for (let val in this.attachment) {
                if (this.attachment[val].construct === type) return <T[]>this.attachment[val].ch;
            }
            return null;
        }
        getAttach<T extends State>(type: { prototype: T, apply: Function }): T {
            let ats = this.getAttachs(type);
            return <T>(ats ? ats[0] : ats);
        }


        forEachAttach(functionName: string, os: OperatorStruct<any>, ...arg) {
            if (this.sqs.length > 0) {
                for (var i = this.sqs.length - 1; i >= 0; i--) {
                    arg.push(os);
                    this.sqs[i][functionName].apply(this.sqs[i], arg);
                }
            }
        }
        /**
         * 修改一个附加状态的执行顺序
         */
        changAttachStateOrder(cs: State, order: number) {
            var idx = this.sqs.findIndex((value) => { if (value === cs) return true });
            if(idx>-1)
            {
                var newArr = this.sqs.splice(idx, 1);
                newArr.splice(order, 0, this.sqs[idx]);
                this.sqs = newArr;
            }
        }
        getStatesLength(): number {
            return this.sqs.length;
        }
        /**
         * 引发一个事件
         * @param eventName 事件名
         */
        emit(eventName: string) {
            var st = this.strelation.find(value => {
                if (!this.nowState) {
                    return value.eventname == eventName
                }
                else {
                    return value.eventname == eventName && (value.source == this.nowState['constructor']||!value.source)
                }
            })
            if (st) {
                var tarIns = this.stateIns.find(value => { return value.Ins['constructor'] === st.target })
                if (tarIns) {
                    this.changeState(tarIns.Ins)
                }
            }

        }
        private listenToemit(eventName: string) {
            this.emit(eventName);
        }
        listen(eventName: string) {
            // if (!this.listenlist.find(value => value.eventName === eventName)) {
            //     var callback = (function (eventName) {
            //         return () => {
            //             this.listenToemit(eventName)
            //         }
            //     })(eventName)
            //     this.listenlist.push({ eventName: eventName, callback: callback })
            //     this.node.on(eventName, callback, this);
            // }
        }
        cancelListen(eventName: string) {
            // var list = this.listenlist.find(vlaue => vlaue.eventName === eventName)
            // if (list) {
            //     this.node.off(list.eventName, list.callback, this)
            // }
        }
        onDestroy() {
            this.nowState.Quit();
            this.sqs.forEach(value => { value.Quit() });
        }
        onDisable() {
            this.nowState.disable();
            this.sqs.forEach(value => { value.disable() });
        }
        disable()
        {
            this.onDisable();
        }
        destroy()
        {
            this.onDestroy();
        }

    }
}


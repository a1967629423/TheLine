import { MSM } from "./StateMachine";
type SMSave = {machine:{new():MSM.StateMachine},sname:string};
type Constructor<T extends Object> = {new(...args:any[]):T}
type ConstructorOneParam<T extends Object,P> = {new(arg:P):T}
type ConstructorGetter<T> = (()=>Constructor<T>)
async function setTimeoutAsync(t=0){
    return new Promise((res)=>{
        setTimeout(()=>res(),t);
    })
}
function getFunctionName(callee:Function):string{
    if(typeof callee.name === 'string')return callee.name;
    var _callee = callee.toString().replace(/[\s\?]*/g,""),

    comb = _callee.length >= 50 ? 50 :_callee.length;

    _callee = _callee.substring(0,comb);

    var name = _callee.match(/^function([^\(]+?)\(/);

    if(name && name[1]){

      return name[1];

    }

    var caller = callee.caller,

    _caller = caller.toString().replace(/[\s\?]*/g,"");

    var last = _caller.indexOf(_callee),

    str = _caller.substring(last-30,last);

    name = str.match(/var([^\=]+?)\=/);

    if(name && name[1]){

      return name[1];

    }

    return "anonymous"
}
export module MSMDsc {
    var SMDB: SM[] = [];
    /**
     * 
     * 状态机装饰器
     */
    export function mStateMachine<T extends MSM.StateMachine>(target: { prototype: T }) {
        if (!SMDB.find(value => { return value.sm == target })) {
            var p = { sm: target, sts: [], stateRelation: [], eventsName: [] };
            SMDB.push(p);
            target.prototype.strelation = p.stateRelation;
            target.prototype.LSMDB = p;
        }
    }
    /**
     * 状态装饰器
     * 默认取类名为状态名
     * @param machine 所依附的状态机
     */
    export function mState<T extends MSM.StateMachine, P extends MSM.State>(machine:Constructor<T>):((target: { new(ctx: T): P })=>any)
    /**
     * 状态装饰器
     * @param name 状态名
     * @param machine 所依附的状态机
     */
    export function mState<T extends MSM.StateMachine, P extends MSM.State>(name:string,machine:Constructor<T>):((target: { new(ctx: T): P })=>any)
    export function mState<T extends MSM.StateMachine, P extends MSM.State>(p1: string|Constructor<T>, p2?: Constructor<T>) {
        let constructor:Constructor<T> = typeof p1 === 'function'?p1:p2;
        return (target: { new(ctx: T): P }) => {
            let stateName =  typeof p1 === 'string'?p1:getFunctionName(target);
            var gsu = SMDB.find(value => { return value.sm == constructor });
            if (gsu)
                gsu.sts.push({ st: target, name: stateName });
            else {
                var p = { sm: constructor, sts: [{ st: target, name: stateName }], stateRelation: [], eventsName: [] };
                constructor.prototype.strelation = p.stateRelation;
                constructor.prototype.LSMDB = p;
                SMDB.push(p);
            }
            target.prototype.stateName = stateName;
            var sus:SMSave[] = target.prototype['_su_']
            if(!sus)
            {
                sus = [{machine:constructor,sname:stateName}];
                target.prototype['_su_'] = sus;
            }
            else
            {
                sus.push({machine:constructor,sname:stateName});
            }
        }
    }
    /**
     * 默认状态装饰器
     * 默认状态会在状态机初始化时自动切换，默认状态只允许一个，切换默认状态的事件名为start
     */
    export function mDefaultState<T extends MSM.StateMachine, P extends MSM.State>(target: ConstructorOneParam<P,T>) {
        function initDefault() {
            
            var _su: SMSave[] = target.prototype['_su_'];

            if (!!_su) {
                var su = _su[0].machine;
                if (su.prototype.strelation.find(value => { return value.eventname === 'start' })) {
                    console.log("DefaultState only one");
                    return;
                }
                su.prototype.strelation.push({ eventname: 'start', source: null, target: target, type: 2 });
            }
        }
        if(!target.prototype) return 
        if (typeof target.prototype['_su_'] === 'undefined') {
            setTimeout(() => { initDefault() })
        }
        else {
            initDefault()
        }
    }
    /**
     * 使用或创建一个过渡事件，当事件被触发时会将此状态切换为当前状态
     * @param targenamet 目标状态名或状态
     * @param eventname 触发事件名
     */
    export function mLinkTo<T extends MSM.State, P extends MSM.StateMachine>(targenamet: string|(()=>{new(...args:any[]):MSM.State}), eventname: string,applyAllMachine:boolean = false) {
        var e_name = eventname;
        var t_name = targenamet;
        async function initLink(tar: { new(cxt: P): T }) {
            var gsu: SM;
            var _su: SMSave[] = tar.prototype['_su_'];
            if (!_su) {
                console.error("su is undefind");
                return;
            }
            var su  =_su[0].machine;
            let n_name:string;
            if(typeof t_name === 'function'){
                await setTimeoutAsync();
                let t = t_name();
                n_name = t.prototype['stateName']
            }else {
                n_name = t_name;
            }
            if (gsu = SMDB.find(value => { return value.sm == su })) {
                var linkc = gsu.sts.find(value => { return value.name == n_name });
                if (linkc) {
                    gsu.stateRelation.push({ source: tar, target: linkc.st, eventname: e_name, type: 1 });
                }
                else {
                    gsu.stateRelation.push({ source: tar, target: n_name, eventname: e_name, type: 1 });
                }
                if (!gsu.eventsName.find(value => { return value === e_name })) gsu.eventsName.push(e_name)
            }
        }
        return (target: { new(cxt: P): T }) => {
            if(!target.prototype)return
            if (!target.prototype['_su_']) {
                setTimeout(() => { initLink(target) });
            }
            else { 
                initLink(target);
            }
        }
    }
    export function mGlobalLinkTo<T extends MSM.State, P extends MSM.StateMachine>(eventname: string,applyAllMachine:boolean = false)
    {
        function initDefault(target:{new(cxt: P): T }) {
            var _su: SMSave[] = target.prototype['_su_'];
            if (_su) {
                var su = _su[0].machine;
                if (su.prototype.strelation.find(value => { return value.eventname === eventname })) {
                    console.log("GlobalState only one");
                    return;
                }
                su.prototype.strelation.push({ eventname: eventname, source: null, target: target, type: 3 });
            }
        }
        return (target: { new(cxt: P): T }) => {
            if (!target.prototype['_su_']) {
                (function(target){
                    setTimeout(() => { initDefault(target) })
                })(target)
            }
            else {
                initDefault(target)
            }
        }
    }
    function initAttach<T extends MSM.State, P extends MSM.StateMachine>(tar: { new(cxt: P): T }, eventname: string,applyAllMachine:boolean = false) {
        var gsu: SM;
        var _su: SMSave[] = tar.prototype['_su_'];
        if (!_su) {
            console.error("su is undefind");
            return;
        }
        if(applyAllMachine)
        {
            for(var idx in _su)
            {
                var su = _su[idx].machine;
                if (gsu = SMDB.find(value => value.sm === su)) {
                    gsu.stateRelation.push({ source: null, target: tar, eventname: eventname, type: 4 })
                    if (!gsu.eventsName.find(value => { return value === eventname })) gsu.eventsName.push(eventname);
                }
            }
        }
        else
        {
            var su = _su[0].machine;
            if (gsu = SMDB.find(value => value.sm === su)) {
                gsu.stateRelation.push({ source: null, target: tar, eventname: eventname, type: 4 })
                if (!gsu.eventsName.find(value => { return value === eventname })) gsu.eventsName.push(eventname);
            }
        }
    }
    /**
     * 作为Attach状态，当事件被触发时会将此状态附加到状态机上
     * @param eventname 事件名
     */
    export function mAttach<T extends MSM.State, P extends MSM.StateMachine>(eventname: string,applyAllMachine:boolean = false) {
        return (target: { new(cxt: P): T }) => {
            if (!target.prototype['_su_']) {
                setTimeout(() => { initAttach(target, eventname),applyAllMachine })
            } else {
                initAttach(target, eventname,applyAllMachine);
            }
        }
    }
    function changegsu<T extends MSM.State, P extends MSM.StateMachine>(target: { new(ctx: P): T },applyAllMachine:boolean = false) {
        var gsu: SM;
        var _su: SMSave = target.prototype['_su_'];
        if (!_su) {
            console.error("su is undefind");
            return;
        }
        function changeoperator(su:{new():P})
        {
            if (gsu = SMDB.find(value => value.sm === su)) {
                var tars: SR[] = []
                gsu.stateRelation.forEach(value => {
                    if (value.target === target) {
                        tars.push(value);
                    }
                })
                if (tars.length !== 0) {
                    tars.forEach(sr => {
                        sr.type |= 8;
                    });
                }
                else {
                    console.warn('mAttach或mLinkTo应该在前面声明')
                    setTimeout(() => {
                        gsu.stateRelation.forEach(value => {
                            if (value.target === target) {
                                tars.push(value);
                            }
                        })
                        if (tars.length !== 0) {
                            tars.forEach(sr => {
                                sr.type |= 8;
                            });
                        }
                    })
                }
            }
        }
        if(applyAllMachine)
        {
            for(var idx in _su)
            {
                changeoperator(_su[idx]);
            }
        }
        else
        {
            changeoperator(_su[0]);
        }
    }
    /**
     * 保持此附加状态唯一，需要先使用附加状态装饰器
     * 
     */
    export function mUnique<T extends MSM.State, P extends MSM.StateMachine>(applyAllMachine:boolean = false) {
        return function(target: { new(ctx: P): T })
        {
            if (!target.prototype['_su_']) {
                console.warn('mState应该在前面声明');
                setTimeout(() => {
                    changegsu(target,applyAllMachine)
                });
            }
            else {
                changegsu(target,applyAllMachine);
            }
        }
    }
    export function mSyncFunc<P extends MSM.StateMachine>(target: P, methodName: string, descriptor: TypedPropertyDescriptor<any>) {
        setTimeout(() => {
            var m = target[methodName]
            target[methodName] = function (this:P) {
                if(this.nowState)
                {
                    var sm = this.nowState[methodName]
                    if (sm) sm.apply(this.nowState, arguments)
                }
                m.apply(this, arguments)
            }
        })

    }
    export function mSyncAttachFunc<P extends MSM.StateMachine>(target: P, methodName: string, descriptor: TypedPropertyDescriptor<any>) {
        setTimeout(() => {
            var m = target[methodName]
            target[methodName] = function (...arg) {
                var op = MSM.OperatorStruct.getinstance()
                this.forEachAttach(methodName, op, ...arg)
                arg.push(op);
                if(m)m.apply(this, arg)
            }
        })
    }
    //当actionfunction的name项为空时，使用idx作为name
    var actionNameIdx: number = 1;
    type actionData = { nowTime: number, direction: boolean ,iterator:any}
    type actionStruct = {iterator:any,actionName:string,direction:boolean,actionD:actionData,callback?:(this:MSM.State)=>void}
    /**
     * 标识为动作函数，在每次update时调用，每次调用传入dt。注：无论duration设置多长dt始终为0 - 1
     * 基本与Cocos Creator的Action保持一致
     * @param duration 持续时间
     * @param havereverse 是否包括返回行为
     * @param loopCount 循环次数
     * @param callback 动作完成回调
     * @param name 动作名
     */
    export function ActionUpdate<T extends MSM.State>(duration: number, havereverse: boolean = true, loopCount: number = 0, callback: (this: T) => any = null, name?: string) {
        return (target: T, methodName: string, descriptor: TypedPropertyDescriptor<any>) => {
            var oldStart = target.Start;
            //init action pool
            var actions = target['__actions'];
            if (!actions) target['__actions'] = [];
            var ad: actionData = target['__actionData'];
            if (!ad) {
                ad = { nowTime: 0, direction: true ,iterator:null}
                target['__actionData'] = ad;
            }
            var actionFunction = target[methodName];
            //set action name
            var actionName = name
            if (!actionName) actionName = 'action.' + actionNameIdx;
            actionFunction['__actionName'] = actionName;
            target.Start = function (this:T) {
                oldStart.apply(this, arguments);
                var iter = this.context.startCoroutine_Auto((function* (_this) {
                    if (loopCount > 0) {
                        var count = havereverse ? loopCount * 2 : loopCount;
                        while (count) {
                            var dt = yield MSM.AwaitNextUpdate.getInstance();
                            let dir = ad.direction;
                            let nowTime = ad.nowTime;
                            if (dir ? nowTime < duration : nowTime >= 0) {
                                _this[methodName](nowTime === 0 ? 0 : nowTime / duration);
                                ad.nowTime += dt * (dir ? 1 : -1);
                            }
                            else {
                                count--;
                                if (havereverse) {
                                    ad.nowTime = dir ? duration : 0;
                                    ad.direction = !dir;
                                }
                                else {
                                    ad.nowTime = 0;
                                }
                            }
                        }

                        _this[methodName](ad.nowTime === 0 ? 0 : ad.nowTime / duration);
                        if (callback) callback.apply(_this);
                    }
                    else {
                        while (true) {
                            var dt = yield MSM.AwaitNextUpdate.getInstance();
                            let dir = ad.direction;
                            let nowTime = ad.nowTime;
                            if (dir ? nowTime < duration : nowTime >= 0) {
                                _this[methodName](nowTime === 0 ? 0 : nowTime / duration);
                                ad.nowTime += dt * (dir ? 1 : -1);
                            }
                            else if (havereverse) {
                                ad.nowTime = dir ? duration : 0;
                                ad.direction = !dir;
                            }
                            else {
                                ad.nowTime = 0;
                            }
                        }
                    }
                    actionEnd(_this,iter);
                })(this));
                ad.iterator = iter;
                var acts:actionStruct[] = this['__actions']
                if(!acts.some(v=>v.iterator===iter))
                {
                    acts.push({ iterator: iter, actionName: actionName,direction:havereverse,actionD:ad,callback:callback});
                }
            }
        }
    }
    function actionEnd<T extends MSM.State>(target:T,iter:any)
    {
        target.context.stopCoroutine(iter);
        var actions:actionStruct[] = target['__actions'];
        if(actions&&actions instanceof Array)
        {
            var idx = actions.findIndex(v=>v.iterator===iter);
            if(idx>-1)
            {
                var a = actions.splice(idx,1)[0];
                if(a.callback)a.callback.apply(target);
                a.actionD.nowTime = 0;
            }
        }
    }
    export interface IAction
    {
        __actions:actionData[];
    }
    /**
     * 标志此函数调用时会清除掉所有Action
     */
    export function clearAllAction<T extends MSM.State>(target: T, methodName: string, descriptor: TypedPropertyDescriptor<any>) {
        var source: Function = target[methodName];
        target[methodName] = function () {
            var actions:actionStruct[] = this['__actions'];
            actions.forEach(value => {
                //删除片段
                actionEnd(target,value.iterator);
            });
            source.apply(this, arguments);
        }
    }
    /**
     * 此函数不是装饰器函数
     * 停止一个Action
     * @param target 当前类
     * @param ActionFunction Action函数
     */
    export function StopAction<T extends MSM.State>(target: T, ActionFunction: Function) {
        var actionName = ActionFunction['__actionName']
        if (actionName) {
            var action:actionStruct = target['__actions'].find(value => value.actionName === actionName);
            if (action) {
                actionEnd(target,action.iterator)
            }
        }
    }
}


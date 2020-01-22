declare type SR={
    source:{new(cxt:StateMachine):State}
    target:{new(cxt:StateMachine):State}|string
    type:number
    eventname:string
}
declare type SM={
    sm:{prototype:StateMachine}
    sts:{st:{new(cxt:StateMachine):State},name:string}[]
    stateRelation:SR[]
    eventsName:string[]
}
declare interface Observer<T>
{
    ob_update(data:T)
}
declare interface Observerable<T>
{
    registerObserver(o:Observer<T>)
    removeObserver(o:Observer<T>)
    notifyObserver(...arg)
}


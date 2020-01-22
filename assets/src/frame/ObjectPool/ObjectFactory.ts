import ObjectPool from "./ObjectPool";


export default class ObjectFactory<T> extends ObjectPool<T>  {
    private csr:{new (...args):T}=null
    args:any[] = []
    constructor(dir:boolean,csr:{new (...arg):T},...args)
    {
        super(dir);
        this.csr = csr;
        this.args = args;
    }
    pop(...v):T
    {
        var reuslt = super.pop(v);
        if(!reuslt)
        {
            reuslt = new this.csr()
            this.UnuseCallback(reuslt);
        }
        this.ReuseCallback(reuslt,v);
        return reuslt
    }
    static S_Push(val:any)
    {
        if(val['__factory'])
        {
            val['__factory'].push(val);
        }
    }
}

import ObjectPool from "../ObjectPool/ObjectPool";


const {ccclass, property} = cc._decorator;
/**
 * Prefab工厂类，将此类放置在node上并填入需要使用的Prefab就会自动实例化
 */
@ccclass
export default class PrefabFactor extends cc.Component {
    @property([cc.Prefab])
    Prefabs:{prefab:cc.Prefab,path:string}[] = []
    @property
    InitValue:number = 10;
    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}
    PrefabPool:{name:string,pool:ObjectPool<cc.Node>,prefab:cc.Prefab,path:string}[] = []
    private isStatic:boolean = false;
    isLoaded:boolean = false;
    static NodePush(node:cc.Node)
    {
        var factory:PrefabFactor =node['__factory']
        if(factory)
        {
            factory.push(node);
        }
        else
        {
            if(CC_DEBUG)
            {
                console.log('node not have factory');
                console.log(node);
            }
        }
    }
    private static _Instance:PrefabFactor = null
    static get Instance():PrefabFactor
    {
        if(!this._Instance)
        {
            var node = new cc.Node('staticPF');
            var pf = node.addComponent(PrefabFactor);
            pf.isStatic = true;
            this._Instance = pf;
            pf.LoadAllRes();
            cc.game.addPersistRootNode(node);
        }
        return this._Instance;
    }
    static Loaded:string = 'Loaded';
    Nodefactory(pree:{prefab:cc.Prefab,path:string})
    {
        var pre = pree.prefab
        var node = cc.instantiate(pre);
        node['__factoryName']=pre.name;
        node['__factory']=this;
        return node;
    }
    static LoadRes(path,type?:typeof cc.Asset):Promise<any>
    {
        return new Promise<any>((res,rej)=>{
            if(type)
            {
                cc.loader.loadRes(path,type,(err,data)=>{
                    if(err)
                    {
                        console.error('cc.loader.loadRes prefab/config.json '+err.message)
                        rej();
                    }
                    else
                    {
                        res(data);
                    }
                })
            }
            else
            {
                cc.loader.loadRes(path,(err,data)=>{
                    if(err)
                    {
                        console.error('cc.loader.loadRes prefab/config.json '+err.message)
                        rej();
                    }
                    else
                    {
                        res(data);
                    }
                })
            }
        }) 
    }
    static prefabConfig = 'prefab/config';
    async LoadAllRes()
    {
        var data = await PrefabFactor.LoadRes(PrefabFactor.prefabConfig);
        if(data)
        {
            var config = data.json;
            for(var item in config.path)
            {
                this.Prefabs.push({prefab: await PrefabFactor.LoadRes(config.path[item],cc.Prefab),path:config.path[item]}) 
            }
            this.PrefabPoolInit();
        }
        else
        {
            this.node.emit(PrefabFactor.Loaded,false);
        }
    }
    PrefabPoolInit()
    {
        if(this.PrefabPool.length!=this.Prefabs.length)
        {
            this.Prefabs.forEach(value=>{
                var pool = new ObjectPool<cc.Node>(false);
                for(var i=0;i<this.InitValue;i++)
                {
                    pool.push(this.Nodefactory(value));
                }
                this.PrefabPool.push({name:value.prefab.name,pool,prefab:value.prefab,path:value.path})
            })
        }
        this.isLoaded = true;
        this.node.emit(PrefabFactor.Loaded,true);
    }
    LPoolInit(pree:{prefab:cc.Prefab,path:string})
    {
        var value =pree
        var pool = new ObjectPool<cc.Node>(false);
        for(var i=0;i<this.InitValue;i++)
        {
            pool.push(this.Nodefactory(value));
        }
        var p ={name:value.prefab.name,pool,prefab:value.prefab,path:value.path}
        this.PrefabPool.push(p);
        return p;
    }
    onLoad()
    {
        if(!this.isStatic)
        {
            this.PrefabPoolInit();
        }

    }
    pop(name:string|number):cc.Node
    {
        var rePool = null;
        if(typeof name === 'string')
        {
            rePool = this.PrefabPool.find(value=>value.name===name);
        }
        else if(typeof name === 'number')
        [
            rePool = this.PrefabPool.length>name?this.PrefabPool[name]:null
        ]
        if(rePool)
        {
            var renode = rePool.pool.pop();
            if(!renode)
            {
                renode = this.Nodefactory(rePool)
                rePool.pool.push(renode);
                rePool.pool.pop();
            }
            return renode;
        }
    }
    pop_NotCallback(name:string|number):cc.Node
    {
        var rePool = null;
        if(typeof name === 'string')
        {
            rePool = this.PrefabPool.find(value=>value.name===name);
        }
        else if(typeof name === 'number')
        [
            rePool = this.PrefabPool.length>name?this.PrefabPool[name]:null
        ]
        if(rePool)
        {
            var renode = rePool.pool.pop_NotCallback();
            if(!renode)
            {
                renode = this.Nodefactory(rePool)
                rePool.pool.push_NotCallback(renode);
                rePool.pool.pop_NotCallback();
            }
            return renode;
        }
    }
    async pop_path(path:string,...reuseValue)
    {
        var result = this.PrefabPool.find(value=>value.path===path);
        if(!result)
        {
            var prefab:cc.Prefab =  await PrefabFactor.LoadRes(path,cc.Prefab);
            result = this.LPoolInit({prefab:prefab,path:path})
        }
        var renode = result.pool.pop.apply(result.pool,reuseValue)
        if(!renode)
        {
            renode = this.Nodefactory(result);
            renode['__poolInit'] = true;
            //result.pool.push(renode);
        }
        return renode;
        
    }
    push(node:cc.Node,name?:string)
    {
        var prefabName = name?name:node['__factoryName'];
        if(!prefabName)
        {
            if(CC_DEBUG)
            {
                console.warn('node not have name');
            }
        }
        var rePool = this.PrefabPool.find(value=>value.name===prefabName);
        if(rePool)
        {
            rePool.pool.push(node);
        }
        else
        {
            if(CC_DEBUG)
            {
                console.warn("Pool not find name:%s",prefabName)
            }
        }
    }


    // update (dt) {}
}

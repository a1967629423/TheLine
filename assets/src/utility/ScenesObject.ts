// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = cc._decorator;

@ccclass
export default class ScenesObject extends cc.Component {
    private static _instance:ScenesObject = null;
    static get instance()
    {
        if(!this._instance)
        {
            var snode  = cc.find('Canvas/ScenesObject')
            if(!snode)
            {
                snode = new cc.Node("ScenesObject");
                cc.Canvas.instance.node.addChild(snode);
                this._instance = snode.addComponent(ScenesObject)
            }
            else
            {
                this._instance = snode.getComponent(ScenesObject);
            }
        }
        return this._instance;
    }
    @property
    loadModle:string = "1";
    start()
    {
        cc.loader.loadRes('SOConfig/config',(err,data)=>{
            if(err)
            {
                console.error('SOConfig/config.json not exist')
            }
            else
            {
                var json:[string[]] = data['json'];
                var loadConfig = json[this.loadModle]['children'];
                for(var key in loadConfig)
                {
                    var item = key
                    if(this.node.children.every(v=>v.name!==item))
                    {
                        var path = loadConfig[key]['prefabPath'];
                        if(path)
                        {
                            cc.loader.loadRes(path,cc.Prefab,(err,resource)=>{
                                if(err)
                                {
                                    console.error(err.message);
                                }
                                else
                                {
                                    var node = cc.instantiate(resource);
                                    this.node.addChild(node);
                                }
                            })
                        }
                        else
                        {
                            var node = new cc.Node(key);
                            this.node.addChild(node);
                        }
                    }

                }
            }
        })
    }
    onDestroy()
    {
        if(ScenesObject._instance)ScenesObject._instance = null;
    }
}

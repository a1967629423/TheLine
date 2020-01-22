window.ShaderUtitly={
    getMaterial(node){
        var comp = node.getComponent(cc.RenderComponent);
        if(comp)
        {
            return comp['_material'];
        }
        return null;
    },
    setMaterial(node,Material)
    {
        var sprite= node.getComponent(cc.RenderComponent);
        var _material = sprite._materials[0];
        if(_material!==Material)
        {
            if(sprite.spriteFrame)
            {
                let texutre = sprite.spriteFrame.getTexture();
                Material.texture = texutre;
            }
            Material.updateHash();
            sprite._materials[0] = Material;
            if(sprite._renderData)
            {
                sprite._renderData.material = Material;
                sprite._renderData._material = Material;
                sprite._spriteMaterial = Material;
            }
        }
    }
}
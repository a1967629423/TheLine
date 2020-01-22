export default class Heap<T> extends Array<T> {
    _cursor:number = 0;
    pop():T|null{
        if(this._cursor === 0)return null;
        if(this.length>this._cursor){
            return this[this._cursor--]
        }
        return null
    }
    push(v:T){
        this[++this._cursor] = v;
        return this._cursor
    }
    getLength(){
        return this._cursor;
    }
}
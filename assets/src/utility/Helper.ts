export module Helper {
    export function WebAssemblyHock(target) {

    }
    export type Point = { x: number, y: number };
    @WebAssemblyHock
    export class HitTestHelper {
        static rectb: cc.Rect = cc.rect();
        static caculatePointToLineDistance(p1: Point, p2: Point, p3: Point) {
            var y2suby1 = p2.y - p1.y
            var x1subx2 = p1.x - p2.x;
            return Math.abs(y2suby1 * p3.x + x1subx2 * p3.y + p2.x * p1.y - p2.y * p1.x) / Math.sqrt(Math.pow(y2suby1, 2) + Math.pow(x1subx2, 2));
        }
        static LineHitTest(firstPoint: Point, nextPoint: Point, testpoint: cc.Vec2, lineWidth: number) {
            var nchilder = firstPoint;
            var nextchilder = nextPoint
            var rectb = this.rectb;
            if (nextchilder) {
                if (nextchilder.x < nchilder.x) {
                    rectb.x = nextchilder.x;
                    rectb.xMax = nchilder.x;
                }
                else {
                    rectb.x = nchilder.x;
                    rectb.xMax = nextchilder.x
                }
                if (nextchilder.x === nchilder.x) {
                    rectb.x = nextchilder.x - lineWidth / 2;
                    rectb.xMax = nextchilder.x + lineWidth / 2;
                }
                if (nextchilder.y < nchilder.y) {
                    rectb.y = nextchilder.y;
                    rectb.yMax = nchilder.y
                } else {
                    rectb.y = nchilder.y; 0
                    rectb.yMax = nextchilder.y;
                }
                if (nextchilder.y === nchilder.y) {
                    rectb.y = nextchilder.y - lineWidth / 2;
                    rectb.yMax = nextchilder.y + lineWidth / 2;
                }
                if (rectb.contains(testpoint)) {
                    var d = this.caculatePointToLineDistance(nchilder, nextchilder, testpoint);
                    if (d <= lineWidth) {
                        return true;
                    }
                }
            }
            return false;
        }
        static caculatePointDistance(p1: Point, p2: Point) {
            return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2))
        }
        static CircleHitTest(p1: Point, p2: Point, r: number) {
            return this.caculatePointDistance(p1, p2) < r;
        }
        /**http://alienryderflex.com/polygon/
         * 射线判断点是否存在于多边形中
         * 注：若点击到边缘有可能不准确
         * @param points 多边形点集
         * @param hitPoint 测试点
         */
        static RayPolygonHitTest(points: Point[], hitPoint: Point) {
            var length = points.length;
            if (length < 3) return false;
            var result = false;
            for (var i = 0, j = length - 1; i < length; i++) {
                var p1 = points[i];
                var p2 = points[j];
                if (p1.y < hitPoint.y && p2.y >= hitPoint.y || p2.y < hitPoint.y && p1.y >= hitPoint.y) {
                    if (p1.x + (hitPoint.y - p1.y) / (p2.y - p1.y) * (p2.x - p1.x) < hitPoint.x) {
                        result = !result;
                    }
                }
                j = i;
            }
            return result;
        }

    }
    export function getFunctionName(callee:Function):string{
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
    export class GraphicsHelper {
        static GetTrianglePoints(height: number, length: number, angle: number) {
            var points: cc.Vec2[] = [];
            points.push(cc.v2(0, 0));
            points.push(cc.v2(0, length));
            points.push(cc.v2(height * Math.cos(angle), height * Math.sin(angle)));
        }
        static setAnchor(points: Point[], AnchorPoint: Point) {

        }
    }
    export module TDMath {
        export function Rotate(p:Point,r:number) {
            return {x:p.x*Math.cos(r)-p.y*Math.sin(r),y:p.x*Math.sin(r)+p.y*Math.cos(r)}
        }
    }
    export var tween = {
        easeInQuad: function (pos) {
            return Math.pow(pos, 2);
        },

        easeOutQuad: function (pos) {
            return -(Math.pow((pos - 1), 2) - 1);
        },

        easeInOutQuad: function (pos) {
            if ((pos /= 0.5) < 1) return 0.5 * Math.pow(pos, 2);
            return -0.5 * ((pos -= 2) * pos - 2);
        },

        easeInCubic: function (pos) {
            return Math.pow(pos, 3);
        },

        easeOutCubic: function (pos) {
            return (Math.pow((pos - 1), 3) + 1);
        },

        easeInOutCubic: function (pos) {
            if ((pos /= 0.5) < 1) return 0.5 * Math.pow(pos, 3);
            return 0.5 * (Math.pow((pos - 2), 3) + 2);
        },

        easeInQuart: function (pos) {
            return Math.pow(pos, 4);
        },

        easeOutQuart: function (pos) {
            return -(Math.pow((pos - 1), 4) - 1)
        },

        easeInOutQuart: function (pos) {
            if ((pos /= 0.5) < 1) return 0.5 * Math.pow(pos, 4);
            return -0.5 * ((pos -= 2) * Math.pow(pos, 3) - 2);
        },

        easeInQuint: function (pos) {
            return Math.pow(pos, 5);
        },

        easeOutQuint: function (pos) {
            return (Math.pow((pos - 1), 5) + 1);
        },

        easeInOutQuint: function (pos) {
            if ((pos /= 0.5) < 1) return 0.5 * Math.pow(pos, 5);
            return 0.5 * (Math.pow((pos - 2), 5) + 2);
        },

        easeInSine: function (pos) {
            return -Math.cos(pos * (Math.PI / 2)) + 1;
        },

        easeOutSine: function (pos) {
            return Math.sin(pos * (Math.PI / 2));
        },

        easeInOutSine: function (pos) {
            return (-.5 * (Math.cos(Math.PI * pos) - 1));
        },

        easeInExpo: function (pos) {
            return (pos == 0) ? 0 : Math.pow(2, 10 * (pos - 1));
        },

        easeOutExpo: function (pos) {
            return (pos == 1) ? 1 : -Math.pow(2, -10 * pos) + 1;
        },

        easeInOutExpo: function (pos) {
            if (pos == 0) return 0;
            if (pos == 1) return 1;
            if ((pos /= 0.5) < 1) return 0.5 * Math.pow(2, 10 * (pos - 1));
            return 0.5 * (-Math.pow(2, -10 * --pos) + 2);
        },

        easeInCirc: function (pos) {
            return -(Math.sqrt(1 - (pos * pos)) - 1);
        },

        easeOutCirc: function (pos) {
            return Math.sqrt(1 - Math.pow((pos - 1), 2))
        },

        easeInOutCirc: function (pos) {
            if ((pos /= 0.5) < 1) return -0.5 * (Math.sqrt(1 - pos * pos) - 1);
            return 0.5 * (Math.sqrt(1 - (pos -= 2) * pos) + 1);
        },

        easeOutBounce: function (pos) {
            if ((pos) < (1 / 2.75)) {
                return (7.5625 * pos * pos);
            } else if (pos < (2 / 2.75)) {
                return (7.5625 * (pos -= (1.5 / 2.75)) * pos + .75);
            } else if (pos < (2.5 / 2.75)) {
                return (7.5625 * (pos -= (2.25 / 2.75)) * pos + .9375);
            } else {
                return (7.5625 * (pos -= (2.625 / 2.75)) * pos + .984375);
            }
        },

        easeInBack: function (pos) {
            var s = 1.70158;
            return (pos) * pos * ((s + 1) * pos - s);
        },

        easeOutBack: function (pos) {
            var s = 1.70158;
            return (pos = pos - 1) * pos * ((s + 1) * pos + s) + 1;
        },

        easeInOutBack: function (pos) {
            var s = 1.70158;
            if ((pos /= 0.5) < 1) return 0.5 * (pos * pos * (((s *= (1.525)) + 1) * pos - s));
            return 0.5 * ((pos -= 2) * pos * (((s *= (1.525)) + 1) * pos + s) + 2);
        },

        elastic: function (pos) {
            return -1 * Math.pow(4, -8 * pos) * Math.sin((pos * 6 - 1) * (2 * Math.PI) / 2) + 1;
        },

        swingFromTo: function (pos) {
            var s = 1.70158;
            return ((pos /= 0.5) < 1) ? 0.5 * (pos * pos * (((s *= (1.525)) + 1) * pos - s)) :
                0.5 * ((pos -= 2) * pos * (((s *= (1.525)) + 1) * pos + s) + 2);
        },

        swingFrom: function (pos) {
            var s = 1.70158;
            return pos * pos * ((s + 1) * pos - s);
        },

        swingTo: function (pos) {
            var s = 1.70158;
            return (pos -= 1) * pos * ((s + 1) * pos + s) + 1;
        },

        bounce: function (pos) {
            if (pos < (1 / 2.75)) {
                return (7.5625 * pos * pos);
            } else if (pos < (2 / 2.75)) {
                return (7.5625 * (pos -= (1.5 / 2.75)) * pos + .75);
            } else if (pos < (2.5 / 2.75)) {
                return (7.5625 * (pos -= (2.25 / 2.75)) * pos + .9375);
            } else {
                return (7.5625 * (pos -= (2.625 / 2.75)) * pos + .984375);
            }
        },

        bouncePast: function (pos) {
            if (pos < (1 / 2.75)) {
                return (7.5625 * pos * pos);
            } else if (pos < (2 / 2.75)) {
                return 2 - (7.5625 * (pos -= (1.5 / 2.75)) * pos + .75);
            } else if (pos < (2.5 / 2.75)) {
                return 2 - (7.5625 * (pos -= (2.25 / 2.75)) * pos + .9375);
            } else {
                return 2 - (7.5625 * (pos -= (2.625 / 2.75)) * pos + .984375);
            }
        },

        easeFromTo: function (pos) {
            if ((pos /= 0.5) < 1) return 0.5 * Math.pow(pos, 4);
            return -0.5 * ((pos -= 2) * Math.pow(pos, 3) - 2);
        },

        easeFrom: function (pos) {
            return Math.pow(pos, 4);
        },

        easeTo: function (pos) {
            return Math.pow(pos, 0.25);
        },

        linear: function (pos) {
            return pos
        },

        sinusoidal: function (pos) {
            return (-Math.cos(pos * Math.PI) / 2) + 0.5;
        },

        reverse: function (pos) {
            return 1 - pos;
        },

        mirror: function (pos, transition) {
            transition = transition || tween.sinusoidal;
            if (pos < 0.5)
                return transition(pos * 2);
            else
                return transition(1 - (pos - 0.5) * 2);
        },

        flicker: function (pos) {
            var pos = pos + (Math.random() - 0.5) / 5;
            return tween.sinusoidal(pos < 0 ? 0 : pos > 1 ? 1 : pos);
        },

        wobble: function (pos) {
            return (-Math.cos(pos * Math.PI * (9 * pos)) / 2) + 0.5;
        },

        pulse: function (pos, pulses) {
            return (-Math.cos((pos * ((pulses || 5) - .5) * 2) * Math.PI) / 2) + .5;
        },

        blink: function (pos, blinks) {
            return Math.round(pos * (blinks || 5)) % 2;
        },

        spring: function (pos) {
            return 1 - (Math.cos(pos * 4.5 * Math.PI) * Math.exp(-pos * 6));
        },

        none: function (pos) {
            return 0
        },

        full: function (pos) {
            return 1
        }
    }

}
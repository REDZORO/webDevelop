/*  animate是动画的封装函数
 *  @param1 elem是表示运动对象
 *  @param2 targetJSON表示运动终点的状态
 *  @param3 time表示运动总时间
 *  @param4 tweenString表示缓冲描述     可选
 *  @param5 callback表示回调函数    可选
 *  1)修改变量名frameNumber
 *  2)回调函数中的this就是这个运动对象elem
 *  3）增加缓冲功能
 *  4）函数的重载
 */
function animate(elem, targetJSON, time, tweenString, callback) {
    //函数的重载可能用户传入的参数不一样就要进行判断
    if (arguments.length < 3 || typeof arguments[0] != "object" || typeof arguments[1] != "object" || typeof arguments[2] != "number") {
        throw new Error("Sorry arguments inputing by user is error ")
        return;
    } else if (arguments.length == 3) {
        tweenString = "Linear";
        callback = null;
    } else if (arguments.length == 4) {
        switch(typeof arguments[3]){
			case "string" : 
				//用户传进来的是缓冲描述词儿，所以就把callback补为null
				callback = null;
				break;
			case "function" : 
				callback = arguments[3];
				arguments[3] = "Linear";
				break;
			default : 
				throw new Error("抱歉，第4个参数要么是缓冲描述词，要么是回调函数，请检查！");
		}
    }

    //动画帧率
    var interval;
    //根据高低级浏览器设置不同的interval值
    if (window.navigator.userAgent.indexOf("MSIE") != -1) {
        interval = 50;
    } else {
        interval = 20;
    }
    //信号量
    // var semaphoreJSON = {}
    //强行给我们的动画元素增加一个isanimated的属性，是否正在运动
    elem.isanimated = true;
    //初始状态等同于信号量
    var originalJSON = {};
    //变化量
    var deltaJSON = {};
    //当前计算样式的值
    for (var k in targetJSON) {
        originalJSON[k] = parseFloat(fetchComputedStyle(elem, k));
        targetJSON[k] = parseFloat(targetJSON[k]);
        deltaJSON[k] = targetJSON[k] - originalJSON[k];
    }
    // console.log(originalJSON);
    // console.log(targetJSON);
    // console.log(originalJSON);
    //执行的总帧数
    var maxFrameNumber = time / interval;
    //当前帧编号
    var frameNumber = 0;
    //某帧处在的位置临时变量
    var tweenParam;
    //定时器
    var timer = setInterval(function () {
        for (var k in originalJSON) {
            //这一帧该处在的位置
            tweenParam = Tween[tweenString](frameNumber, originalJSON[k], deltaJSON[k], maxFrameNumber);
            //根据是否是opacity设置单位
            if (k != "opacity") {
                elem.style[k] = tweenParam + "px";
            } else {
                elem.style[k] = tweenParam;
                elem.style.fliter = "alpha(opacity=" + tweenParam * 100 + ")";
            }
        }

        frameNumber++;
        if (frameNumber == maxFrameNumber) {
            //次数到达进行停表并进行位置微调
            for (var k in targetJSON) {
                if (k != "opacity") {
                    elem.style[k] = targetJSON[k] + "px";
                } else {
                    elem.style[k] = targetJSON[k];
                    elem.style.fliter = "alpha(opacity=" + (targetJSON[k] * 100) + ")";
                }
            }
            //停表
            clearInterval(timer);
            //拿掉是否在动属性，设为false
            elem.isanimated = false;
            //回调函数的调用,实例化this的对象
            callback && callback.apply(elem);
        }

    }, interval);
    //拿到css的样式属性及其值
    function fetchComputedStyle(obj, property) {
        if (window.getComputedStyle) {
            //将用户输入的驼峰字符串转化成带连字符的css属性
            property = property.replace(/([A-Z])/g, function (match, $1) {
                return "-" + $1.toLowerCase();
            });
            return window.getComputedStyle(obj)[property];
        } else {
            //IE只认驼峰
            property = property.replace(/\-([a-z])/g, function (match, $1) {
                return $1.toUpperCase();
            });
            return obj.currentStyle[property];
        }
    }

    //  缓冲的各种公式 (t,b,c,d)表示(当前帧编号，起始位置，变化量，总帧数)
    var Tween = {
        Linear: function (t, b, c, d) {
            return c * t / d + b;
        },
        //二次的
        QuadEaseIn: function (t, b, c, d) {
            return c * (t /= d) * t + b;
        },
        QuadEaseOut: function (t, b, c, d) {
            return -c * (t /= d) * (t - 2) + b;
        },
        QuadEaseInOut: function (t, b, c, d) {
            if ((t /= d / 2) < 1) return c / 2 * t * t + b;
            return -c / 2 * ((--t) * (t - 2) - 1) + b;
        },
        //三次的
        CubicEaseIn: function (t, b, c, d) {
            return c * (t /= d) * t * t + b;
        },
        CubicEaseOut: function (t, b, c, d) {
            return c * ((t = t / d - 1) * t * t + 1) + b;
        },
        CubicEaseInOut: function (t, b, c, d) {
            if ((t /= d / 2) < 1) return c / 2 * t * t * t + b;
            return c / 2 * ((t -= 2) * t * t + 2) + b;
        },
        //四次的
        QuartEaseIn: function (t, b, c, d) {
            return c * (t /= d) * t * t * t + b;
        },
        QuartEaseOut: function (t, b, c, d) {
            return -c * ((t = t / d - 1) * t * t * t - 1) + b;
        },
        QuartEaseInOut: function (t, b, c, d) {
            if ((t /= d / 2) < 1) return c / 2 * t * t * t * t + b;
            return -c / 2 * ((t -= 2) * t * t * t - 2) + b;
        },
        QuartEaseIn: function (t, b, c, d) {
            return c * (t /= d) * t * t * t * t + b;
        },
        QuartEaseOut: function (t, b, c, d) {
            return c * ((t = t / d - 1) * t * t * t * t + 1) + b;
        },
        QuartEaseInOut: function (t, b, c, d) {
            if ((t /= d / 2) < 1) return c / 2 * t * t * t * t * t + b;
            return c / 2 * ((t -= 2) * t * t * t * t + 2) + b;
        },
        //正弦的
        SineEaseIn: function (t, b, c, d) {
            return -c * Math.cos(t / d * (Math.PI / 2)) + c + b;
        },
        SineEaseOut: function (t, b, c, d) {
            return c * Math.sin(t / d * (Math.PI / 2)) + b;
        },
        SineEaseInOut: function (t, b, c, d) {
            return -c / 2 * (Math.cos(Math.PI * t / d) - 1) + b;
        },
        ExpoEaseIn: function (t, b, c, d) {
            return (t == 0) ? b : c * Math.pow(2, 10 * (t / d - 1)) + b;
        },
        ExpoEaseOut: function (t, b, c, d) {
            return (t == d) ? b + c : c * (-Math.pow(2, -10 * t / d) + 1) + b;
        },
        ExpoEaseInOut: function (t, b, c, d) {
            if (t == 0) return b;
            if (t == d) return b + c;
            if ((t /= d / 2) < 1) return c / 2 * Math.pow(2, 10 * (t - 1)) + b;
            return c / 2 * (-Math.pow(2, -10 * --t) + 2) + b;
        },
        CircEaseIn: function (t, b, c, d) {
            return -c * (Math.sqrt(1 - (t /= d) * t) - 1) + b;
        },
        CircEaseOut: function (t, b, c, d) {
            return c * Math.sqrt(1 - (t = t / d - 1) * t) + b;
        },
        CircEaseInOut: function (t, b, c, d) {
            if ((t /= d / 2) < 1) return -c / 2 * (Math.sqrt(1 - t * t) - 1) + b;
            return c / 2 * (Math.sqrt(1 - (t -= 2) * t) + 1) + b;
        },
        ElasticEaseIn: function (t, b, c, d, a, p) {
            if (t == 0) return b;
            if ((t /= d) == 1) return b + c;
            if (!p) p = d * .3;
            if (!a || a < Math.abs(c)) {
                a = c;
                var s = p / 4;
            } else var s = p / (2 * Math.PI) * Math.asin(c / a);
            return -(a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
        },
        ElasticEaseOut: function (t, b, c, d, a, p) {
            if (t == 0) return b;
            if ((t /= d) == 1) return b + c;
            if (!p) p = d * .3;
            if (!a || a < Math.abs(c)) {
                a = c;
                var s = p / 4;
            } else var s = p / (2 * Math.PI) * Math.asin(c / a);
            return (a * Math.pow(2, -10 * t) * Math.sin((t * d - s) * (2 * Math.PI) / p) + c + b);
        },
        ElasticEaseInOut: function (t, b, c, d, a, p) {
            if (t == 0) return b;
            if ((t /= d / 2) == 2) return b + c;
            if (!p) p = d * (.3 * 1.5);
            if (!a || a < Math.abs(c)) {
                a = c;
                var s = p / 4;
            } else var s = p / (2 * Math.PI) * Math.asin(c / a);
            if (t < 1) return -.5 * (a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
            return a * Math.pow(2, -10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p) * .5 + c + b;
        },
        //冲过头系列
        BackEaseIn: function (t, b, c, d, s) {
            if (s == undefined) s = 1.70158;
            return c * (t /= d) * t * ((s + 1) * t - s) + b;
        },
        BackEaseOut: function (t, b, c, d, s) {
            if (s == undefined) s = 1.70158;
            return c * ((t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b;
        },
        BackEaseInOut: function (t, b, c, d, s) {
            if (s == undefined) s = 1.70158;
            if ((t /= d / 2) < 1) return c / 2 * (t * t * (((s *= (1.525)) + 1) * t - s)) + b;
            return c / 2 * ((t -= 2) * t * (((s *= (1.525)) + 1) * t + s) + 2) + b;
        },
        //弹跳系列
        BounceEaseIn: function (t, b, c, d) {
            return c - Tween.BounceEaseOut(d - t, 0, c, d) + b;
        },
        BounceEaseOut: function (t, b, c, d) {
            if ((t /= d) < (1 / 2.75)) {
                return c * (7.5625 * t * t) + b;
            } else if (t < (2 / 2.75)) {
                return c * (7.5625 * (t -= (1.5 / 2.75)) * t + .75) + b;
            } else if (t < (2.5 / 2.75)) {
                return c * (7.5625 * (t -= (2.25 / 2.75)) * t + .9375) + b;
            } else {
                return c * (7.5625 * (t -= (2.625 / 2.75)) * t + .984375) + b;
            }
        },
        BounceEaseInOut: function (t, b, c, d) {
            if (t < d / 2) return Tween.BounceEaseIn(t * 2, 0, c, d) * .5 + b;
            else return Tween.BounceEaseOut(t * 2 - d, 0, c, d) * .5 + c * .5 + b;
        }
    }
}
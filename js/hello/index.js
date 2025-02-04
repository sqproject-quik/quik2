const notice = require("../notice/index");
const { SettingItem, SettingGroup, mainSetting } = require("../setting/index");
const { storage } = require("../storage");
const toast = require("../toast");
const util = require("../util");

var sto = storage('hello', {
    sync: true,
    title: "QUIK问候",
    desc: "QUIK问候配置文件"
});


if (!sto.get('init')) {
    sto.set('name', '');
    sto.set('birth', '');
    sto.set('init', true);
    sto.set('enable', true);
}


var sg = new SettingGroup({
    title: "问候",
    index: 1,
});
mainSetting.addNewGroup(sg);

var si1 = new SettingItem({
    type: "boolean",
    title: "启用问候",
    message: "即每日打开页面时自动弹出的问候",
    get: function () {
        return sto.get('enable');
    },
    callback: function (v) {
        sto.set('enable', v);
        if (v) {
            si2.show();
            si3.show();
        } else {
            si2.hide();
            si3.hide();
        }
    }
})

var si2 = new SettingItem({
    type: "string",
    title: "称呼",
    message: "问候时的称呼",
    get: function () {
        return sto.get('name');
    },
    callback: function (v) {
        sto.set('name', v);
    }
})

var si3 = new SettingItem({
    type: "string",
    title: "生日",
    message: "格式：月日，如：0910（也许我们会祝你生日快乐呢？）",
    get: function () {
        return sto.get('birth');
    },
    check: function (v) {
        if (v == '') return true;
        var isv = /^[0-9]{4}$/.test(v);
        if (!isv) {
            toast.show("格式错误，请重新输入");
        }
        return isv;
    },
    callback: function (v) {
        sto.set('birth', v);
    }
})

sg.addNewItem(si1);
sg.addNewItem(si2);
sg.addNewItem(si3);

var times = {
    early: ["早安！$0", "$1你是怎么做到这么早起的！", "一大早就开始工作吗$2？那有点辛苦哦"],
    am: ["上午好！$0", "$1听说早起的人运气会好很多，不知道是不是真的", "$1我算了一卦，今天是属于你的吉日！"],
    noon: ["中午好！$0", "$1你是要来找电子榨菜吗？"],
    pm: ["下午好！$0"],
    night: ["晚上好！$0"],
    midnight: ["已经很晚了哦$2，早点休息吧！", "不要在意他人的看法，你独一无二，你是你自己的一束光", "你的身体是为了你的一生服务的，而不是为了QUIK"],
    ev: ["你好$2，我是天使", "不要在意他人的看法，你独一无二，你是你自己的一束光", "你的身体是为了你的一生服务的，而不是为了QUIK"]
}

function randomGet(arr) {
    var r;
    if (arr.length == 1) {
        r = arr[0];
    } else {
        if (Math.random() < 0.6) {
            r = arr[0];
        } else {
            r = arr[Math.floor(Math.random() * arr.length - 1) + 1];
        }
    }
    return r.replace("$0", sto.get('name')).replace("$1", sto.get('name') ? sto.get('name') + '，' : '').replace("$2", sto.get('name') ? '，' + sto.get('name') : '');
}

function sayHello(h) {
    if (h >= 0 && h <= 1) {
        toast.show(randomGet(times.midnight))
    }
    if (2 <= h && h <= 4) {
        toast.show(randomGet(times.ev))
    }
    if (5 <= h && h <= 7) {
        toast.show(randomGet(times.early))
    }
    if (8 <= h && h <= 11) {
        toast.show(randomGet(times.am))
    }
    if (12 <= h && h <= 13) {
        toast.show(randomGet(times.noon))
    }
    if (14 <= h && h <= 18) {
        toast.show(randomGet(times.pm))
    }
    if (19 <= h && h <= 21) {
        toast.show(randomGet(times.night))
    }
    if (h >= 22) {
        toast.show(randomGet(times.midnight))
    }
}

if (sto.get('enable')) {
    if (!sessionStorage.getItem('hello')) {
        sayHello(new Date().getHours());
        util.xhr('https://static-wzdh.2345.com/tools/yjc?date=' + formatDate(new Date()), function (res) {
            res = JSON.parse(res);
            if (res.code == 200) {
                if (res.data.html.jiri) {
                    new notice({
                        title: "QUIK问候",
                        content: "今天是" + (res.data.html.jiri == "春节" ? "春节！祝你新年快乐！" : res.data.html.jiri)
                    }).show()
                }
                if (res.data.html.jiqi) {
                    new notice({
                        title: "QUIK问候",
                        content: "今天是" + res.data.html.jiqi
                    }).show()
                }
            }
        })
        sessionStorage.setItem('hello', 'yet');
    }

} else {
    si2.hide();
    si3.hide();
}

function formatDate(date) {
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var day = date.getDate();

    function a0(a) {
        return a < 10 ? '0' + a : a;
    }
    return year + a0(month) + a0(day);
}



if (sto.get('birth')) {
    var b = sto.get('birth');
    var m = b.substr(0, 2);
    var d = b.substr(2, 4);
    var n = new Date();
    if (n.getMonth() + 1 == m && n.getDate() == d) {
        new notice({
            title: "生日快乐",
            content: "今天是你的生日！（反正你是这么填的）无论今天有没有人祝福你，总之，生日快乐！！！"
        }).show()
    }
}


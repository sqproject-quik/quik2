const notice = require("./index");
const {storage} = require("../storage");
const util = require("../util");

// 一些重要通知的推送
var tuisongsto = storage('tuisong');
util.initSet(tuisongsto, 'd', 0);
var last_d = tuisongsto.get('d');
console.log('t');
util.xhr('/quik-notice.json', res => {
    res = JSON.parse(res);
    if (res.date > last_d) {
        setTimeout(() => {
            tuisongsto.set('d', res.date);
        }, 10000)

        var tsn = new notice({
            content: res.content,
            title: res.title,
            btns: res.btns.map((v) => {
                var fn;
                if (v.link) {
                    console.log('link');
                    fn = () => {
                        tsn.hide();
                        window.open(v.link)
                    }
                } else {
                    console.log('hide');
                    fn = () => {
                        tsn.hide();
                    }
                }
                return {
                    text: v.text,
                    style: v.style,
                    click: fn
                }
            })
        })

        tsn.show();

        console.log(tsn);
    }
}, () => {
    // 请求失败
    console.log('通知数据请求失败')
})
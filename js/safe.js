let {storage}=require('./storage');
let {SettingGroup,SettingItem, mainSetting}=require('./setting/index');
const { cateWidthShiPei } = require('./link/index');
const util = require('./util');
const { icon } = require('./iconc');
const notice=require('./notice');
const { alert, confirm, prompt } = require('./dialog/dialog_utils');

var initsto = storage('safe');
window.addEventListener('hashchange', hashcl);
window.addEventListener('visibilitychange', () => {
    if (document.visibilityState == 'hidden') {
        document.body.style.display = 'none';
    } else {
        document.body.style.display = 'block';
        cateWidthShiPei();
    }
})
function hashcl() {
    var hash = location.hash.slice(1), cjhash;
    if (hash.indexOf(';') != -1) {
        cjhash = hash.split(';')[0];
        hash = hash.split(';')[1];
    }
    if (hash == 'safe') {
        location.hash = '#' + (cjhash ? cjhash + ';' : '');
        window.addon_ = true;
        alert('已阻止所有插件运行，请修改设置或删除插件');
    }
}
hashcl();

var gaoji = new SettingGroup({
    title: "高级",
    index: 5
})

var xnse = new SettingItem({
    title: "性能模式",
    message: "强制关闭所有滤镜和动画效果",
    index: 1,
    type: "boolean",
    get() {
        return !!initsto.get('xnse')
    },
    callback(n) {
        initsto.set('xnse', n);
        doxnse(n);
    }
});
gaoji.addNewItem(xnse);

var clse = new SettingItem({
    title: "清除数据",
    message: "清除QUIK起始页的所有数据",
    index: 2,
    type: "null",
    callback() {
        confirm('确定要清除所有数据吗？', r => {
            if (r) {
                function c() {
                    prompt('请在下方输入“clearAll”，并再次确定是否要清除所有数据，此操作无法恢复。', t => {
                        if (t == 'clearAll') {
                            var k = storage('oobe')
                            var s = k.getAll();
                            localStorage.quik2 = JSON.stringify({
                                oobe: s
                            })
                            localforage.clear().then(() => {
                                location.reload();
                            });
                        } else {
                            t && c();
                        }
                    })
                }
                c();
            }
        });
    }
});
gaoji.addNewItem(clse);
var cjup = new SettingItem({
    title: "强制更新",
    message: "强行从远程获取最新版本并更新",
    index: 2,
    type: "null",
    callback() {
        confirm('确定要强制更新吗？', r => {
            if (r) {
                if (window.swReg) {
                    if (window.isInframe && location.href.indexOf('://quik.42web.io/') != -1) {
                        alert('因安全原因，扩展程序无法进行强制更新，请在网页端更新', function () {
                            window.open('https://quik.42web.io/?forceUpdate=1');
                        });
                    } else {
                        window.swReg.active.postMessage('update');
                        new notice({
                            title: "更新提示",
                            content: "已向后台发送更新请求，请耐心等待。",
                        }).show();
                    }

                } else {
                    alert('更新完成', () => {
                        location.reload();
                    })
                }
            }
        });
    }
});
gaoji.addNewItem(cjup);

mainSetting.addNewGroup(gaoji);

function doxnse(n) {
    if (n) {
        var s = util.element('style');
        s.id = 'xnse';
        s.innerHTML = '*{filter:none!important;backdrop-filter:none!important;animation:none!important;transition:none!important;}';
        document.head.append(s);
    } else {
        try {
            document.getElementById('xnse').remove();
        } catch (error) { }
    }
}

doxnse(!!initsto.get('xnse'));

window.addEventListener('offline', ckline)
window.addEventListener('online', ckline)

var offlineIcon = new icon({
    content: util.getGoogleIcon('f239'),
    offset: "br",
    important: true
})
offlineIcon.getIcon().style.color = 'red';

var offlineNotice = new notice({
    title: "断网提醒",
    content: "您的网络已断开，请尽快重连！"
})

function ckline() {
    if (!window.navigator.onLine) {
        offlineNotice.show()
        offlineNotice.focus();
        offlineIcon.show();
    } else {
        offlineNotice.hide();
        offlineIcon.hide();
    }
}

ckline();
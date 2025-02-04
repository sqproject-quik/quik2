const dialog = require("../dialog");
const { confirm } = require("../dialog/dialog_utils");
const { icon } = require("../iconc");
const notice = require("../notice");
const { storage } = require("../storage");
const util = require("../util");
const { getJSON } = require("./core");
const addon=require('../addon')


var initsto = storage('websync');
console.log(initsto.getAll());
if (!initsto.get('wait')) {
    initsto.set('wait', []);
}
var nsyncM = initsto.get('yesid');
if (nsyncM) {
    listenData();
}
var syncM;
function registerWebSync(syncM, session, cb) {
    if (!util.checkDetailsCorrect(syncM, ['isLogin', 'login', 'getLastReq', 'getAll', 'update', 'updateAll'])) {
        cb({
            code: -2,
            msg: "格式不正确"
        });
        return;
    }
    if (!util.checkSession(session)) {
        cb({
            code: -3,
            msg: "session不正确"
        });
        return;
    }
    if (nsyncM != session.id) {
        confirm('插件 "' + addon.getAddonById(session.id) + '" 申请提供数据云同步功能，是否同意？', r => {
            if (r) {
                nsyncM = session.id;
                initsto.set('yesid', nsyncM);
                initsto.remove('last_req')
                cb({
                    code: 0,
                    msg: "OK"
                });
                listenData();
                startSync(syncM);
            } else {
                cb({
                    code: -1,
                    msg: "用户取消"
                });
            }
        });
    } else {
        cb({
            code: 0,
            msg: "OK"
        });
        startSync(syncM).catch(e => {
            new notice({
                title: "云同步",
                content: "云同步初始化失败，请检查网络连接后刷新"
            }).show();
            console.log(e);
        });
    }
}

function abortSync() {
    syncM = null;
}

function unregister(session) {
    if (!util.checkSession(session)) {
        cb({
            code: -3,
            msg: "session不正确"
        });
        return;
    }
    if (nsyncM == session.id) {
        initsto.remove('yesid');
        initsto.remove('last_req');
        console.log(initsto.getAll());
        location.reload();
    }
}

function isSync() {
    return !!nsyncM;
}

async function startSync(a) {
    syncM = a;
    var isLogin = await syncM.isLogin();
    if (!isLogin) {
        await syncM.login();
    }
    if (isNewNow()) {
        await updateAll();
        syncChange();
    } else {
        var n = await syncData();
        if (n) {
            syncChange();
        }
    }
}

function isNewNow() {
    var hash = location.hash.slice(1);
    if (hash.indexOf(';') != -1) {
        hash = hash.split(';')[1]
    }
    if (hash == 'newnow') {
        location.hash = location.hash.replace('newnow', '');
        return true;
    }
}
var syncConfictDialog;
function drawSyncConfict() {
    syncConfictDialog = new dialog({
        content: `<div>
                <p>您的在线存档与本地存档存在冲突:</p>
                <p class="last_req"></p>
                <p>你要：</p>
            </div>
            <div class="btns">
                <div class="btn ok">从在线同步</div>
                <div class="btn cancel">本地覆盖在线</div>
            </div>`
    })
}


var syncIcon = new icon({
    content: util.getGoogleIcon('eb5a'),
    offset: "br",
    important: true
})
syncIcon.hide();

function syncData() {
    return new Promise((r, j) => {
        syncM.getLastReq().then((last_req) => {
            console.log(last_req, initsto.get('last_req'));
            if (last_req != initsto.get('last_req')) {
                var d = syncConfictDialog.getDialogDom();
                if (last_req == 'no') {
                    updateAll();
                } else {
                    var _a = new Date(last_req).toLocaleString() + "的更改"
                    util.query(d, '.last_req').innerText = _a;
                    util.query(d, '.btn.ok').onclick = () => {
                        getData();
                    }
                    util.query(d, '.btn.cancel').onclick = () => {
                        updateAll().then(r).catch(j);
                        syncConfictDialog.close();
                    }
                    if (!syncConfictDialog) {
                        drawSyncConfict();
                    }
                    setTimeout(() => {
                        syncConfictDialog.open();
                    }, 10)
                }
            } else {
                r('n')
            }
        }).catch(j);
    })
}

async function updateAll() {
    syncIcon.show();
    var al = getStorageList();
    var a = await getJSON(Object.keys(al).filter((v) => {
        return al[v] ? al[v].sync : false;
    }));
    var reqId = Date.now();
    await syncM.updateAll(a, reqId);
    initsto.set('last_req', reqId);
    initsto.set('wait', []);
    syncIcon.hide();
}

async function getData() {
    var _d = new dialog({
        content: "获取中。。。"
    })
    _d.open();
    var a = await syncM.getAll();
    _d.close();
    _importData(a);
}

function listenData() {
    console.log('listen');
    storage.on('websync', (e) => {
        console.log('websync');
        var reqId = Date.now();
        e.id = reqId
        pushChange(e);
        console.log('ps');
    })
}


function syncChange() {
    syncIcon.show();
    if (!syncM) {
        return;
    }
    var o = initsto.get('wait');
    var e = o[0];
    console.log(e);
    if (!e) return;
    syncM.update(e, (reqId) => {
        if (reqId) {
            initsto.set('last_req', reqId);
            dealChange(reqId);
            o = null;
            e = null;
            syncChange();
        } else {
            new notice({
                title: "云同步",
                content: "数据（" + new Date(reqId).toLocaleString() + "的更改）同步失败了，是否重试？",
                btns: [{
                    text: "确定",
                    click() {
                        syncChange(e);
                    }
                }, {
                    text: "取消",
                    click() { }
                }]
            }).show();
        }
    })
}

function pushChange(e) {
    console.log('pushChange');
    var o = initsto.get('wait');
    if (e.sp) {
        o.push(e);
    } else {
        for (var i = 0; i < o.length; i++) {
            if (o[i].key == e.key) {
                o.splice(i, 1);
                break;
            }
        }
        o.push({
            key: e.key,
            id: e.id
        })
    }
    initsto.set('wait', o);
    console.log('show', o);
    if (o.length == 1 && syncM) {
        console.log('sync');
        syncChange();
    }
}

function dealChange(id) {
    initsto.set('last_req', id);
    var o = initsto.get('wait');
    for (var i = 0; i < o.length; i++) {
        if (o[i].id == id) {
            o.splice(i, 1);
            break;
        }
    }
    initsto.set('wait', o);
    console.log(o, id);
    if (o.length == 0) {
        syncIcon.hide();
    }
}

addon.on('allrun', () => {
    setTimeout(() => {
        if (nsyncM && (!syncM)) {
            confirm('正在使用的云同步插件已被卸载或禁用，是否取消当前的云同步服务？', (ok) => {
                if (ok) {
                    initsto.remove('yesid');
                    initsto.remove('last_req');
                    location.reload();
                }
            })
        }
    }, 1000)
})


module.exports = {
    registerWebSync,
    unregister,
    isSync,
    abortSync
};
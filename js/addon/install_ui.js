const dialog = require('../dialog/index');
const util = require('../util');

var def_addon_icon = window.isExt ? ("chrome-extension://" + window.extid + "/assets/def_addon.png") : "./assets/def_addon.png"

function installui() {
    var n = new dialog({
        content: require('./mb/install_ui.html').replace('{deficon}', def_addon_icon),
        class: "addon_install_ui",
        clickOtherToClose: false
    });
    this._d = n;
    var d = this._d.getDialogDom();
    util.query(d, '.btns').style.display = 'none';
}

installui.prototype = {
    bind(p) {
        var _ = this;
        var d = this._d.getDialogDom();
        util.query(d, '.msg').innerText = p.statuMsg + '...';
        util.query(d, '.progress .r').style.width = p.progress * 100 + '%';
        if (p.errorCode != -1) {
            util.query(d, '.msg').innerText = p.errorMsg;
            util.query(d, '.progress').className = 'progress error';
            util.query(d, '.btns').style.display = 'block';
            util.query(d, '.btn.l').onclick =
                util.query(d, '.btn.r').onclick = () => {
                    _.hide();
                    setTimeout(() => {
                        _.destroy();
                    }, 200)
                }
        }
        if (p.waiting) {
            var e = p._waitfn;
            var d2 = p._waitd;
            if (d2.meta) {
                util.query(d, '.sth img').src = d2.meta.icon;
                util.query(d, '.sth .name').innerText = d2.meta.name;
                util.query(d, '.sth .version').innerText = '版本：' + d2.meta.version;
            }
            util.query(d, '.msg').innerText = d2.msg;
            util.query(d, '.btns').style.display = 'block';
            util.query(d, '.btn.l').onclick = () => {
                e(false)
            }
            util.query(d, '.btn.r').onclick = () => {
                e(true)
            }
        }
        p.on('status', function (s) {
            util.query(d, '.msg').innerText = s.msg;
        });
        p.on('progress', function (p) {
            util.query(d, '.progress .r').style.width = p * 100 + '%';
        });
        p.on('error', function (e) {
            util.query(d, '.msg').innerText = e.msg;
            util.query(d, '.progress').className = 'progress error';
            util.query(d, '.btns').style.display = 'block';
            util.query(d, '.btn.l').onclick =
                util.query(d, '.btn.r').onclick = () => {
                    _.hide();
                    setTimeout(() => {
                        _.destroy();
                    }, 200)
                }
        });
        p.on('wait', function (e, d2) {
            if (d2.meta) {
                util.query(d, '.sth img').src = d2.meta.icon;
                util.query(d, '.sth .name').innerText = d2.meta.name;
                util.query(d, '.sth .version').innerText = '版本：' + d2.meta.version;
            }
            util.query(d, '.msg').innerText = d2.msg;
            util.query(d, '.btns').style.display = 'block';
            util.query(d, '.btn.l').onclick = () => {
                e(false)
            }
            util.query(d, '.btn.r').onclick = () => {
                e(true)
            }
        });
        p.on('done', function () {
            _.hide();
            setTimeout(() => {
                _.destroy();
            }, 200)
        });
    },
    ask(msg, fn, de = {}) {
        var d = this._d.getDialogDom();
        util.query(d, '.sth img').src = de.img || "assets/def_addon.png";
        util.query(d, '.sth .name').innerText = de.name || "-";
        util.query(d, '.sth .version').innerText = '版本：' + de.version || '-';
        util.query(d, '.msg').innerText = msg;
        util.query(d, '.btns').style.display = 'block';
        util.query(d, '.btn.l').onclick = () => {
            fn(false);
            util.query(d, '.btns').style.display = 'none';
        };
        util.query(d, '.btn.r').onclick = () => {
            fn(true);
            util.query(d, '.btns').style.display = 'none';
        }
    },
    show() {
        this._d.open();
    },
    hide() {
        this._d.close();
    },
    destroy() {
        this._d.destroy();
    }
}

module.exports=installui;
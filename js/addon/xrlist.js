const util = require('../util');
const { addon_dialog_d } = require('./xrcore');
const core=require('./_core');
const {confirm,alert}=require('../dialog/dialog_utils')
var def_addon_icon = window.isExt ? ("chrome-extension://" + window.extid + "/assets/def_addon.png") : "./assets/def_addon.png"

var addon_l = util.query(addon_dialog_d, '.content .p.gl ul');
function xraddon(id) {
  var addon = core.getAddonBySessionId(id);
  if (addon.type == 'dev') {
    addon.name = '开发者端口：' + addon.url;
    addon.author = 'dev';
    addon.desc = '开发者端口：' + addon.url;
  }
  var li = util.query(addon_l, 'li[data-id="' + id + '"]');
  if (!li) {
    li = util.element('li');
    li.innerHTML = require('./mb/addon_item.mb.html').replace(/{deficon}/g, def_addon_icon);
    li.dataset.id = id;
    addon_l.appendChild(li);
    li.onclick = function (e) {
      addon_l.querySelectorAll('li').forEach((li) => {
        li.classList.remove('active');
      })
      this.classList.add('active');
    }
    util.query(li, '.ch_update').onclick = function () {
      st.innerHTML = '检查更新中...';
      var _ = this;
      _.style.display = '';
      core.checkUpdate(id).then(a => {
        if (!a) {
          _.style.display = 'block';
          st.innerHTML = '已是最新版本';
        } else {
          st.innerHTML = '发现新版本';
          util.query(li, '.update').style.display = 'block';
        }
      });
    }

    util.query(li, '.update').onclick = function () {
      st.innerHTML = '更新中...';
      var _ = this;
      _.style.display = '';
      core.update(id).then(r => {
        if (r.error) {
          st.innerHTML = '更新失败:' + r.msg;
          _.style.display = 'block';
        } else {
          xraddon(id);
          st.innerHTML = '更新完成，刷新生效';
          util.query(li, '.ch_update').style.display = 'inline-block';
        }
      });
    }
    util.query(li, '.enable').onclick = function () {
      st.innerHTML = '已启用，刷新生效'
      core.enable(id);
      util.query(li, '.disable').style.display = 'block';
      util.query(li, '.disabled_state').style.display = "none";
      this.style.display = '';
    }
    util.query(li, '.disable').onclick = function () {
      st.innerHTML = '已禁用，刷新生效'
      core.disable(id);
      util.query(li, '.enable').style.display = 'block';
      util.query(li, '.disabled_state').style.display = "";
      this.style.display = '';
    }

    util.query(li, '.uninstall').onclick = function () {
      confirm('你真的要卸载吗？此操作不可恢复！', function (as) {
        if (as) {
          st.innerHTML = '正在卸载...'
          core.uninstall(id).then(r => {
            if (r.error) {
              alert('卸载出现错误：' + r.msg)
            } else {
              alert('卸载成功，刷新生效');
            }
          })
        }
      })
    }
  }
  util.query(li, '.n>img').src = addon.icon || def_addon_icon;
  util.query(li, '.n .ds .name span').innerText = addon.name;
  var ms = util.query(li, '.n .ds .message span', true);
  ms[0].innerText = addon.author || '不详';
  ms[1].innerText = addon.version || '';
  ms[2].innerText = '';
  util.query(li, '.d .desc').innerText = addon.desc || '';
  util.query(li, '.d .website').innerText = addon.website || '';
  var st = util.query(li, '.message span', true)[2];
  if (!addon.type) {
    util.query(li, '.ch_update').style.display = 'block';
  }
  if (addon.disabled) {
    util.query(li, '.enable').style.display = 'block';
    util.query(li, '.disabled_state').style.display = "";
  } else {
    util.query(li, '.disable').style.display = 'block';
    util.query(li, '.disabled_state').style.display = "none";
  }
  if (addon.marketId) {
    util.query(li, '.official_state').style.display = '';
  } else {
    util.query(li, '.official_state').style.display = 'none';
  }

}

core.getAddonList().forEach(a => {
  xraddon(a);
})

core.on('installnew', e => {
  xraddon(e.id);
})
core.on('update', e => {
  xraddon(e.id);
})

core.on('uninstall', e => {
  var li = util.query(addon_l, 'li[data-id="' + e.id + '"]');
  if (li) { li.remove() }
})

module.exports={
  xraddon
}